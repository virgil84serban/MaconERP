const { listFuelTanks } = require("./_lib/fuel-tanks-service");
const {
  listFuelEntries,
  createFuelEntry,
  updateFuelEntry,
  deleteFuelEntry
} = require("./_lib/fuel-service");
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
const {
  getResource,
  sendJson,
  sendMethodNotAllowed,
  sendResult,
  sendUnexpectedError,
  setJsonHeaders
} = require("./_lib/http");

module.exports = async function handler(request, response) {
  setJsonHeaders(response);

  try {
    const resource = getResource(request);
    const context = await requireRequestContext(request);

    if (resource === "fuel-entries") {
      if (request.method === "GET") {
        return sendResult(response, await listFuelEntries(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createFuelEntry(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateFuelEntry(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteFuelEntry(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "fuel-tanks") {
      if (request.method !== "GET") {
        return sendMethodNotAllowed(response);
      }
      return sendResult(response, await listFuelTanks(context));
    }

    if (resource === "fuel-tank-transactions") {
      if (request.method === "GET") {
        return sendResult(response, await listFuelTankTransactions(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createFuelTankTransaction(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateFuelTankTransaction(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteFuelTankTransaction(payload));
      }
      return sendMethodNotAllowed(response);
    }

    return sendJson(response, 404, {
      ok: false,
      message: "Fuel resource not found."
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
};
