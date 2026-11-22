import fs from 'fs';
import path from 'path';
import { DealItem } from '@/types/deal';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getStoredDeals(): Promise<DealItem[]> {
  try {
    ensureDataDir();
    if (!fs.existsSync(DEALS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DEALS_FILE, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading stored deals:', error);
    return [];
  }
}

export async function saveDeals(newDeals: DealItem[]): Promise<DealItem[]> {
  try {
    ensureDataDir();
    const existingDeals = await getStoredDeals();
    const dealMap = new Map<string, DealItem>();

    // Existing deals
    for (const deal of existingDeals) {
      dealMap.set(deal.id, deal);
    }

    // Upsert new deals
    for (const deal of newDeals) {
      dealMap.set(deal.id, deal);
    }

    const merged = Array.from(dealMap.values()).sort(
      (a, b) => b.discountPercentage - a.discountPercentage
    );

    // Keep top 600 deals
    const pruned = merged.slice(0, 600);

    fs.writeFileSync(DEALS_FILE, JSON.stringify(pruned, null, 2), 'utf-8');
    return pruned;
  } catch (error) {
    console.error('Error saving deals:', error);
    return [];
  }
}
