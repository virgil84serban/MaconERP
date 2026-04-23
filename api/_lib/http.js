function setJsonHeaders(response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
}

function sendJson(response, status, payload) {
  return response.status(status).json(payload);
}

function sendResult(response, result) {
  return sendJson(response, result && result.ok ? 200 : 400, result);
}

function parseRequestUrl(request) {
  return new URL(request.url, "http://localhost");
}

function getResource(request) {
  return parseRequestUrl(request).searchParams.get("resource") || "";
}

function sendMethodNotAllowed(response) {
  return sendJson(response, 405, {
    ok: false,
    message: "Method not allowed."
  });
}

function sendUnexpectedError(response, error) {
  return sendJson(response, error.status || 500, {
    ok: false,
    message: error && error.message ? error.message : "A aparut o eroare neasteptata."
  });
}

module.exports = {
  getResource,
  sendJson,
  sendMethodNotAllowed,
  sendResult,
  sendUnexpectedError,
  setJsonHeaders
};
