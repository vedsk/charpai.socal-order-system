import { randomUUID } from 'node:crypto';
import { orderStore, readMenu, json, parseBody } from './lib/data.mjs';
import { isAdmin } from './lib/auth.mjs';

const allowedStatuses = new Set(['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']);
const money = n => Math.round(n * 100) / 100;

export default async (event) => {
  const store = orderStore();
  if (event.httpMethod === 'POST') {
    const body = parseBody(event);
    if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 60) return json({ error: 'Your cart is empty or invalid.' }, 400);
    const type = body.type === 'dine-in' ? 'dine-in' : body.type === 'takeaway' ? 'takeaway' : null;
    if (!type) return json({ error: 'Choose dine-in or takeaway.' }, 400);
    const table = String(body.tableNumber || '').trim().slice(0, 20);
    if (type === 'dine-in' && !table) return json({ error: 'Enter your table number for dine-in.' }, 400);
    const customerName = String(body.customerName || '').trim().slice(0, 80);
    const notes = String(body.notes || '').trim().slice(0, 300);
    if (!customerName) return json({ error: 'Enter a name for this order.' }, 400);
    const menu = await readMenu();
    const byId = new Map(menu.filter(item => item.available).map(item => [item.id, item]));
    const lines = [];
    for (const requested of body.items) {
      const item = byId.get(String(requested.id));
      const quantity = Number(requested.quantity);
      if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json({ error: 'One or more items are unavailable. Refresh the menu and try again.' }, 400);
      lines.push({ id: item.id, name: item.name, price: item.price, quantity, lineTotal: money(item.price * quantity), veg: item.veg });
    }
    const total = money(lines.reduce((sum, line) => sum + line.lineTotal, 0));
    const now = new Date().toISOString();
    const order = {
      id: randomUUID().slice(0, 8).toUpperCase(),
      createdAt: now,
      updatedAt: now,
      customerName,
      type,
      tableNumber: type === 'dine-in' ? table : '',
      notes,
      paymentMethod: 'Pay at counter / after meal',
      paymentStatus: 'UNPAID',
      items: lines,
      total,
      status: 'NEW'
    };
    await store.setJSON(`orders/${Date.now()}-${order.id}`, order);
    return json({ order: { id: order.id, createdAt: order.createdAt, total: order.total, status: order.status } }, 201);
  }

  if (event.httpMethod === 'GET') {
    if (!isAdmin(event)) return json({ error: 'Please sign in to view orders.' }, 401);
    const listing = await store.list({ prefix: 'orders/' });
    const orders = await Promise.all((listing.blobs || []).map(blob => store.get(blob.key, { type: 'json' })));
    orders.sort((a, b) => String(b?.createdAt).localeCompare(String(a?.createdAt)));
    return json({ orders: orders.filter(Boolean) });
  }

  if (event.httpMethod === 'PATCH') {
    if (!isAdmin(event)) return json({ error: 'Please sign in to update orders.' }, 401);
    const body = parseBody(event);
    if (!body || !allowedStatuses.has(body.status)) return json({ error: 'Invalid order status.' }, 400);
    const listing = await store.list({ prefix: 'orders/' });
    for (const blob of listing.blobs || []) {
      const order = await store.get(blob.key, { type: 'json' });
      if (order?.id === event.queryStringParameters?.id) {
        order.status = body.status;
        order.updatedAt = new Date().toISOString();
        await store.setJSON(blob.key, order);
        return json({ order });
      }
    }
    return json({ error: 'Order not found.' }, 404);
  }
  return json({ error: 'Method not allowed' }, 405, { allow: 'GET, POST, PATCH' });
};
