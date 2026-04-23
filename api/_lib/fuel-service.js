const { supabaseRest, buildSelectPath } = require("./supabase-server");

const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE", "SOFER"]);
const DELETE_ROLES = new Set(["ADMIN"]);

async function listFuelEntries(context) {
  const organization = await getDefaultOrganization();
  const [fuelLogs, vehicles, employees] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "fuel_logs",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "source_type=eq.station",
          "operation_type=eq.fueling",
          "order=operation_date.desc"
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
          "select=id,legacy_sofer_id,user_profile_id",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const vehicleById = new Map((vehicles || []).map((item) => [item.id, item]));
  const employeeById = new Map((employees || []).map((item) => [item.id, item]));
  let items = (fuelLogs || []).map((item) => mapFuelLogToLegacyShape(item, vehicleById, employeeById));

  if (normalizeRole(context.role) === "SOFER") {
    const linkedSoferId = text(context.linkedSoferId);
    items = items.filter((item) => text(item.SoferID) === linkedSoferId);
  }

  return { ok: true, data: { items } };
}

async function createFuelEntry(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare alimentare.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeFuelPayload(payload);
  const validationError = validateFuelPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findFuelLogByLegacyId(organization.id, normalized.AlimentareID);
  if (existing) {
    return { ok: false, message: "Exista deja o alimentare cu acest ID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employeeId = await resolveEmployeeId(organization.id, normalized.SoferID);
  if (!employeeId) {
    return { ok: false, message: "SoferID este invalid." };
  }

  await supabaseRest("/rest/v1/fuel_logs", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        employee_id: employeeId,
        source_type: "station",
        operation_type: "fueling",
        fuel_type: normalized.TipCombustibil || null,
        station_name: normalized.Statie || null,
        quantity_liters: normalized.CantitateLitri,
        total_cost: normalized.CostTotal,
        unit_price: normalized.PretPeLitru,
        odometer_km: normalized.KmLaAlimentare,
        operation_date: normalized.DataAlimentare,
        reference_no: normalized.AlimentareID,
        notes: normalized.Observatii || null,
        legacy_fuel_id: normalized.AlimentareID
      }
    ]
  });

  return { ok: true, message: "Alimentarea a fost salvata." };
}

async function updateFuelEntry(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare alimentare.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeFuelPayload(payload);
  const validationError = validateFuelPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findFuelLogByLegacyId(organization.id, normalized.AlimentareID);
  if (!existing) {
    return { ok: false, message: "Alimentarea nu a fost gasita." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID, normalized.NrInmatriculare);
  if (!vehicle) {
    return { ok: false, message: "MasinaID / NrInmatriculare este obligatoriu." };
  }

  const employeeId = await resolveEmployeeId(organization.id, normalized.SoferID);
  if (!employeeId) {
    return { ok: false, message: "SoferID este invalid." };
  }

  await supabaseRest(`/rest/v1/fuel_logs?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      employee_id: employeeId,
      fuel_type: normalized.TipCombustibil || null,
      station_name: normalized.Statie || null,
      quantity_liters: normalized.CantitateLitri,
      total_cost: normalized.CostTotal,
      unit_price: normalized.PretPeLitru,
      odometer_km: normalized.KmLaAlimentare,
      operation_date: normalized.DataAlimentare,
      notes: normalized.Observatii || null
    }
  });

  return { ok: true, message: "Alimentarea a fost actualizata." };
}

async function deleteFuelEntry(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge alimentari.");
  }

  const organization = await getDefaultOrganization();
  const legacyFuelId = text(payload.AlimentareID);
  if (!legacyFuelId) {
    return { ok: false, message: "AlimentareID este obligatoriu." };
  }

  const existing = await findFuelLogByLegacyId(organization.id, legacyFuelId);
  if (!existing) {
    return { ok: false, message: "Alimentarea nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/fuel_logs?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Alimentarea a fost stearsa." };
}

async function findFuelLogByLegacyId(organizationId, legacyFuelId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "fuel_logs",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `legacy_fuel_id=eq.${encodeURIComponent(legacyFuelId)}`,
        "source_type=eq.station",
        "operation_type=eq.fueling",
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

async function resolveEmployeeId(organizationId, legacySoferId) {
  if (!legacySoferId) {
    return null;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "employees",
      [
        "select=id",
        `organization_id=eq.${organizationId}`,
        `legacy_sofer_id=eq.${encodeURIComponent(legacySoferId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0].id : null;
}

function mapFuelLogToLegacyShape(item, vehicleById, employeeById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  const employee = item.employee_id ? employeeById.get(item.employee_id) : null;

  return {
    AlimentareID: item.legacy_fuel_id || item.reference_no || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    SoferID: employee ? employee.legacy_sofer_id || "" : "",
    DataAlimentare: item.operation_date || "",
    KmLaAlimentare: numberOrZero(item.odometer_km),
    CantitateLitri: numberOrZero(item.quantity_liters),
    CostTotal: numberOrZero(item.total_cost),
    PretPeLitru: numberOrZero(item.unit_price),
    Statie: item.station_name || "",
    TipCombustibil: item.fuel_type || "",
    Observatii: item.notes || "",
    ConsumLitriPer100Km: "",
    CostPerKm: "",
    KmIntervalConsum: ""
  };
}

function normalizeFuelPayload(payload) {
  const totalCost = toNumber(payload.CostTotal);
  const quantity = toNumber(payload.CantitateLitri);
  const explicitUnitPrice = toNumber(payload.PretPeLitru);

  return {
    AlimentareID: text(payload.AlimentareID),
    MasinaID: text(payload.MasinaID),
    NrInmatriculare: normalizePlate(payload.NrInmatriculare),
    SoferID: text(payload.SoferID),
    DataAlimentare: normalizeDateTime(payload.DataAlimentare),
    KmLaAlimentare: toNumber(payload.KmLaAlimentare),
    CantitateLitri: quantity,
    CostTotal: totalCost,
    PretPeLitru: explicitUnitPrice || (quantity > 0 ? Number((totalCost / quantity).toFixed(4)) : 0),
    Statie: text(payload.Statie),
    TipCombustibil: text(payload.TipCombustibil),
    Observatii: text(payload.Observatii)
  };
}

function validateFuelPayload(payload) {
  if (!payload.AlimentareID) {
    return "AlimentareID este obligatoriu.";
  }
  if (!payload.MasinaID && !payload.NrInmatriculare) {
    return "MasinaID / NrInmatriculare este obligatoriu.";
  }
  if (!payload.SoferID) {
    return "SoferID este obligatoriu.";
  }
  if (!payload.DataAlimentare) {
    return "Data alimentarii este obligatorie.";
  }
  if (payload.CantitateLitri <= 0) {
    return "Cantitatea trebuie sa fie mai mare decat zero.";
  }
  if (payload.CostTotal < 0 || payload.KmLaAlimentare < 0) {
    return "Valorile numerice nu pot fi negative.";
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

function normalizeDateTime(value) {
  const normalized = text(value);
  if (!normalized) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized}T00:00:00.000Z`;
  }

  return normalized;
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value || "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
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

let cachedOrganization = null;

module.exports = {
  listFuelEntries,
  createFuelEntry,
  updateFuelEntry,
  deleteFuelEntry
};
