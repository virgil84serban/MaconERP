const { getDashboardSummary } = require("./_lib/dashboard-service");
const {
  listTripSheets,
  createTripSheet,
  updateTripSheet,
  deleteTripSheet
} = require("./_lib/trip-sheets-service");
const {
  listDefects,
  createDefect,
  updateDefect,
  deleteDefect
} = require("./_lib/defects-service");
const {
  listRevisions,
  createRevision,
  updateRevision,
  deleteRevision
} = require("./_lib/revisions-service");
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

    if (resource === "dashboard-summary") {
      if (request.method !== "GET") {
        return sendMethodNotAllowed(response);
      }
      return sendResult(response, await getDashboardSummary(context));
    }

    if (resource === "trip-sheets") {
      if (request.method === "GET") {
        return sendResult(response, await listTripSheets(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createTripSheet(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateTripSheet(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteTripSheet(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "defects") {
      if (request.method === "GET") {
        return sendResult(response, await listDefects(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createDefect(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateDefect(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteDefect(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "revisions") {
      if (request.method === "GET") {
        return sendResult(response, await listRevisions(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createRevision(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateRevision(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteRevision(payload));
      }
      return sendMethodNotAllowed(response);
    }

    return sendJson(response, 404, {
      ok: false,
      message: "Operations resource not found."
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
};
