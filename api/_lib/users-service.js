const { supabaseRest, buildSelectPath } = require("./supabase-server");
const { hashLegacyPassword } = require("./auth");

const ADMIN_ROLES = new Set(["ADMIN"]);
const LEGACY_TO_SUPABASE_ROLE = {
  ADMIN: "admin",
  MANAGER: "manager_flota",
  OFFICE: "contabilitate",
  SOFER: "sofer"
};

const SUPABASE_TO_LEGACY_ROLE = {
  admin: "ADMIN",
  manager_flota: "MANAGER",
  manager_santier: "MANAGER",
  contabilitate: "OFFICE",
  sofer: "SOFER"
};

async function listUsers(context) {
  if (!ADMIN_ROLES.has(normalizeRole(context.role))) {
    return denied("Doar ADMIN poate vedea utilizatorii.");
  }

  const organization = await getDefaultOrganization();
  const [profiles, roles, userRoles] = await Promise.all([
    supabaseRest(
      buildSelectPath(
        "user_profiles",
        [
          "select=id,legacy_user_id,full_name,email,status,metadata",
          `organization_id=eq.${organization.id}`,
          "order=full_name.asc"
        ].join("&")
      )
    ),
    supabaseRest(buildSelectPath("roles", "select=id,code")),
    supabaseRest(
      buildSelectPath(
        "user_roles",
        [
          "select=id,user_profile_id,role_id,is_primary,status",
          `organization_id=eq.${organization.id}`
        ].join("&")
      )
    )
  ]);

  const roleCodeById = new Map((roles || []).map((item) => [item.id, item.code]));
  const primaryRoleByUserId = new Map();

  (userRoles || []).forEach((item) => {
    if (!item || item.status !== "active") {
      return;
    }
    if (!primaryRoleByUserId.has(item.user_profile_id) || item.is_primary) {
      primaryRoleByUserId.set(item.user_profile_id, roleCodeById.get(item.role_id) || "");
    }
  });

  return {
    ok: true,
    data: {
      items: (profiles || []).map((item) => mapUserProfileToLegacyShape(item, primaryRoleByUserId))
    }
  };
}

async function createUser(payload) {
  if (!ADMIN_ROLES.has(normalizeRole(payload.role))) {
    return denied("Doar ADMIN poate adauga utilizatori.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeUserPayload(payload);
  const validationError = validateUserPayload(normalized, { requirePassword: true });
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const duplicateLegacyId = await findUserProfileByLegacyId(organization.id, normalized.UserID);
  if (duplicateLegacyId) {
    return { ok: false, message: "Exista deja un utilizator cu acest UserID." };
  }

  const duplicateEmail = await findUserProfileByEmail(organization.id, normalized.Email);
  if (duplicateEmail) {
    return { ok: false, message: "Exista deja un utilizator cu acest email." };
  }

  const inserted = await supabaseRest("/rest/v1/user_profiles", {
    method: "POST",
    body: [
      {
        organization_id: organization.id,
        legacy_user_id: normalized.UserID,
        email: normalized.Email,
        full_name: normalized.Nume,
        status: normalized.Status,
        metadata: buildUserMetadata(normalized)
      }
    ]
  });

  const profile = inserted && inserted[0];
  if (!profile) {
    throw new Error("Nu am putut salva utilizatorul in Supabase.");
  }

  await replacePrimaryUserRole(organization.id, profile.id, normalized.Rol);
  return { ok: true, message: "Userul a fost salvat." };
}

async function updateUser(payload) {
  if (!ADMIN_ROLES.has(normalizeRole(payload.role))) {
    return denied("Doar ADMIN poate modifica utilizatori.");
  }

  const organization = await getDefaultOrganization();
  const normalized = normalizeUserPayload(payload);
  const validationError = validateUserPayload(normalized, { requirePassword: false });
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const existing = await findUserProfileByLegacyId(organization.id, normalized.UserID);
  if (!existing) {
    return { ok: false, message: "Utilizatorul nu a fost gasit." };
  }

  const duplicateEmail = await findUserProfileByEmail(organization.id, normalized.Email);
  if (duplicateEmail && duplicateEmail.id !== existing.id) {
    return { ok: false, message: "Exista deja un utilizator cu acest email." };
  }

  const mergedMetadata = {
    ...(existing.metadata || {}),
    ...buildUserMetadata(normalized, existing.metadata || {})
  };

  await supabaseRest(`/rest/v1/user_profiles?id=eq.${existing.id}`, {
    method: "PATCH",
    body: {
      email: normalized.Email,
      full_name: normalized.Nume,
      status: normalized.Status,
      metadata: mergedMetadata
    }
  });

  await replacePrimaryUserRole(organization.id, existing.id, normalized.Rol);
  return { ok: true, message: "Userul a fost actualizat." };
}

async function deleteUser(payload) {
  if (!ADMIN_ROLES.has(normalizeRole(payload.role))) {
    return denied("Doar ADMIN poate sterge utilizatori.");
  }

  const organization = await getDefaultOrganization();
  const legacyUserId = text(payload.UserID);
  if (!legacyUserId) {
    return { ok: false, message: "UserID este obligatoriu." };
  }

  const existing = await findUserProfileByLegacyId(organization.id, legacyUserId);
  if (!existing) {
    return { ok: false, message: "Utilizatorul nu a fost gasit." };
  }

  await supabaseRest(`/rest/v1/user_profiles?id=eq.${existing.id}`, {
    method: "DELETE",
    prefer: "return=minimal"
  });

  return { ok: true, message: "Userul a fost sters." };
}

async function replacePrimaryUserRole(organizationId, userProfileId, legacyRole) {
  const roleCode = LEGACY_TO_SUPABASE_ROLE[normalizeRole(legacyRole)];
  if (!roleCode) {
    throw new Error("Rolul selectat nu este suportat.");
  }

  const roles = await supabaseRest(
    buildSelectPath(
      "roles",
      [`select=id,code`, `code=eq.${encodeURIComponent(roleCode)}`, "limit=1"].join("&")
    )
  );
  const role = roles && roles[0];
  if (!role) {
    throw new Error("Rolul nu exista in Supabase.");
  }

  await supabaseRest(
    `/rest/v1/user_roles?organization_id=eq.${organizationId}&user_profile_id=eq.${userProfileId}`,
    {
      method: "DELETE",
      prefer: "return=minimal"
    }
  );

  await supabaseRest("/rest/v1/user_roles", {
    method: "POST",
    body: [
      {
        organization_id: organizationId,
        user_profile_id: userProfileId,
        role_id: role.id,
        is_primary: true,
        status: "active"
      }
    ]
  });
}

async function findUserProfileByLegacyId(organizationId, legacyUserId) {
  const rows = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,legacy_user_id,email,full_name,status,metadata",
        `organization_id=eq.${organizationId}`,
        `legacy_user_id=eq.${encodeURIComponent(legacyUserId)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

async function findUserProfileByEmail(organizationId, email) {
  const rows = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,email",
        `organization_id=eq.${organizationId}`,
        `email=eq.${encodeURIComponent(email)}`,
        "limit=1"
      ].join("&")
    )
  );

  return rows && rows[0] ? rows[0] : null;
}

function mapUserProfileToLegacyShape(item, primaryRoleByUserId) {
  const metadata = item.metadata || {};
  return {
    UserID: item.legacy_user_id || item.id,
    Nume: item.full_name || "",
    Email: item.email || "",
    Rol: mapSupabaseRoleToLegacy(primaryRoleByUserId.get(item.id) || ""),
    Status: mapStatusFromSupabase(item.status),
    ParolaHash: "",
    Observatii: text(metadata.observatii || "")
  };
}

function buildUserMetadata(normalized, existingMetadata = {}) {
  const next = {
    ...existingMetadata
  };

  next.observatii = normalized.Observatii || "";
  if (normalized.ParolaHash) {
    next.legacy_password_hash = hashLegacyPassword(normalized.ParolaHash);
  } else if (!next.legacy_password_hash) {
    next.legacy_password_hash = "";
  }

  return next;
}

function normalizeUserPayload(payload) {
  return {
    UserID: text(payload.UserID),
    Nume: text(payload.Nume),
    Email: text(payload.Email).toLowerCase(),
    ParolaHash: text(payload.ParolaHash),
    Rol: normalizeRole(payload.Rol || "SOFER"),
    Status: normalizeStatus(payload.Status || "ACTIV"),
    Observatii: text(payload.Observatii)
  };
}

function validateUserPayload(payload, options = {}) {
  if (!payload.UserID) {
    return "UserID este obligatoriu.";
  }
  if (!payload.Nume) {
    return "Numele este obligatoriu.";
  }
  if (!payload.Email) {
    return "Emailul este obligatoriu.";
  }
  if (!payload.Email.includes("@")) {
    return "Emailul este invalid.";
  }
  if (options.requirePassword && !payload.ParolaHash) {
    return "Parola este obligatorie.";
  }
  if (!LEGACY_TO_SUPABASE_ROLE[payload.Rol]) {
    return "Rolul selectat nu este suportat.";
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

function mapSupabaseRoleToLegacy(roleCode) {
  return SUPABASE_TO_LEGACY_ROLE[roleCode] || "SOFER";
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
  listUsers,
  createUser,
  updateUser,
  deleteUser
};
