const { clearSessionCookie } = require("./_lib/auth");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    return response.status(405).json({
      ok: false,
      message: "Method not allowed."
    });
  }

  clearSessionCookie(response);
  return response.status(200).json({
    ok: true,
    message: "Te-ai delogat din aplicatie."
  });
};
