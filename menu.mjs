import { readMenu, json } from './lib/data.mjs';
export default async () => {
  try {
    const menu = await readMenu();
    return json({ items: menu.filter(item => item.available) });
  } catch (error) {
    console.error('Menu read failed', error);
    return json({ error: 'Menu is temporarily unavailable.' }, 500);
  }
};
