const { supabaseRest, buildSelectPath } = require("./supabase-server");

const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const DELETE_ROLES = new Set(["ADMIN"]);
const DEFAULT_STATUS = "ACTIVA";
const DOC_TYPES = ["ITP", "RCA", "ROVINIETA"];

async function listVehicles(context) {
  const organization = await getDefaultOrganization();
  const [vehicles, employees, documents] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "vehicles",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "order=plate_number.asc"
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
    ),
    supabaseRest(
      buildSelectPath(
        "vehicle_documents",
        [
          "select=vehicle_id,document_type,expiry_date",
          `organization_id=eq.${organization.id}`,
          "document_type=in.(ITP,RCA,ROVINIETA)"
        ].join("&")
      )
    )
  ]);

  const employeeById = new Map((employees || []).map((item) => [item.id, item]));
  const docsByVehicleId = new Map();

  (documents || []).forEach((item) => {
    if (!docsByVehicleId.has(item.vehicle_id)) {
      docsByVehicleId.set(item.vehicle_id, {});
    }
    docsByVehicleId.get(item.vehicle_id)[String(item.document_type || "").toUpperCase()] = item.expiry_date || "";
  });

  const items = (vehicles || []).map((item) => mapVehicleToLegacyShape(item, employeeById, docsByVehicleId));

  if (String(context.role || "").toUpperCase() === "SOFER") {
    const userId = text(context.userId);
    return {
      ok: true,
      data: {
        items: items.filter((item) => String(item.SoferCurentID || "").trim() === userId || String(item.SoferCurentID || "").trim() === text(context.linkedSoferId))
      }
    };
  }

  return { ok: true, data: { items } };
}

async function createVehicle(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare masina.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeVehiclePayload(payload);
  const validationError = validateVehiclePayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const duplicate = await findVehicleByPlate(organization.id, normalized.NrInmatriculare);
  if (duplicate) {
    return { ok: false, message: "Exista deja o masina cu acest numar de inmatriculare." };
  }

  const employeeId = await resolveEmployeeId(organization.id, normalized.SoferCurentID);
  const inserted = await supabaseRest(`/rest/v1/vehicles`, {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        legacy_vehicle_id: normalized.MasinaID,
        vehicle_code: normalized.MasinaID,
        plate_number: normalized.NrInmatriculare,
        brand: normalized.Marca || null,
        model: normalized.Model || null,
        fabrication_year: normalized.An || null,
        vehicle_type: normalized.TipVehicul || null,
        fuel_type: normalized.Combustibil || null,
        status: normalized.Status,
        current_km: normalized.KmCurenti,
        current_employee_id: employeeId,
        notes: normalized.Observatii || null
      }
    ]
  });

  const vehicle = inserted && inserted[0];
  if (!vehicle) {
    throw new Error("Nu am putut salva masina in Supabase.");
  }

  await syncVehicleDocuments(organization.id, vehicle.id, normalized);
  return { ok: true, message: "Masina a fost salvata." };
}

async function updateVehicle(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare masina.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeVehiclePayload(payload);
  if (!normalized.MasinaID) {
    return { ok: false, message: "MasinaID este obligatoriu." };
  }

  const validationError = validateVehiclePayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findVehicleByLegacyId(organization.id, normalized.MasinaID);
  if (!existing) {
    return { ok: false, message: "Masina nu a fost gasita." };
  }

  const duplicate = await findVehicleByPlate(organization.id, normalized.NrInmatriculare);
  if (duplicate && duplicate.id !== existing.id) {
    return { ok: false, message: "Exista deja o masina cu acest numar de inmatriculare." };
  }

  const employeeId = await resolveEmployeeId(organization.id, normalized.SoferCurentID);
  await supabaseRest(`/rest/v1/vehicles?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      plate_number: normalized.NrInmatriculare,
      brand: normalized.Marca || null,
      model: normalized.Model || null,
      fabrication_year: normalized.An || null,
      vehicle_type: normalized.TipVehicul || null,
      fuel_type: normalized.Combustibil || null,
      status: normalized.Status,
      current_km: normalized.KmCurenti,
      current_employee_id: employeeId,
      notes: normalized.Observatii || null
    }
  });

  await syncVehicleDocuments(organization.id, existing.id, normalized);
  return { ok: true, message: "Masina a fost actualizata." };
}

async function deleteVehicle(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge masini.");
  }

  const organization = await getDefaultOrganization();
  const legacyVehicleId = text(payload.MasinaID);
  if (!legacyVehicleId) {
    return { ok: false, message: "MasinaID este obligatoriu." };
  }

  const existing = await findVehicleByLegacyId(organization.id, legacyVehicleId);
  if (!existing) {
    return { ok: false, message: "Masina nu a fost gasita." };
  }

  await supabaseRest(`/rest/v1/vehicles?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Masina a fost stearsa." };
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

async function findVehicleByLegacyId(organizationId, legacyVehicleId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `legacy_vehicle_id=eq.${encodeURIComponent(legacyVehicleId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function findVehicleByPlate(organizationId, plateNumber) {
  const rows = await supabaseRest(
    buildSelectPath(
      "vehicles",
      [
        "select=*",
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

async function syncVehicleDocuments(organizationId, vehicleId, payload) {
  const existingDocs = await supabaseRest(
    buildSelectPath(
      "vehicle_documents",
      [
        "select=id,document_type",
        `organization_id=eq.${organizationId}`,
        `vehicle_id=eq.${vehicleId}`,
        "document_type=in.(ITP,RCA,ROVINIETA)"
      ].join("&")
    )
  );

  const existingByType = new Map((existingDocs || []).map((item) => [String(item.document_type || "").toUpperCase(), item]));
  const desired = [
    { type: "ITP", value: normalizeDateString(payload.ITPExpiraLa) },
    { type: "RCA", value: normalizeDateString(payload.RCAExpiraLa) },
    { type: "ROVINIETA", value: normalizeDateString(payload.RovinietaExpiraLa) }
  ];

  for (const item of desired) {
    const existing = existingByType.get(item.type);
    if (!item.value) {
      if (existing) {
        await supabaseRest(`/rest/v1/vehicle_documents?id=eq.${existing.id}`, {
          method: "DELETE",
          prefer: "return=minimal"
        });
      }
      continue;
    }

    const body = {
      organization_id: organizationId,
      vehicle_id: vehicleId,
      document_type: item.type,
      expiry_date: item.value,
      status: "ACTIV"
    };

    if (existing) {
      await supabaseRest(`/rest/v1/vehicle_documents?id=eq.${existing.id}`, {
        method: "PATCH",
        body
      });
    } else {
      await supabaseRest(`/rest/v1/vehicle_documents`, {
        method: "POST",
        body: [body]
      });
    }
  }
}

function mapVehicleToLegacyShape(item, employeeById, docsByVehicleId) {
  const employee = item.current_employee_id ? employeeById.get(item.current_employee_id) : null;
  const docs = docsByVehicleId.get(item.id) || {};

  return {
    MasinaID: item.legacy_vehicle_id || item.vehicle_code || item.id,
    NrInmatriculare: item.plate_number || "",
    Marca: item.brand || "",
    Model: item.model || "",
    An: item.fabrication_year || "",
    TipVehicul: item.vehicle_type || "",
    Combustibil: item.fuel_type || "",
    Status: item.status || DEFAULT_STATUS,
    KmCurenti: numberOrZero(item.current_km),
    SoferCurentID: employee ? employee.legacy_sofer_id || "" : "",
    ITPExpiraLa: docs.ITP || "",
    RCAExpiraLa: docs.RCA || "",
    RovinietaExpiraLa: docs.ROVINIETA || "",
    Observatii: item.notes || ""
  };
}

function normalizeVehiclePayload(payload) {
  const plate = normalizePlate(payload.NrInmatriculare);
  return {
    MasinaID: text(payload.MasinaID),
    NrInmatriculare: plate,
    Marca: text(payload.Marca),
    Model: text(payload.Model),
    An: parseInteger(payload.An),
    TipVehicul: normalizeTextValue(payload.TipVehicul),
    Combustibil: normalizeTextValue(payload.Combustibil),
    Status: normalizeStatus(payload.Status),
    KmCurenti: numberOrZero(payload.KmCurenti),
    SoferCurentID: text(payload.SoferCurentID),
    ITPExpiraLa: text(payload.ITPExpiraLa),
    RCAExpiraLa: text(payload.RCAExpiraLa),
    RovinietaExpiraLa: text(payload.RovinietaExpiraLa),
    Observatii: text(payload.Observatii)
  };
}

function validateVehiclePayload(payload) {
  if (!payload.MasinaID) {
    return "ID-ul intern al masinii este obligatoriu.";
  }
  if (!payload.NrInmatriculare) {
    return "Numarul de inmatriculare este obligatoriu.";
  }
  if (payload.An !== null && payload.An !== "" && (!Number.isInteger(payload.An) || payload.An < 1900 || payload.An > 2100)) {
    return "Anul vehiculului este invalid.";
  }
  if (payload.KmCurenti < 0) {
    return "Kilometrajul nu poate fi negativ.";
  }
  return "";
}

function normalizeRole(value) {
  return text(value).toUpperCase();
}

function normalizeStatus(value) {
  return normalizeTextValue(value || DEFAULT_STATUS) || DEFAULT_STATUS;
}

function normalizePlate(value) {
  return text(value).toUpperCase();
}

function normalizeTextValue(value) {
  return text(value).toUpperCase();
}

function normalizeDateString(value) {
  const normalized = text(value);
  return normalized || null;
}

function parseInteger(value) {
  const normalized = text(value);
  if (!normalized) {
    return null;
  }
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
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
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
