import { createHmac, timingSafeEqual } from 'node:crypto';

const secret = () => process.env.ADMIN_SESSION_SECRET || '';
const b64url = (s) => Buffer.from(s).toString('base64url');

export function issueToken() {
  const payload = b64url(JSON.stringify({ role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 }));
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isAdmin(event) {
  if (!secret()) return false;
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret()).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'base64url'); } catch { return false; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.role === 'admin' && Number(data.exp) > Date.now();
  } catch { return false; }
}
