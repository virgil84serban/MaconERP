const {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} = require("./_lib/users-service");
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
      const result = await listUsers(context);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    const payload = mergeVerifiedContextIntoPayload(parseRequestBody(request), context);

    if (request.method === "POST") {
      const result = await createUser(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    if (request.method === "PUT") {
      const result = await updateUser(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    if (request.method === "DELETE") {
      const result = await deleteUser(payload);
      return response.status(result.ok ? 200 : 400).json(result);
    }

    return response.status(405).json({
      ok: false,
      message: "Method not allowed."
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      ok: false,
      message: error && error.message ? error.message : "A aparut o eroare neasteptata."
    });
  }
};
