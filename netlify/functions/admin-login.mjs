import { issueToken } from './lib/auth.mjs';
import { json, parseBody } from './lib/data.mjs';

export default async (event) => {
  if (event.httpMethod !== 'POST') return json({ error: 'Method not allowed' }, 405, { allow: 'POST' });
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) return json({ error: 'Admin credentials are not configured in Netlify.' }, 503);
  const body = parseBody(event);
  if (!body || typeof body.password !== 'string') return json({ error: 'Enter your admin password.' }, 400);
  const a = Buffer.from(body.password);
  const b = Buffer.from(process.env.ADMIN_PASSWORD);
  // Compare only after checking lengths to avoid timingSafeEqual throwing.
  const { timingSafeEqual } = await import('node:crypto');
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return json({ error: 'Incorrect password.' }, 401);
  return json({ token: issueToken(), expiresIn: 28800 });
};
