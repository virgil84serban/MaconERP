const crypto = require("crypto");
const { supabaseRest, buildSelectPath } = require("./supabase-server");

const SESSION_COOKIE_NAME = "manager_flota_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const LEGACY_PASSWORD_SCHEME = "scrypt";
const LEGACY_PASSWORD_KEY_LENGTH = 64;
const SUPABASE_TO_LEGACY_ROLE = {
  admin: "ADMIN",
  manager_flota: "MANAGER",
  manager_santier: "MANAGER",
  contabilitate: "OFFICE",
  sofer: "SOFER"
};

let cachedOrganization = null;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
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

function getSessionSecret() {
  const secret = text(process.env.APP_SESSION_SECRET);
  if (!secret) {
    throw new Error("APP_SESSION_SECRET lipseste din configurarea serverului.");
  }
  return secret;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(String(value || ""), "base64url").toString("utf8");
}

function signValue(value) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function hashLegacyPassword(password) {
  const normalizedPassword = String(password || "");
  if (!normalizedPassword) {
    return "";
  }

  const salt = crypto.randomBytes(16).toString("base64url");
  const derivedKey = crypto.scryptSync(normalizedPassword, salt, LEGACY_PASSWORD_KEY_LENGTH).toString("base64url");
  return `${LEGACY_PASSWORD_SCHEME}$${salt}$${derivedKey}`;
}

function isLegacyPasswordHash(value) {
  const rawValue = text(value);
  return rawValue.startsWith(`${LEGACY_PASSWORD_SCHEME}$`);
}

function verifyLegacyPassword(password, storedHash) {
  const rawHash = text(storedHash);
  if (!isLegacyPasswordHash(rawHash)) {
    return false;
  }

  const parts = rawHash.split("$");
  if (parts.length !== 3) {
    return false;
  }

  const salt = parts[1];
  const expectedKey = parts[2];
  const derivedKey = crypto.scryptSync(String(password || ""), salt, LEGACY_PASSWORD_KEY_LENGTH).toString("base64url");
  return safeEqual(derivedKey, expectedKey);
}

function createSessionToken(payload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  const rawToken = text(token);
  if (!rawToken || !rawToken.includes(".")) {
    throw new HttpError(401, "Sesiunea este invalida.");
  }

  const [encodedPayload, signature] = rawToken.split(".");
  const expectedSignature = signValue(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    throw new HttpError(401, "Sesiunea este invalida.");
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch (error) {
    throw new HttpError(401, "Sesiunea este invalida.");
  }

  if (!payload || payload.v !== 1 || !payload.userProfileId || !payload.organizationId || !payload.exp) {
    throw new HttpError(401, "Sesiunea este invalida.");
  }

  if (Number(payload.exp) <= Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Sesiunea a expirat.");
  }

  return payload;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(headerValue) {
  const cookies = {};
  String(headerValue || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        return;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
    });
  return cookies;
}

function getCookieValue(request, name) {
  const cookies = parseCookies(request && request.headers ? request.headers.cookie : "");
  return cookies[name] || "";
}

function buildSessionCookie(token) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];

  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildExpiredSessionCookie() {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function setSessionCookie(response, token) {
  response.setHeader("Set-Cookie", buildSessionCookie(token));
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", buildExpiredSessionCookie());
}

async function createLoginSession(email, password) {
  const organization = await getDefaultOrganization();
  const normalizedEmail = text(email).toLowerCase();
  const rawPassword = String(password || "");

  if (!normalizedEmail || !rawPassword) {
    throw new HttpError(400, "Emailul si parola sunt obligatorii.");
  }

  const profiles = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,organization_id,legacy_user_id,full_name,email,status,metadata",
        `organization_id=eq.${organization.id}`,
        `email=eq.${encodeURIComponent(normalizedEmail)}`,
        "limit=1"
      ].join("&")
    )
  );
  const profile = profiles && profiles[0];

  if (!profile) {
    throw new HttpError(401, "Utilizator inexistent.");
  }

  if (normalizeStatus(profile.status) !== "ACTIVE") {
    throw new HttpError(403, "Contul nu este activ.");
  }

  const metadata = profile.metadata || {};
  if (text(metadata.legacy_password_hash) && !isLegacyPasswordHash(metadata.legacy_password_hash)) {
    throw new HttpError(503, "Contul necesita migrarea parolei legacy inainte de autentificare.");
  }

  if (!verifyLegacyPassword(rawPassword, metadata.legacy_password_hash)) {
    throw new HttpError(401, "Parola incorecta.");
  }

  const context = await buildAuthenticatedContext(profile, organization);
  const token = createSessionToken({
    v: 1,
    organizationId: organization.id,
    userProfileId: profile.id,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  });

  return { token, context };
}

async function requireRequestContext(request) {
  const token = getCookieValue(request, SESSION_COOKIE_NAME);
  if (!token) {
    throw new HttpError(401, "Autentificare necesara.");
  }

  const tokenPayload = verifySessionToken(token);
  const organization = await getDefaultOrganization();

  if (text(tokenPayload.organizationId) !== text(organization.id)) {
    throw new HttpError(401, "Sesiunea nu mai este valida pentru organizatia curenta.");
  }

  const profiles = await supabaseRest(
    buildSelectPath(
      "user_profiles",
      [
        "select=id,organization_id,legacy_user_id,full_name,email,status,metadata",
        `organization_id=eq.${organization.id}`,
        `id=eq.${encodeURIComponent(tokenPayload.userProfileId)}`,
        "limit=1"
      ].join("&")
    )
  );
  const profile = profiles && profiles[0];

  if (!profile) {
    throw new HttpError(401, "Sesiunea nu mai este valida.");
  }

  if (normalizeStatus(profile.status) !== "ACTIVE") {
    throw new HttpError(403, "Contul nu mai este activ.");
  }

  return buildAuthenticatedContext(profile, organization);
}

async function buildAuthenticatedContext(profile, organization) {
  const [roles, userRoles, employees] = await Promise.all([
    supabaseRest(buildSelectPath("roles", "select=id,code")),
    supabaseRest(
      buildSelectPath(
        "user_roles",
        [
          "select=id,role_id,is_primary,status",
          `organization_id=eq.${organization.id}`,
          `user_profile_id=eq.${encodeURIComponent(profile.id)}`
        ].join("&")
      )
    ),
    supabaseRest(
      buildSelectPath(
        "employees",
        [
          "select=id,legacy_sofer_id,user_profile_id,status",
          `organization_id=eq.${organization.id}`,
          `user_profile_id=eq.${encodeURIComponent(profile.id)}`,
          "limit=1"
        ].join("&")
      )
    )
  ]);

  const roleCodeById = new Map((roles || []).map((item) => [item.id, item.code]));
  const activeUserRoles = (userRoles || []).filter((item) => normalizeStatus(item.status) === "ACTIVE");
  const primaryRole =
    activeUserRoles.find((item) => item.is_primary) ||
    activeUserRoles[0] ||
    null;

  if (!primaryRole) {
    throw new HttpError(403, "Utilizatorul nu are rol activ.");
  }

  const supabaseRole = text(roleCodeById.get(primaryRole.role_id)).toLowerCase();
  const legacyRole = SUPABASE_TO_LEGACY_ROLE[supabaseRole];
  if (!legacyRole) {
    throw new HttpError(403, "Rolul utilizatorului nu este suportat.");
  }

  const employee = employees && employees[0] ? employees[0] : null;

  return {
    organizationId: organization.id,
    organizationCode: organization.code || "",
    organizationSlug: organization.slug || "",
    userProfileId: profile.id,
    userId: profile.legacy_user_id || profile.id,
    role: legacyRole,
    linkedSoferId: employee ? text(employee.legacy_sofer_id) : "",
    employeeId: employee ? employee.id : "",
    email: profile.email || "",
    fullName: profile.full_name || "",
    status: normalizeStatus(profile.status),
    metadata: profile.metadata || {}
  };
}

function toLegacySessionUser(context) {
  return {
    UserID: context.userId,
    Nume: context.fullName || "",
    Email: context.email || "",
    Rol: context.role,
    Status: context.status === "ACTIVE" ? "ACTIV" : "INACTIV",
    LinkedSoferID: context.linkedSoferId || ""
  };
}

function mergeVerifiedContextIntoPayload(payload, context) {
  return {
    ...(payload || {}),
    role: context.role,
    userId: context.userId,
    linkedSoferId: context.linkedSoferId
  };
}

function parseRequestBody(request) {
  if (!request || typeof request.body === "undefined" || request.body === null) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body || "{}");
    } catch (error) {
      throw new HttpError(400, "Body-ul requestului nu este JSON valid.");
    }
  }

  return request.body || {};
}

function normalizeStatus(value) {
  return text(value).toUpperCase();
}

function text(value) {
  return String(value || "").trim();
}

module.exports = {
  HttpError,
  clearSessionCookie,
  createLoginSession,
  hashLegacyPassword,
  isLegacyPasswordHash,
  mergeVerifiedContextIntoPayload,
  parseRequestBody,
  requireRequestContext,
  setSessionCookie,
  toLegacySessionUser,
  verifyLegacyPassword
};
