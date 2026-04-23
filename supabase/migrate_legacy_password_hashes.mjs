#!/usr/bin/env node

import crypto from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LEGACY_PASSWORD_SCHEME = "scrypt";
const LEGACY_PASSWORD_KEY_LENGTH = 64;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const profiles = await supabaseRest("/rest/v1/user_profiles?select=id,email,metadata");
  let updated = 0;
  let skipped = 0;

  for (const profile of profiles || []) {
    const metadata = profile && profile.metadata ? profile.metadata : {};
    const rawPassword = text(metadata.legacy_password_hash);

    if (!rawPassword) {
      skipped += 1;
      continue;
    }

    if (isLegacyPasswordHash(rawPassword)) {
      skipped += 1;
      continue;
    }

    const nextMetadata = {
      ...metadata,
      legacy_password_hash: hashLegacyPassword(rawPassword)
    };

    await supabaseRest(`/rest/v1/user_profiles?id=eq.${encodeURIComponent(profile.id)}`, {
      method: "PATCH",
      body: {
        metadata: nextMetadata
      },
      prefer: "return=minimal"
    });

    updated += 1;
    console.log(`Hashed legacy password for ${profile.email || profile.id}`);
  }

  console.log(`Done. Updated: ${updated}, skipped: ${skipped}`);
}

function hashLegacyPassword(password) {
  const normalizedPassword = String(password || "");
  const salt = crypto.randomBytes(16).toString("base64url");
  const derivedKey = crypto.scryptSync(normalizedPassword, salt, LEGACY_PASSWORD_KEY_LENGTH).toString("base64url");
  return `${LEGACY_PASSWORD_SCHEME}$${salt}$${derivedKey}`;
}

function isLegacyPasswordHash(value) {
  return text(value).startsWith(`${LEGACY_PASSWORD_SCHEME}$`);
}

function text(value) {
  return String(value || "").trim();
}

async function supabaseRest(resourcePath, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${resourcePath}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const textBody = await response.text();
  const data = textBody ? JSON.parse(textBody) : null;

  if (!response.ok) {
    throw new Error((data && data.message) || textBody || `Supabase request failed (${response.status}).`);
  }

  return data;
}
