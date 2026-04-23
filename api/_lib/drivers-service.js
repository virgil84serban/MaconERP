const { supabaseRest, buildSelectPath } = require("./supabase-server");

const VIEW_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const EDIT_ROLES = new Set(["ADMIN", "MANAGER", "OFFICE"]);
const DELETE_ROLES = new Set(["ADMIN"]);

async function listDrivers(context) {
  const role = normalizeRole(context && context.role);
  if (!VIEW_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru vizualizarea soferilor.");
  }

  const organization = await getDefaultOrganization();
  const [employees, profiles] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "employees",
        [
          "select=id,legacy_sofer_id,user_profile_id,full_name,phone,license_categories,status,notes",
          `organization_id=eq.${organization.id}`,
          "order=full_name.asc"
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "user_profiles",
        [
          "select=id,legacy_user_id",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const profileById = new Map((profiles || []).map((item) => [item.id, item]));

  return {
    ok: true,
    data: {
      items: (employees || []).map((item) => mapDriverToLegacyShape(item, profileById))
    }
  };
}

async function createDriver(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru adaugare sofer.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDriverPayload(payload);
  const validationError = validateDriverPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDriverByLegacyId(organization.id, normalized.SoferID);
  if (existing) {
    return { ok: false, message: "Exista deja un sofer cu acest SoferID." };
  }

  const userProfileId = await resolveUserProfileId(organization.id, normalized.UserID);
  if (normalized.UserID && !userProfileId) {
    return { ok: false, message: "UserID-ul asociat nu exista." };
  }

  await supabaseRest("/rest/v1/employees", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        user_profile_id: userProfileId,
        legacy_sofer_id: normalized.SoferID,
        employee_code: normalized.SoferID,
        full_name: normalized.Nume,
        phone: normalized.Telefon || null,
        status: normalized.Status,
        job_title: "sofer",
        license_categories: normalized.CategoriePermis || null,
        notes: normalized.Observatii || null
      }
    ]
  });

  return { ok: true, message: "Soferul a fost salvat." };
}

async function updateDriver(payload) {
  const role = normalizeRole(payload.role);
  if (!EDIT_ROLES.has(role)) {
    return denied("Nu ai drepturi pentru editare sofer.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeDriverPayload(payload);
  const validationError = validateDriverPayload(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findDriverByLegacyId(organization.id, normalized.SoferID);
  if (!existing) {
    return { ok: false, message: "Soferul nu a fost gasit." };
  }

  const userProfileId = await resolveUserProfileId(organization.id, normalized.UserID);
  if (normalized.UserID && !userProfileId) {
    return { ok: false, message: "UserID-ul asociat nu exista." };
  }

  await supabaseRest(`/rest/v1/employees?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      user_profile_id: userProfileId,
      full_name: normalized.Nume,
      phone: normalized.Telefon || null,
      status: normalized.Status,
      license_categories: normalized.CategoriePermis || null,
      notes: normalized.Observatii || null
    }
  });

  return { ok: true, message: "Soferul a fost actualizat." };
}

async function deleteDriver(payload) {
  const role = normalizeRole(payload.role);
  if (!DELETE_ROLES.has(role)) {
    return denied("Doar ADMIN poate sterge soferi.");
  }

  const organization = await getDefaultOrganization();
  const legacySoferId = text(payload.SoferID);
  if (!legacySoferId) {
    return { ok: false, message: "SoferID este obligatoriu." };
  }

  const existing = await findDriverByLegacyId(organization.id, legacySoferId);
  if (!existing) {
    return { ok: false, message: "Soferul nu a fost gasit." };
  }

  await supabaseRest(`/rest/v1/employees?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Soferul a fost sters." };
}

async function findDriverByLegacyId(organizationId, legacySoferId) {
  const rows = await supabaseRest(
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

  return rows && rows[0] ? rows[0] : null;
}

async function resolveUserProfileId(organizationId, legacyUserId) {
  if (!legacyUserId) {
    return null;
  }

  const rows = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id",
        `organization_id=eq.${organizationId}`,
        `legacy_user_id=eq.${encodeURIComponent(legacyUserId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0].id : null;
}

function mapDriverToLegacyShape(item, profileById) {
  const profile = item.user_profile_id ? profileById.get(item.user_profile_id) : null;
  return {
    SoferID: item.legacy_sofer_id || item.employee_code || item.id,
    UserID: profile ? profile.legacy_user_id || "" : "",
    Nume: item.full_name || "",
    Telefon: item.phone || "",
    CategoriePermis: item.license_categories || "",
    Status: mapStatusFromSupabase(item.status),
    Observatii: item.notes || ""
  };
}

function normalizeDriverPayload(payload) {
  return {
    SoferID: text(payload.SoferID),
    UserID: text(payload.UserID),
    Nume: text(payload.Nume),
    Telefon: text(payload.Telefon),
    CategoriePermis: text(payload.CategoriePermis),
    Status: normalizeStatus(payload.Status || "ACTIV"),
    Observatii: text(payload.Observatii)
  };
}

function validateDriverPayload(payload) {
  if (!payload.SoferID) {
    return "SoferID este obligatoriu.";
  }
  if (!payload.Nume) {
    return "Numele soferului este obligatoriu.";
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

function text(value) {
  return String(value || "").trim();
}

function denied(message) {
  return { ok: false, message };
}

let cachedOrganization = null;

module.exports = {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver
};
