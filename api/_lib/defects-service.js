const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER", "SOFER_APP"]);
const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER", "SOFER_APP"]);
const DELETE_ROLES = new Set(["ADMIN"]);

let cachedOrganization = null;

async function listDefects(context) {
  const role = normalizeRole(context.role);
  if (!VIEW_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru vizualizarea defectelor.");
  }

  const organization = await getDefaultOrganization();
  const [defects, vehicles, employees] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "maintenance_logs",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "maintenance_type=eq.defect",
          "order=maintenance_date.desc,legacy_defect_id.desc"
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
          "select=id,legacy_sofer_id,user_profile_id",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const vehicleById = new Map((vehicles || []).map((item) => [item.id, item]));
  const employeeById = new Map((employees || []).map((item) => [item.id, item]));
  const linkedSoferId = text(context.linkedSoferId);

  let items = (defects || []).map((item) => mapDefectToLegacyShape(item, vehicleById, employeeById));
  if ((role === "SOFER" || role === "SOFER_APP") && linkedSoferId) {
    items = items.filter((item) => text(item.SoferID) === linkedSoferId);
  }

  return { ok: true, data: { items } };
}

async function createDefect(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Rolul curent nu poate opera defecte.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDefectPayload(payload);
  const validationError = validateDefectPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDefectByLegacyId(organization.id, normalized.DefectID);
  if (existing) {
    return { ok: false, message: "Exista deja un defect cu acest DefectID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID);
  if (!vehicle) {
    return { ok: false, message: "MasinaID este invalid." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID, payload.userId);
  if (normalized.SoferID && !employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  if (role === "SOFER" || role === "SOFER_APP") {
    if (!employee) {
      return { ok: false, message: "Nu putem identifica automat soferul curent pentru masina selectata. Verifica asignarea activa a masinii." };
    }

    const hasAccess = await driverCanUseVehicle(organization.id, employee.id, vehicle.id);
    if (!hasAccess) {
      return { ok: false, message: "Soferul poate opera doar masina asignata lui." };
    }
  }

  await supabaseRest("/rest/v1/maintenance_logs", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        employee_id: employee ? employee.id : null,
        maintenance_type: "defect",
        title: normalized.Titlu,
        description: normalized.Descriere || null,
        status: normalized.Status,
        maintenance_date: normalized.DataRaportare,
        estimated_cost: normalized.CostEstimat,
        final_cost: normalized.CostFinal,
        severity: normalized.Severitate,
        photo_url: normalized.PozaURL || null,
        legacy_defect_id: normalized.DefectID
      }
    ]
  });

  return { ok: true, message: "Defectul a fost salvat." };
}

async function updateDefect(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Rolul curent nu poate opera defecte.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDefectPayload(payload);
  const validationError = validateDefectPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDefectByLegacyId(organization.id, normalized.DefectID);
  if (!existing) {
    return { ok: false, message: "Defectul nu a fost gasit." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID);
  if (!vehicle) {
    return { ok: false, message: "MasinaID este invalid." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID, payload.userId);
  if (normalized.SoferID && !employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  if (role === "SOFER" || role === "SOFER_APP") {
    if (!employee || text(existing.employee_id) !== text(employee.id)) {
      return { ok: false, message: "Nu poti modifica defectul altui sofer." };
    }

    const hasAccess = await driverCanUseVehicle(organization.id, employee.id, vehicle.id);
    if (!hasAccess) {
      return { ok: false, message: "Soferul poate opera doar masina asignata lui." };
    }
  }

  await supabaseRest(`/rest/v1/maintenance_logs?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      employee_id: employee ? employee.id : null,
      title: normalized.Titlu,
      description: normalized.Descriere || null,
      status: normalized.Status,
      maintenance_date: normalized.DataRaportare,
      estimated_cost: normalized.CostEstimat,
      final_cost: normalized.CostFinal,
      severity: normalized.Severitate,
      photo_url: normalized.PozaURL || null
    }
  });

  return { ok: true, message: "Defectul a fost actualizat." };
}

async function deleteDefect(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge defecte.");
  }

  const organization = await getDefaultOrganization();
  const defectId = text(payload.DefectID);
  if (!defectId) {
    return { ok: false, message: "DefectID este obligatoriu." };
  }

  const existing = await findDefectByLegacyId(organization.id, defectId);
  if (!existing) {
    return { ok: false, message: "Defectul nu a fost gasit." };
  }

  await supabaseRest(`/rest/v1/maintenance_logs?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Defectul a fost sters." };
}

async function findDefectByLegacyId(organizationId, legacyDefectId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "maintenance_logs",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        "maintenance_type=eq.defect",
        `legacy_defect_id=eq.${encodeURIComponent(legacyDefectId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function resolveVehicle(organizationId, legacyVehicleId) {
  if (!legacyVehicleId) {
    return null;
  }

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

  return rows && rows[0] ? rows[0] : null;
}

async function resolveEmployee(organizationId, legacySoferId, userId) {
  if (legacySoferId) {
    const byLegacy = await supabaseRest(
      buildSelectPath(
        "employees",
        [
          "select=id,legacy_sofer_id,user_profile_id",
          `organization_id=eq.${organizationId}`,
          `legacy_sofer_id=eq.${encodeURIComponent(legacySoferId)}`,
          "limit=1"
        ].join("&")
      )
    );
    if (byLegacy && byLegacy[0]) {
      return byLegacy[0];
    }
  }

  const legacyUserId = text(userId);
  if (!legacyUserId) {
    return null;
  }

  const profiles = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,legacy_user_id",
        `organization_id=eq.${organizationId}`,
        `legacy_user_id=eq.${encodeURIComponent(legacyUserId)}`,
        "limit=1"
      ].join("&")
    )
  );

  const profile = profiles && profiles[0];
  if (!profile) {
    return null;
  }

  const employees = await supabaseRest(
    buildSelectPath(
      "employees",
      [
        "select=id,legacy_sofer_id,user_profile_id",
        `organization_id=eq.${organizationId}`,
        `user_profile_id=eq.${profile.id}`,
        "limit=1"
      ].join("&")
    )
  );

  return employees && employees[0] ? employees[0] : null;
}

async function driverCanUseVehicle(organizationId, employeeId, vehicleId) {
  if (!employeeId || !vehicleId) {
    return false;
  }

  const activeAssignments = await supabaseRest(
    buildSelectPath(
      "vehicle_assignments",
      [
        "select=id",
        `organization_id=eq.${organizationId}`,
        `vehicle_id=eq.${vehicleId}`,
        `employee_id=eq.${employeeId}`,
        "status=in.(active,activa,activ)",
        "limit=1"
      ].join("&")
    )
  );

  if (activeAssignments && activeAssignments[0]) {
    return true;
  }

  const vehicles = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=current_employee_id",
        `organization_id=eq.${organizationId}`,
        `id=eq.${vehicleId}`,
        "limit=1"
      ].join("&")
    )
  );

  const vehicle = vehicles && vehicles[0];
  return vehicle ? text(vehicle.current_employee_id) === text(employeeId) : false;
}

function mapDefectToLegacyShape(item, vehicleById, employeeById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  const employee = item.employee_id ? employeeById.get(item.employee_id) : null;

  return {
    DefectID: item.legacy_defect_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataRaportare: item.maintenance_date || "",
    Titlu: item.title || "",
    Severitate: mapSeverityFromSupabase(item.severity),
    Status: mapStatusFromSupabase(item.status),
    CostEstimat: numberOrZero(item.estimated_cost),
    CostFinal: numberOrZero(item.final_cost),
    PozaURL: item.photo_url || "",
    Descriere: item.description || "",
    Rezolvare: item.notes || ""
  };
}

function normalizeDefectPayload(payload) {
  return {
    DefectID: text(payload.DefectID),
    MasinaID: text(payload.MasinaID),
    SoferID: text(payload.SoferID),
    DataRaportare: normalizeDate(payload.DataRaportare),
    Titlu: text(payload.Titlu),
    Severitate: normalizeSeverity(payload.Severitate || "LOW"),
    Status: normalizeStatus(payload.Status || "RAPORTAT"),
    CostEstimat: toNumber(payload.CostEstimat),
    CostFinal: toNumber(payload.CostFinal),
    PozaURL: text(payload.PozaURL),
    Descriere: text(payload.Descriere)
  };
}

function validateDefectPayload(payload) {
  if (!payload.DefectID) {
    return "DefectID este obligatoriu.";
  }
  if (!payload.MasinaID) {
    return "MasinaID este obligatoriu.";
  }
  if (!payload.Titlu) {
    return "Titlul este obligatoriu.";
  }
  if (!payload.DataRaportare) {
    return "DataRaportare este obligatorie.";
  }
  if (payload.CostEstimat < 0 || payload.CostFinal < 0) {
    return "Costurile nu pot fi negative.";
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

function mapStatusFromSupabase(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) {
    return "RAPORTAT";
  }
  if (normalized === "OPEN") {
    return "RAPORTAT";
  }
  if (normalized === "IN_PROGRESS") {
    return "IN LUCRU";
  }
  if (normalized === "RESOLVED") {
    return "REZOLVAT";
  }
  if (normalized === "CLOSED") {
    return "INCHIS";
  }
  return normalized;
}

function normalizeStatus(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) {
    return "open";
  }
  if (normalized === "RAPORTAT" || normalized === "DESCHIS" || normalized === "DESCHISA" || normalized === "NOU") {
    return "open";
  }
  if (normalized === "IN LUCRU" || normalized === "IN_LUCRU") {
    return "in_progress";
  }
  if (normalized === "REZOLVAT") {
    return "resolved";
  }
  if (normalized === "INCHIS" || normalized === "INCHEIAT") {
    return "closed";
  }
  return normalized.toLowerCase();
}

function mapSeverityFromSupabase(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) {
    return "LOW";
  }
  if (normalized === "CRITICA" || normalized === "CRITICAL") {
    return "HIGH";
  }
  if (normalized === "MEDIE") {
    return "MEDIUM";
  }
  if (normalized === "MICA") {
    return "LOW";
  }
  return normalized;
}

function normalizeSeverity(value) {
  const normalized = text(value).toUpperCase();
  if (normalized === "CRITICA" || normalized === "CRITICAL" || normalized === "HIGH") {
    return "HIGH";
  }
  if (normalized === "MEDIE" || normalized === "MEDIU" || normalized === "MEDIUM") {
    return "MEDIUM";
  }
  if (normalized === "MICA" || normalized === "MIC" || normalized === "LOW") {
    return "LOW";
  }
  return normalized || "LOW";
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
  return { ok: false, message: message };
}

module.exports = {
  listDefects,
  createDefect,
  updateDefect,
  deleteDefect
};
