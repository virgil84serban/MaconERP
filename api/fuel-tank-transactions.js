const {
  listFuelTankTransactions,
  createFuelTankTransaction,
  updateFuelTankTransaction,
  deleteFuelTankTransaction
} = require("./_lib/fuel-tanks-service");
const {
  mergeVerifiedContextIntoPayload,
  parseRequestBody,
  requireRequestContext
} = require("./_lib/auth");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const context = await requireRequestContext(request);

    if (request.method === "GET") {
      const result = await listFuelTankTransactions(context);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);

    if (request.method === "POST") {
      const result = await createFuelTankTransaction(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    if (request.method === "PUT") {
      const result = await updateFuelTankTransaction(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    if (request.method === "DELETE") {
      const result = await deleteFuelTankTransaction(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    return response.status(405).json({ ok: false, message: "Method not allowed." });
  } catch (error) {
    return response.status(error.status || 500).json({
      ok: false,
      message: error && error.message ? error.message : "A aparut o eroare neasteptata."
    });
  }
};
