function getPublicSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return {
    enabled: Boolean(url && anonKey),
    url,
    anonKey
  };
}

function getServerSupabaseConfig() {
  const publicConfig = getPublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return {
    ...publicConfig,
    serviceRoleKey
  };
}

module.exports = {
  getPublicSupabaseConfig,
  getServerSupabaseConfig
};
