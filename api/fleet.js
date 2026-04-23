const {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require("./_lib/vehicles-service");
const {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require("./_lib/assignments-service");
const {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} = require("./_lib/documents-service");
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

    if (resource === "vehicles") {
      if (request.method === "GET") {
        return sendResult(response, await listVehicles(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createVehicle(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateVehicle(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteVehicle(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "assignments") {
      if (request.method === "GET") {
        return sendResult(response, await listAssignments(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createAssignment(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateAssignment(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteAssignment(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "documents") {
      if (request.method === "GET") {
        return sendResult(response, await listDocuments(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createDocument(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateDocument(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteDocument(payload));
      }
      return sendMethodNotAllowed(response);
    }

    return sendJson(response, 404, {
      ok: false,
      message: "Fleet resource not found."
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
};
