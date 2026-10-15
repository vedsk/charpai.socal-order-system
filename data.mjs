import { getStore } from '@netlify/blobs';

export const menuStore = () => getStore('charpai-ordering-menu');
export const orderStore = () => getStore('charpai-ordering-orders');

export const starterMenu = [
  { id: 'veg-paneer-tikka', name: 'Paneer Tikka', category: 'Veg Starters', description: 'Smoky marinated paneer, grilled with peppers.', price: 249, veg: true, available: true },
  { id: 'veg-hara-bhara-kebab', name: 'Hara Bhara Kebab', category: 'Veg Starters', description: 'Crispy spinach and green pea kebabs.', price: 199, veg: true, available: true },
  { id: 'veg-french-fries', name: 'French Fries', category: 'Fries', description: 'Golden, crisp fries with seasoning.', price: 129, veg: true, available: true },
  { id: 'veg-paneer-butter-masala', name: 'Paneer Butter Masala', category: 'Main Course', description: 'Paneer in a rich tomato and butter gravy.', price: 299, veg: true, available: true },
  { id: 'veg-dal-tadka', name: 'Dal Tadka', category: 'Main Course', description: 'Yellow lentils finished with a tadka.', price: 219, veg: true, available: true },
  { id: 'nonveg-chicken-tikka', name: 'Chicken Tikka', category: 'Non-Veg Starters', description: 'Char-grilled chicken with house spices.', price: 299, veg: false, available: true },
  { id: 'nonveg-chicken-lollipop', name: 'Chicken Lollipop', category: 'Non-Veg Starters', description: 'Crispy, flavourful chicken lollipops.', price: 279, veg: false, available: true },
  { id: 'nonveg-chicken-biryani', name: 'Chicken Biryani', category: 'Biryani & Rice', description: 'Fragrant basmati rice with spiced chicken.', price: 329, veg: false, available: true },
  { id: 'drinks-masala-soda', name: 'Masala Soda', category: 'Beverages', description: 'Refreshing fizzy soda with masala.', price: 79, veg: true, available: true }
];

export async function readMenu() {
  const store = menuStore();
  const existing = await store.get('menu', { type: 'json' });
  if (Array.isArray(existing)) return existing;
  await store.setJSON('menu', starterMenu);
  return starterMenu;
}

export function json(body, statusCode = 200, extraHeaders = {}) {
  return { statusCode, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders }, body: JSON.stringify(body) };
}

export function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return null; }
}
