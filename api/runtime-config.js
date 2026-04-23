const { getPublicSupabaseConfig } = require("./_lib/supabase-env");

module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  return response.status(200).json({
    ok: true,
    supabase: getPublicSupabaseConfig()
  });
};
