const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const DELETE_ROLES = new Set(["ADMIN"]);

async function listAssignments(context) {
  const role = normalizeRole(context && context.role);
  if (!VIEW_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru vizualizarea asignarilor.");
  }

  const organization = await getDefaultOrganization();
  const [assignments, vehicles, employees] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "vehicle_assignments",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "order=start_date.desc"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=id,legacy_vehicle_id,plate_number",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "employees",
        [
          "select=id,legacy_sofer_id",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const vehicleById = new Map((vehicles || []).map((item) => [item.id, item]));
  const employeeById = new Map((employees || []).map((item) => [item.id, item]));

  return {
    ok: true,
    data: {
      items: (assignments || []).map((item) => mapAssignmentToLegacyShape(item, vehicleById, employeeById))
    }
  };
}

async function createAssignment(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare asignare.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeAssignmentPayload(payload);
  const validationError = validateAssignmentPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findAssignmentByLegacyId(organization.id, normalized.AsignareID);
  if (existing) {
    return { ok: false, message: "Exista deja o asignare cu acest AsignareID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID);
  if (!employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  const inserted = await supabaseRest("/rest/v1/vehicle_assignments", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        employee_id: employee.id,
        assignment_code: normalized.AsignareID,
        start_date: normalized.DataStart,
        status: normalized.Status,
        end_reason: normalized.MotivIncheiere || null,
        notes: normalized.Observatii || null,
        legacy_assignment_id: normalized.AsignareID
      }
    ]
  });

  const assignment = inserted && inserted[0];
  if (!assignment) {
    throw new Error("Nu am putut salva asignarea in Supabase.");
  }

  await syncVehicleCurrentDriver(organization.id, vehicle.id);
  return { ok: true, message: "Asignarea a fost salvata." };
}

async function updateAssignment(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare asignare.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeAssignmentPayload(payload);
  const validationError = validateAssignmentPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findAssignmentByLegacyId(organization.id, normalized.AsignareID);
  if (!existing) {
    return { ok: false, message: "Asignarea nu a fost gasita." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID);
  if (!employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  const previousVehicleId = existing.vehicle_id;

  await supabaseRest(`/rest/v1/vehicle_assignments?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      employee_id: employee.id,
      start_date: normalized.DataStart,
      status: normalized.Status,
      end_reason: normalized.MotivIncheiere || null,
      notes: normalized.Observatii || null
    }
  });

  await syncVehicleCurrentDriver(organization.id, previousVehicleId);
  if (previousVehicleId !== vehicle.id) {
    await syncVehicleCurrentDriver(organization.id, vehicle.id);
  }
  return { ok: true, message: "Asignarea a fost actualizata." };
}

async function deleteAssignment(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge asignari.");
  }

  const organization = await getDefaultOrganization();
  const legacyAssignmentId = text(payload.AsignareID);
  if (!legacyAssignmentId) {
    return { ok: false, message: "AsignareID este obligatoriu." };
  }

  const existing = await findAssignmentByLegacyId(organization.id, legacyAssignmentId);
  if (!existing) {
    return { ok: false, message: "Asignarea nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/vehicle_assignments?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  await syncVehicleCurrentDriver(organization.id, existing.vehicle_id);
  return { ok: true, message: "Asignarea a fost stearsa." };
}

async function syncVehicleCurrentDriver(organizationId, vehicleId) {
  if (!vehicleId) {
    return;
  }

  const activeAssignments = await supabaseRest(
    buildSelectPath(
      "vehicle_assignments",
      [
        "select=employee_id,start_date,id",
        `organization_id=eq.${organizationId}`,
        `vehicle_id=eq.${vehicleId}`,
        "status=in.(active,activa,activ)",
        "order=start_date.desc"
      ].join("&")
    )
  );

  const latest = activeAssignments && activeAssignments[0] ? activeAssignments[0] : null;
  await supabaseRest(`/rest/v1/vehicles?id=eq.${vehicleId}`, {
    method: "PATCH",
    body: {
      current_employee_id: latest ? latest.employee_id : null
    }
  });
}

async function findAssignmentByLegacyId(organizationId, legacyAssignmentId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "vehicle_assignments",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `legacy_assignment_id=eq.${encodeURIComponent(legacyAssignmentId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function resolveVehicle(organizationId, legacyVehicleId, plateNumber) {
  if (legacyVehicleId) {
    const rows = await supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=id,legacy_vehicle_id,plate_number",
          `organization_id=eq.${organizationId}`,
          `legacy_vehicle_id=eq.${encodeURIComponent(legacyVehicleId)}`,
          "limit=1"
        ].join("&")
      )
    );
    if (rows && rows[0]) {
      return rows[0];
    }
  }

  if (!plateNumber) {
    return null;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=id,legacy_vehicle_id,plate_number",
        `organization_id=eq.${organizationId}`,
        `plate_number=eq.${encodeURIComponent(plateNumber)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function resolveEmployee(organizationId, legacySoferId) {
  if (!legacySoferId) {
    return null;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "employees",
      [
        "select=id,legacy_sofer_id",
        `organization_id=eq.${organizationId}`,
        `legacy_sofer_id=eq.${encodeURIComponent(legacySoferId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

function mapAssignmentToLegacyShape(item, vehicleById, employeeById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  const employee = item.employee_id ? employeeById.get(item.employee_id) : null;

  return {
    AsignareID: item.legacy_assignment_id || item.assignment_code || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataStart: item.start_date || "",
    Status: mapStatusFromSupabase(item.status),
    MotivIncheiere: item.end_reason || "",
    Observatii: item.notes || ""
  };
}

function normalizeAssignmentPayload(payload) {
  return {
    AsignareID: text(payload.AsignareID),
    MasinaID: text(payload.MasinaID),
    NrInmatriculare: normalizePlate(payload.NrInmatriculare),
    SoferID: text(payload.SoferID),
    DataStart: normalizeDate(payload.DataStart),
    Status: normalizeStatus(payload.Status || "ACTIVA"),
    MotivIncheiere: text(payload.MotivIncheiere),
    Observatii: text(payload.Observatii)
  };
}

function validateAssignmentPayload(payload) {
  if (!payload.AsignareID) {
    return "AsignareID este obligatoriu.";
  }
  if (!payload.MasinaID && !payload.NrInmatriculare) {
    return "MasinaID / NrInmatriculare este obligatoriu.";
  }
  if (!payload.SoferID) {
    return "SoferID este obligatoriu.";
  }
  if (!payload.DataStart) {
    return "DataStart este obligatorie.";
  }
  return "";
}

async function getDefaultOrganization() {
  if (cachedOrganization) {
    return cachedOrganization;
  }

  const code = text(process.env.SUPABASE_DEFAULT_ORG_CODE);
  const slug = text(process.env.SUPABASE_DEFAULT_ORG_SLUG);
  let query = "select=id,name,code,slug&order=created_at.asc&limit=1";

  if (code) {
    query = `select=id,name,code,slug&code=eq.${encodeURIComponent(code)}&limit=1`;
  } else if (slug) {
    query = `select=id,name,code,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  }

  const rows = await supabaseRest(buildSelectPath("organizations", query));
  const organization = rows && rows[0];
  if (!organization) {
    throw new Error("Nu exista organizatie configurata pentru Supabase.");
  }

  cachedOrganization = organization;
  return organization;
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function normalizePlate(value) {
  return text(value).toUpperCase();
}

function normalizeDate(value) {
  return text(value);
}

function normalizeStatus(value) {
  const normalized = text(value).toUpperCase();
  if (normalized === "ACTIVA" || normalized === "ACTIV") {
    return "active";
  }
  if (normalized === "INACTIVA" || normalized === "INACTIV") {
    return "inactive";
  }
  return normalized.toLowerCase() || "active";
}

function mapStatusFromSupabase(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) {
    return "ACTIVA";
  }
  if (normalized === "ACTIVE") {
    return "ACTIVA";
  }
  if (normalized === "INACTIVE") {
    return "INACTIVA";
  }
  return normalized;
}

function text(value) {
  return String(value || "").trim();
}

function denied(message) {
  return { ok: false, message };
}

let cachedOrganization = null;

module.exports = {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
