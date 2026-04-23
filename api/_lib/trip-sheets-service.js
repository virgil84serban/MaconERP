const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER", "SOFER_APP"]);
const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER", "SOFER_APP"]);
const DELETE_ROLES = new Set(["ADMIN"]);

let cachedOrganization = null;

async function listTripSheets(context) {
  const role = normalizeRole(context.role);
  if (!VIEW_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru vizualizarea foilor de parcurs.");
  }

  const organization = await getDefaultOrganization();
  const [tripSheets, vehicles, employees] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "trip_sheets",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "order=departure_date.desc,legacy_trip_sheet_id.desc"
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

  let items = (tripSheets || []).map((item) => mapTripSheetToLegacyShape(item, vehicleById, employeeById));
  if ((role === "SOFER" || role === "SOFER_APP") && linkedSoferId) {
    items = items.filter((item) => text(item.SoferID) === linkedSoferId);
  }

  return { ok: true, data: { items } };
}

async function createTripSheet(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare foaie de parcurs.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeTripSheetPayload(payload);
  const validationError = validateTripSheetPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findTripSheetByLegacyId(organization.id, normalized.FoaieParcursID);
  if (existing) {
    return { ok: false, message: "Exista deja o foaie de parcurs cu acest FoaieParcursID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID, payload.userId);
  if (!employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  if (role === "SOFER" || role === "SOFER_APP") {
    const hasAccess = await driverCanUseVehicle(organization.id, employee.id, vehicle.id);
    if (!hasAccess) {
      return { ok: false, message: "Soferul poate opera doar masina asignata lui." };
    }
  }

  await supabaseRest("/rest/v1/trip_sheets", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        employee_id: employee.id,
        trip_code: normalized.FoaieParcursID,
        departure_date: normalized.DataPlecare,
        start_location: normalized.LocPlecare || null,
        destination: normalized.Destinatie,
        trip_purpose: normalized.ScopDeplasare || null,
        odometer_start: normalized.KmPlecare,
        odometer_end: normalized.KmSosire,
        distance_km: normalized.KmParcursi,
        status: normalized.Status,
        odometer_photo_url: normalized.KmPozaURL || null,
        odometer_ocr_km: normalized.KmOCR || null,
        legacy_trip_sheet_id: normalized.FoaieParcursID
      }
    ]
  });

  await syncVehicleCurrentKm(organization.id, vehicle.id);
  return { ok: true, message: "Foaia de parcurs a fost salvata." };
}

async function updateTripSheet(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare foaie de parcurs.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeTripSheetPayload(payload);
  const validationError = validateTripSheetPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findTripSheetByLegacyId(organization.id, normalized.FoaieParcursID);
  if (!existing) {
    return { ok: false, message: "Foaia de parcurs nu a fost gasita." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employee = await resolveEmployee(organization.id, normalized.SoferID, payload.userId);
  if (!employee) {
    return { ok: false, message: "SoferID este invalid." };
  }

  if (role === "SOFER" || role === "SOFER_APP") {
    const sameDriver = text(existing.employee_id) === text(employee.id);
    if (!sameDriver) {
      return { ok: false, message: "Nu poti modifica foaia altui sofer." };
    }
    const hasAccess = await driverCanUseVehicle(organization.id, employee.id, vehicle.id);
    if (!hasAccess) {
      return { ok: false, message: "Soferul poate opera doar masina asignata lui." };
    }
  }

  const previousVehicleId = existing.vehicle_id;

  await supabaseRest(`/rest/v1/trip_sheets?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      employee_id: employee.id,
      departure_date: normalized.DataPlecare,
      start_location: normalized.LocPlecare || null,
      destination: normalized.Destinatie,
      trip_purpose: normalized.ScopDeplasare || null,
      odometer_start: normalized.KmPlecare,
      odometer_end: normalized.KmSosire,
      distance_km: normalized.KmParcursi,
      status: normalized.Status,
      odometer_photo_url: normalized.KmPozaURL || null,
      odometer_ocr_km: normalized.KmOCR || null
    }
  });

  await syncVehicleCurrentKm(organization.id, previousVehicleId);
  if (previousVehicleId !== vehicle.id) {
    await syncVehicleCurrentKm(organization.id, vehicle.id);
  }

  return { ok: true, message: "Foaia de parcurs a fost actualizata." };
}

async function deleteTripSheet(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge foi de parcurs.");
  }

  const organization = await getDefaultOrganization();
  const legacyTripId = text(payload.FoaieParcursID);
  if (!legacyTripId) {
    return { ok: false, message: "FoaieParcursID este obligatoriu." };
  }

  const existing = await findTripSheetByLegacyId(organization.id, legacyTripId);
  if (!existing) {
    return { ok: false, message: "Foaia de parcurs nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/trip_sheets?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  await syncVehicleCurrentKm(organization.id, existing.vehicle_id);
  return { ok: true, message: "Foaia de parcurs a fost stearsa." };
}

async function findTripSheetByLegacyId(organizationId, legacyTripId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "trip_sheets",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `legacy_trip_sheet_id=eq.${encodeURIComponent(legacyTripId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function resolveVehicle(organizationId, legacyVehicleId, plateNumber) {
  if (legacyVehicleId) {
    const byLegacy = await supabaseRest(
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

    if (byLegacy && byLegacy[0]) {
      return byLegacy[0];
    }
  }

  if (!plateNumber) {
    return null;
  }

  const byPlate = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=id,legacy_vehicle_id,plate_number,current_employee_id",
        `organization_id=eq.${organizationId}`,
        `plate_number=eq.${encodeURIComponent(normalizePlate(plateNumber))}`,
        "limit=1"
      ].join("&")
    )
  );

  return byPlate && byPlate[0] ? byPlate[0] : null;
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

async function syncVehicleCurrentKm(organizationId, vehicleId) {
  if (!vehicleId) {
    return;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "trip_sheets",
      [
        "select=odometer_end,odometer_start,departure_date,legacy_trip_sheet_id",
        `organization_id=eq.${organizationId}`,
        `vehicle_id=eq.${vehicleId}`,
        "order=departure_date.desc,legacy_trip_sheet_id.desc",
        "limit=1"
      ].join("&")
    )
  );

  const latest = rows && rows[0] ? rows[0] : null;
  const currentKm = latest ? numberOrZero(latest.odometer_end || latest.odometer_start) : 0;

  await supabaseRest(`/rest/v1/vehicles?id=eq.${vehicleId}`, {
    method: "PATCH",
    body: {
      current_km: currentKm
    }
  });
}

function mapTripSheetToLegacyShape(item, vehicleById, employeeById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  const employee = item.employee_id ? employeeById.get(item.employee_id) : null;

  return {
    FoaieParcursID: item.legacy_trip_sheet_id || item.trip_code || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataPlecare: item.departure_date || "",
    LocPlecare: item.start_location || "",
    Destinatie: item.destination || "",
    ScopDeplasare: item.trip_purpose || "",
    KmPlecare: numberOrZero(item.odometer_start),
    KmSosire: numberOrZero(item.odometer_end),
    KmParcursi: numberOrZero(item.distance_km),
    Status: mapStatusFromSupabase(item.status),
    KmPozaURL: item.odometer_photo_url || "",
    PozaKmURL: item.odometer_photo_url || "",
    KmOCR: numberOrZero(item.odometer_ocr_km),
    KmValidatOCR: numberOrZero(item.odometer_ocr_km)
  };
}

function normalizeTripSheetPayload(payload) {
  const kmPlecare = toNumber(payload.KmPlecare);
  const kmSosire = toNumber(payload.KmSosire);
  const kmParcursiRaw = payload.KmParcursi == null || payload.KmParcursi === ""
    ? (kmSosire - kmPlecare)
    : toNumber(payload.KmParcursi);

  return {
    FoaieParcursID: text(payload.FoaieParcursID),
    MasinaID: text(payload.MasinaID),
    NrInmatriculare: normalizePlate(payload.NrInmatriculare),
    SoferID: text(payload.SoferID),
    DataPlecare: normalizeDate(payload.DataPlecare),
    LocPlecare: text(payload.LocPlecare),
    Destinatie: text(payload.Destinatie),
    ScopDeplasare: text(payload.ScopDeplasare),
    KmPlecare: kmPlecare,
    KmSosire: kmSosire,
    KmParcursi: kmParcursiRaw,
    Status: normalizeStatus(payload.Status || "RAPORTATA"),
    KmPozaURL: text(payload.KmPozaURL || payload.PozaKmURL),
    KmOCR: toNullableNumber(payload.KmOCR || payload.KmValidatOCR)
  };
}

function validateTripSheetPayload(payload) {
  if (!payload.FoaieParcursID) {
    return "FoaieParcursID este obligatoriu.";
  }
  if (!payload.MasinaID && !payload.NrInmatriculare) {
    return "MasinaID / NrInmatriculare este obligatoriu.";
  }
  if (!payload.SoferID) {
    return "SoferID este obligatoriu.";
  }
  if (!payload.DataPlecare) {
    return "DataPlecare este obligatorie.";
  }
  if (!payload.Destinatie) {
    return "Destinatie este obligatorie.";
  }
  if (payload.KmPlecare < 0 || payload.KmSosire < 0) {
    return "Valorile KM trebuie sa fie pozitive.";
  }
  if (payload.KmSosire < payload.KmPlecare) {
    return "KM sosire nu poate fi mai mic decat KM plecare.";
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
    return "RAPORTATA";
  }
  if (normalized === "REPORTED") {
    return "RAPORTATA";
  }
  return normalized;
}

function normalizeStatus(value) {
  const normalized = text(value).toUpperCase();
  if (!normalized) {
    return "raportata";
  }
  if (normalized === "RAPORTATA") {
    return "raportata";
  }
  return normalized.toLowerCase();
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function normalizeDate(value) {
  return text(value);
}

function normalizePlate(value) {
  return text(value).toUpperCase();
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const normalized = String(value || "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  listTripSheets,
  createTripSheet,
  updateTripSheet,
  deleteTripSheet
};
