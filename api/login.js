export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const { username, password } = req.body || {};

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return res.status(401).json({
      error: "Usuario o contraseña incorrectos"
    });
  }

  res.setHeader(
    "Set-Cookie",
    `santi_session=${process.env.AUTH_TOKEN}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  );

  return res.status(200).json({
    ok: true
  });
}