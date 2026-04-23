const {
  HttpError,
  createLoginSession,
  parseRequestBody,
  setSessionCookie,
  clearSessionCookie,
  requireRequestContext,
  toLegacySessionUser
} = require("./_lib/auth");
const {
  getResource,
  sendJson,
  sendMethodNotAllowed,
  sendUnexpectedError,
  setJsonHeaders
} = require("./_lib/http");

module.exports = async function handler(request, response) {
  setJsonHeaders(response);

  try {
    const resource = getResource(request);

    if (resource === "login") {
      if (request.method !== "POST") {
        return sendMethodNotAllowed(response);
      }

      const payload = parseRequestBody(request);
      const { token, context } = await createLoginSession(payload.email, payload.password);
      setSessionCookie(response, token);

      return sendJson(response, 200, {
        ok: true,
        data: {
          user: toLegacySessionUser(context)
        }
      });
    }

    if (resource === "logout") {
      if (request.method !== "POST") {
        return sendMethodNotAllowed(response);
      }

      clearSessionCookie(response);
      return sendJson(response, 200, {
        ok: true,
        message: "Te-ai delogat din aplicatie."
      });
    }

    if (resource === "session") {
      if (request.method !== "GET") {
        return sendMethodNotAllowed(response);
      }

      const context = await requireRequestContext(request);
      return sendJson(response, 200, {
        ok: true,
        data: {
          user: toLegacySessionUser(context)
        }
      });
    }

    return sendJson(response, 404, {
      ok: false,
      message: "Auth resource not found."
    });
  } catch (error) {
    return sendJson(response, error.status || 500, {
      ok: false,
      message: error instanceof HttpError || error.message ? error.message : "A aparut o eroare neasteptata."
    });
  }
};
