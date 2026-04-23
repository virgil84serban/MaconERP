const { getDashboardSummary } = require("./_lib/dashboard-service");
const { requireRequestContext } = require("./_lib/auth");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const context = await requireRequestContext(request);

    if (request.method !== "GET") {
      return response.status(405).json({
        ok: false,
        message: "Method not allowed."
      });
    }

    const result = await getDashboardSummary(context);

    return response.status(result.ok ? 200 : 400).json(result);
  } catch (error) {
    return response.status(error.status || 500).json({
      ok: false,
      message: error && error.message ? error.message : "A aparut o eroare neasteptata."
    });
  }
};
