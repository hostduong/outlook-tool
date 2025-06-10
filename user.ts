import { hashPassword, randomApiKey, randomBase32 } from "./utils";

export async function registerUser(request, env) {
  const { email, pass } = await request.json();
  const emailLC = email.trim().toLowerCase();
  if (!emailLC || !pass) return Response.json({ error: "Missing email or password" }, { status: 400 });

  // Kiểm tra user tồn tại
  if (await env.KV_USER.get(`user:${emailLC}`)) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }
  const hash = await hashPassword(pass);
  const api_key = randomApiKey();
  const base32 = randomBase32();
  const time = new Date().toISOString();

  await Promise.all([
    env.KV_USER.put(`user:${emailLC}`, JSON.stringify({ pass: hash, api_key, base32, time })),
    env.KV_USER.put(`api_key:${api_key}`, JSON.stringify({ email: emailLC, pass: hash }))
  ]);

  return Response.json({ ok: true, api_key, base32 });
}

export async function loginUser(request, env) {
  const { email, pass } = await request.json();
  const emailLC = email.trim().toLowerCase();
  const userStr = await env.KV_USER.get(`user:${emailLC}`);
  if (!userStr) return Response.json({ error: "User not found" }, { status: 404 });

  const user = JSON.parse(userStr);
  if (!(await hashPassword(pass, user.pass))) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  return Response.json({ ok: true, api_key: user.api_key, base32: user.base32 });
}
