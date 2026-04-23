const { getServerSupabaseConfig } = require("./supabase-env");

function getSupabaseAdminConfig() {
  const config = getServerSupabaseConfig();

  if (!config.url || !config.serviceRoleKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return config;
}

async function supabaseRest(resourcePath, options = {}) {
  const config = getSupabaseAdminConfig();
  const response = await fetch(`${config.url}${resourcePath}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data && data.message ? data.message : text || `Supabase request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function buildSelectPath(table, query = "") {
  return `/rest/v1/${table}${query ? `?${query}` : ""}`;
}

module.exports = {
  getSupabaseAdminConfig,
  supabaseRest,
  buildSelectPath
};
