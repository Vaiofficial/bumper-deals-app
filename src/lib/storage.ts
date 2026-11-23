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

const MAX_DEALS_STORED = 2000;
const MAX_DEAL_AGE_HOURS = 48; // Expire deals not seen or refreshed within 48 hours

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
    const now = Date.now();
    const maxAgeMs = MAX_DEAL_AGE_HOURS * 60 * 60 * 1000;

    // Retain existing deals only if they haven't expired (< 48 hours old)
    for (const deal of existingDeals) {
      const lastCheckedTime = new Date(deal.lastCheckedAt || deal.discoveredAt || 0).getTime();
      if (now - lastCheckedTime < maxAgeMs) {
        dealMap.set(deal.id, deal);
      }
    }

    // Upsert new fresh deals
    for (const deal of newDeals) {
      dealMap.set(deal.id, {
        ...deal,
        lastCheckedAt: new Date().toISOString(),
      });
    }

    const merged = Array.from(dealMap.values()).sort(
      (a, b) => b.discountPercentage - a.discountPercentage
    );

    // Keep up to MAX_DEALS_STORED deals (expanded from 600 to 2,000)
    const pruned = merged.slice(0, MAX_DEALS_STORED);

    fs.writeFileSync(DEALS_FILE, JSON.stringify(pruned, null, 2), 'utf-8');
    return pruned;
  } catch (error) {
    console.error('Error saving deals:', error);
    return [];
  }
}
