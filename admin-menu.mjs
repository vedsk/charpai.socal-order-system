import { menuStore, readMenu, json, parseBody } from './lib/data.mjs';
import { isAdmin } from './lib/auth.mjs';

const slug = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

export default async (event) => {
  if (!isAdmin(event)) return json({ error: 'Please sign in again.' }, 401);
  if (event.httpMethod === 'GET') return json({ items: await readMenu() });
  if (event.httpMethod !== 'PUT') return json({ error: 'Method not allowed' }, 405, { allow: 'GET, PUT' });
  const body = parseBody(event);
  if (!body || !Array.isArray(body.items) || body.items.length > 300) return json({ error: 'Invalid menu data.' }, 400);
  const seen = new Set();
  const items = [];
  for (const raw of body.items) {
    const name = String(raw.name || '').trim().slice(0, 100);
    const category = String(raw.category || '').trim().slice(0, 60);
    const price = Number(raw.price);
    if (!name || !category || !Number.isFinite(price) || price < 0 || price > 100000) return json({ error: 'Every item needs a name, category and valid price.' }, 400);
    let id = slug(raw.id || name) || `item-${items.length + 1}`;
    if (seen.has(id)) id = `${id}-${items.length + 1}`;
    seen.add(id);
    items.push({ id, name, category, description: String(raw.description || '').trim().slice(0, 250), price: Math.round(price * 100) / 100, veg: raw.veg !== false, available: raw.available !== false });
  }
  await (await menuStore()).setJSON('menu', items);
  return json({ items });
};
