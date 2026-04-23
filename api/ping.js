module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    return response.status(405).json({
      ok: false,
      message: "Method not allowed."
    });
  }

  return response.status(200).json({
    ok: true,
    message: "pong",
    data: {
      timestamp: new Date().toISOString()
    }
  });
};
