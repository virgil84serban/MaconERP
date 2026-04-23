const { supabaseRest, buildSelectPath } = require("./supabase-server");

const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const DELETE_ROLES = new Set(["ADMIN"]);
const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);

async function listDocuments(context) {
  if (!VIEW_ROLES.has(normalizeRole(context.role))) {
    return denied("Nu ai drepturi pentru vizualizarea documentelor.");
  }

  const organization = await getDefaultOrganization();
  const [documents, vehicles] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "vehicle_documents",
        [
          "select=*",
          `organization_id=eq.${organization.id}`,
          "order=expiry_date.desc.nullslast"
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
    )
  ]);

  const vehicleById = new Map((vehicles || []).map((item) => [item.id, item]));

  return {
    ok: true,
    data: {
      items: (documents || []).map((item) => mapDocumentToLegacyShape(item, vehicleById))
    }
  };
}

async function createDocument(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare document.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDocumentPayload(payload);
  const validationError = validateDocumentPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDocumentByLegacyId(organization.id, normalized.DocumentID);
  if (existing) {
    return { ok: false, message: "Exista deja un document cu acest DocumentID." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID);
  if (!vehicle) {
    return { ok: false, message: "MasinaID este invalid." };
  }

  await supabaseRest("/rest/v1/vehicle_documents", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        vehicle_id: vehicle.id,
        document_type: normalized.TipDocument,
        series_number: normalized.SerieNumar || null,
        issue_date: normalized.DataEmitere || null,
        expiry_date: normalized.DataExpirare || null,
        cost: normalized.Cost,
        supplier: normalized.Furnizor || null,
        status: normalized.Status,
        file_url: normalized.FisierURL || null,
        notes: normalized.Observatii || null,
        legacy_document_id: normalized.DocumentID
      }
    ]
  });

  return { ok: true, message: "Documentul a fost salvat." };
}

async function updateDocument(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare document.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDocumentPayload(payload);
  const validationError = validateDocumentPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDocumentByLegacyId(organization.id, normalized.DocumentID);
  if (!existing) {
    return { ok: false, message: "Documentul nu a fost gasit." };
  }

  const vehicle = await resolveVehicle(organization.id, normalized.MasinaID);
  if (!vehicle) {
    return { ok: false, message: "MasinaID este invalid." };
  }

  await supabaseRest(`/rest/v1/vehicle_documents?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      vehicle_id: vehicle.id,
      document_type: normalized.TipDocument,
      series_number: normalized.SerieNumar || null,
      issue_date: normalized.DataEmitere || null,
      expiry_date: normalized.DataExpirare || null,
      cost: normalized.Cost,
      supplier: normalized.Furnizor || null,
      status: normalized.Status,
      file_url: normalized.FisierURL || null,
      notes: normalized.Observatii || null
    }
  });

  return { ok: true, message: "Documentul a fost actualizat." };
}

async function deleteDocument(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge documente.");
  }

  const organization = await getDefaultOrganization();
  const documentId = text(payload.DocumentID);
  if (!documentId) {
    return { ok: false, message: "DocumentID este obligatoriu." };
  }

  const existing = await findDocumentByLegacyId(organization.id, documentId);
  if (!existing) {
    return { ok: false, message: "Documentul nu a fost gasit." };
  }

  await supabaseRest(`/rest/v1/vehicle_documents?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Documentul a fost sters." };
}

async function findDocumentByLegacyId(organizationId, legacyDocumentId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "vehicle_documents",
      [
        "select=*",
        `organization_id=eq.${organizationId}`,
        `legacy_document_id=eq.${encodeURIComponent(legacyDocumentId)}`,
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
        "select=id,legacy_vehicle_id,plate_number",
        `organization_id=eq.${organizationId}`,
        `legacy_vehicle_id=eq.${encodeURIComponent(legacyVehicleId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

function mapDocumentToLegacyShape(item, vehicleById) {
  const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : null;
  return {
    DocumentID: item.legacy_document_id || item.id,
    MasinaID: vehicle ? vehicle.legacy_vehicle_id || "" : "",
    NrInmatriculare: vehicle ? vehicle.plate_number || "" : "",
    TipDocument: item.document_type || "",
    SerieNumar: item.series_number || "",
    DataEmitere: item.issue_date || "",
    DataExpirare: item.expiry_date || "",
    Cost: numberOrZero(item.cost),
    Furnizor: item.supplier || "",
    Status: mapStatusFromSupabase(item.status),
    FisierURL: item.file_url || "",
    Observatii: item.notes || ""
  };
}

function normalizeDocumentPayload(payload) {
  return {
    DocumentID: text(payload.DocumentID),
    MasinaID: text(payload.MasinaID),
    TipDocument: text(payload.TipDocument),
    SerieNumar: text(payload.SerieNumar),
    DataEmitere: normalizeDate(payload.DataEmitere),
    DataExpirare: normalizeDate(payload.DataExpirare),
    Cost: toNumber(payload.Cost),
    Furnizor: text(payload.Furnizor),
    Status: normalizeStatus(payload.Status || "ACTIV"),
    FisierURL: text(payload.FisierURL),
    Observatii: text(payload.Observatii)
  };
}

function validateDocumentPayload(payload) {
  if (!payload.DocumentID) {
    return "DocumentID este obligatoriu.";
  }
  if (!payload.MasinaID) {
    return "MasinaID este obligatoriu.";
  }
  if (!payload.TipDocument) {
    return "Tipul documentului este obligatoriu.";
  }
  if (payload.Cost < 0) {
    return "Costul nu poate fi negativ.";
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
    return "ACTIV";
  }
  if (normalized === "ACTIVE") {
    return "ACTIV";
  }
  if (normalized === "INACTIVE") {
    return "INACTIV";
  }
  return normalized;
}

function normalizeStatus(value) {
  const normalized = text(value).toUpperCase();
  if (normalized === "ACTIV") {
    return "active";
  }
  if (normalized === "INACTIV") {
    return "inactive";
  }
  return normalized.toLowerCase() || "active";
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

let cachedOrganization = null;

module.exports = {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument
};
