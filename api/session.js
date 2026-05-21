function isAuthenticated(req) {
  const cookie = req.headers.cookie || "";

  return cookie.includes(
    `santi_session=${process.env.AUTH_TOKEN}`
  );
}

export default async function handler(req, res) {
  return res.status(200).json({
    authenticated: isAuthenticated(req)
  });
}