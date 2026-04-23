const {
  HttpError,
  createLoginSession,
  parseRequestBody,
  setSessionCookie,
  toLegacySessionUser
} = require("./_lib/auth");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    if (request.method !== "POST") {
      return response.status(405).json({
        ok: false,
        message: "Method not allowed."
      });
    }

    const payload = parseRequestBody(request);
    const { token, context } = await createLoginSession(payload.email, payload.password);
    setSessionCookie(response, token);

    return response.status(200).json({
      ok: true,
      data: {
        user: toLegacySessionUser(context)
      }
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      ok: false,
      message: error instanceof HttpError || error.message ? error.message : "A aparut o eroare neasteptata."
    });
  }
};
