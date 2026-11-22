import fs from 'fs';
import path from 'path';
import { WishlistItem } from '@/types/deal';

const DATA_DIR = path.join(process.cwd(), 'data');
const WISHLIST_FILE = path.join(DATA_DIR, 'wishlist.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getStoredWishlist(): Promise<WishlistItem[]> {
  try {
    ensureDataDir();
    if (!fs.existsSync(WISHLIST_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(WISHLIST_FILE, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading stored wishlist:', error);
    return [];
  }
}

export async function saveWishlistItem(item: WishlistItem): Promise<WishlistItem[]> {
  try {
    ensureDataDir();
    const items = await getStoredWishlist();
    const index = items.findIndex((w) => w.asin === item.asin || w.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    fs.writeFileSync(WISHLIST_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return items;
  } catch (error) {
    console.error('Error saving wishlist item:', error);
    return [];
  }
}

export async function removeWishlistItem(id: string): Promise<WishlistItem[]> {
  try {
    ensureDataDir();
    const items = await getStoredWishlist();
    const filtered = items.filter((w) => w.id !== id && w.asin !== id);
    fs.writeFileSync(WISHLIST_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return filtered;
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    return [];
  }
}
