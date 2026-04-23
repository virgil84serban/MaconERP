const { getPublicSupabaseConfig } = require("./_lib/supabase-env");
const {
  getResource,
  sendJson,
  sendMethodNotAllowed,
  setJsonHeaders
} = require("./_lib/http");

module.exports = async function handler(request, response) {
  setJsonHeaders(response);

  const resource = getResource(request);

  if (resource === "ping") {
    if (request.method !== "GET") {
      return sendMethodNotAllowed(response);
    }

    return sendJson(response, 200, {
      ok: true,
      message: "pong",
      data: {
        timestamp: new Date().toISOString()
      }
    });
  }

  if (resource === "runtime-config") {
    return sendJson(response, 200, {
      ok: true,
      supabase: getPublicSupabaseConfig()
    });
  }

  return sendJson(response, 404, {
    ok: false,
    message: "Misc resource not found."
  });
};
