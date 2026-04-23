const {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} = require("./_lib/users-service");
const {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver
} = require("./_lib/drivers-service");
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

    if (resource === "users") {
      if (request.method === "GET") {
        return sendResult(response, await listUsers(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createUser(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateUser(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteUser(payload));
      }
      return sendMethodNotAllowed(response);
    }

    if (resource === "drivers") {
      if (request.method === "GET") {
        return sendResult(response, await listDrivers(context));
      }

      const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);
      if (request.method === "POST") {
        return sendResult(response, await createDriver(payload));
      }
      if (request.method === "PUT") {
        return sendResult(response, await updateDriver(payload));
      }
      if (request.method === "DELETE") {
        return sendResult(response, await deleteDriver(payload));
      }
      return sendMethodNotAllowed(response);
    }

    return sendJson(response, 404, {
      ok: false,
      message: "Admin resource not found."
    });
  } catch (error) {
    return sendUnexpectedError(response, error);
  }
};
