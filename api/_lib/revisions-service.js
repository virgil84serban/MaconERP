const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER", "SOFER_APP"]);
const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const DELETE_ROLES = new Set(["ADMIN"]);

let cachedOrganization = null;

async function listRevisions(context) {
  const role = normalizeRole(context.role);
  if (!VIEW_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru vizualizarea reviziilor.");
  }

  const organization = await getDefaultOrganization();
  const [revisions, vehicles, employees, assignments] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "maintenance_logs",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "maintenance_type=eq.revision",
          "order=maintenance_date.desc,legacy_revision_id.desc"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicle_assignments",
        [
          "select=id,vehicle_id,employee_id,status",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=id,legacy_vehicle_id,plate_number,current_employee_id",
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
  const linkedSoferId = text(context.linkedSoferId);

  let items = (revisions || []).map((item) => mapRevisionToLegacyShape(item, vehicleById, employeeById));
  if ((role === "SOFER" || role === "SOFER_APP") && linkedSoferId) {
    const assignedVehicleIds = new Set();

    (assignments || []).forEach((item) => {
      const employee = item.employee_id ? employeeById.get(item.employee_id) : null;
      const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
      const isSameDriver = employee && text(employee.legacy_sofer_id) === linkedSoferId;
      const isActive = ["ACTIV", "ACTIVA"].includes(mapAssignmentStatus(item.status));
      if (isSameDriver && isActive && vehicle) {
        assignedVehicleIds.add(text(vehicle.legacy_vehicle_id || vehicle.id));
      }
    });

    (vehicles || []).forEach((item) => {
      const employee = item.current_employee_id ? employeeById.get(item.current_employee_id) : null;
      if (employee && text(employee.legacy_sofer_id) === linkedSoferId) {
        assignedVehicleIds.add(text(item.legacy_vehicle_id || item.id));
      }
    });

    items = items.filter((item) => assignedVehicleIds.has(text(item.MasinaID)));
  }

  return { ok: true, data: { items } };
}

async function createRevision(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare revizie.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeRevisionPayload(payload);
  const validationError = validateRevisionPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findRevisionByLegacyId(organization.id, normalized.RevizieID);
  if (existing) {
    return { ok: false, message: "Exista deja o revizie cu acest RevizieID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  await supabaseRest("/rest/v1/maintenance_logs", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        employee_id: vehicle.current_employee_id || null,
        maintenance_type: "revision",
        title: normalized.TipRevizie || null,
        status: normalizeStatus(normalized.Status || "RAPORTAT"),
        maintenance_date: normalized.DataRevizie,
        odometer_km: normalized.KmLaRevizie,
        revision_type: normalized.TipRevizie || null,
        service_name: normalized.Service || null,
        final_cost: normalized.Cost,
        notes: normalized.Observatii || null,
        legacy_revision_id: normalized.RevizieID
      }
    ]
  });

  return { ok: true, message: "Revizia a fost salvata." };
}

async function updateRevision(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare revizie.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeRevisionPayload(payload);
  const validationError = validateRevisionPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findRevisionByLegacyId(organization.id, normalized.RevizieID);
  if (!existing) {
    return { ok: false, message: "Revizia nu a fost gasita." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  await supabaseRest(`/rest/v1/maintenance_logs?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      employee_id: vehicle.current_employee_id || null,
      title: normalized.TipRevizie || null,
      status: normalizeStatus(normalized.Status || "RAPORTAT"),
      maintenance_date: normalized.DataRevizie,
      odometer_km: normalized.KmLaRevizie,
      revision_type: normalized.TipRevizie || null,
      service_name: normalized.Service || null,
      final_cost: normalized.Cost,
      notes: normalized.Observatii || null
    }
  });

  return { ok: true, message: "Revizia a fost actualizata." };
}

async function deleteRevision(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge revizii.");
  }

  const organization = await getDefaultOrganization();
  const revisionId = text(payload.RevizieID);
  if (!revisionId) {
    return { ok: false, message: "RevizieID este obligatoriu." };
  }

  const existing = await findRevisionByLegacyId(organization.id, revisionId);
  if (!existing) {
    return { ok: false, message: "Revizia nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/maintenance_logs?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Revizia a fost stearsa." };
}

async function findRevisionByLegacyId(organizationId, legacyRevisionId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "maintenance_logs",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        "maintenance_type=eq.revision",
        `legacy_revision_id=eq.${encodeURIComponent(legacyRevisionId)}`,
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
          "select=id,legacy_vehicle_id,plate_number,current_employee_id",
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
        "select=id,legacy_vehicle_id,plate_number,current_employee_id",
        `organization_id=eq.${organizationId}`,
        `plate_number=eq.${encodeURIComponent(text(plateNumber).toUpperCase())}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

function mapRevisionToLegacyShape(item, vehicleById, employeeById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  const employee = item.employee_id ? employeeById.get(item.employee_id) : null;
  return {
    RevizieID: item.legacy_revision_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferCurentID: employee ? employee.legacy_sofer_id || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataRevizie: item.maintenance_date || "",
    KmLaRevizie: numberOrZero(item.odometer_km),
    TipRevizie: item.revision_type || item.title || "",
    Service: item.service_name || item.supplier || "",
    Cost: numberOrZero(item.final_cost),
    Status: mapStatusFromSupabase(item.status),
    Observatii: item.notes || ""
  };
}

function mapAssignmentStatus(value) {
  const normalized = text(value).toUpperCase();
  if (normalized === "ACTIVE") return "ACTIVA";
  if (normalized === "INACTIVE") return "INACTIVA";
  return normalized;
}

function normalizeRevisionPayload(payload) {
  return {
    RevizieID: text(payload.RevizieID),
    MasinaID: text(payload.MasinaID),
    NrInmatriculare: text(payload.NrInmatriculare).toUpperCase(),
    DataRevizie: normalizeDate(payload.DataRevizie),
    KmLaRevizie: toNumber(payload.KmLaRevizie),
    TipRevizie: text(payload.TipRevizie),
    Service: text(payload.Service),
    Cost: toNumber(payload.Cost),
    Status: text(payload.Status),
    Observatii: text(payload.Observatii)
  };
}

function validateRevisionPayload(payload) {
  if (!payload.RevizieID) return "RevizieID este obligatoriu.";
  if (!payload.MasinaID && !payload.NrInmatriculare) return "MasinaID / NrInmatriculare este obligatoriu.";
  if (!payload.DataRevizie) return "DataRevizie este obligatorie.";
  if (payload.KmLaRevizie < 0) return "KmLaRevizie nu poate fi negativ.";
  if (payload.Cost < 0) return "Costul nu poate fi negativ.";
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

function mapStatusFromSupabase(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) return "RAPORTAT";
  if (normalized === "OPEN") return "RAPORTAT";
  if (normalized === "IN_PROGRESS") return "IN LUCRU";
  if (normalized === "RESOLVED") return "REZOLVAT";
  if (normalized === "CLOSED") return "INCHIS";
  return normalized;
}

function normalizeStatus(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized || normalized === "RAPORTAT") return "open";
  if (normalized === "IN LUCRU") return "in_progress";
  if (normalized === "REZOLVAT") return "resolved";
  if (normalized === "INCHIS") return "closed";
  return normalized.toLowerCase();
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function normalizeDate(value) {
  return text(value);
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const normalized = String(value || "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrZero(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value) {
  return String(value || "").trim();
}

function denied(message) {
  return { ok: false, message };
}

module.exports = {
  listRevisions,
  createRevision,
  updateRevision,
  deleteRevision
};
