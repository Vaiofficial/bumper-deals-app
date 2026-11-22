import * as cheerio from 'cheerio';
import { WishlistItem } from '@/types/deal';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function extractAsinFromInput(input: string): string | null {
  const clean = input.trim();
  // Standard 10-char ASIN (e.g. B08N5WRWNW)
  if (/^[A-Z0-9]{10}$/i.test(clean)) {
    return clean.toUpperCase();
  }
  // URL matching /dp/ASIN or /gp/product/ASIN
  const match = clean.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

export async function fetchProductByAsin(asin: string, targetPrice: number): Promise<WishlistItem | null> {
  const url = `https://www.amazon.in/dp/${asin}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('#productTitle').text().trim() || $('h1').first().text().trim() || `Amazon Item (${asin})`;

    // Extract Image
    let imageUrl = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src') || $('.a-dynamic-image').first().attr('src') || '';

    // Extract Price
    let currentPriceText = $('.a-price .a-offscreen').first().text().replace(/[^\d.]/g, '');
    let originalPriceText = $('.a-price[data-a-strike="true"] .a-offscreen, .basisPrice .a-offscreen').first().text().replace(/[^\d.]/g, '');

    const currentPrice = parseFloat(currentPriceText) || 0;
    const originalPrice = parseFloat(originalPriceText) || currentPrice;

    if (!currentPrice || currentPrice <= 0) {
      return null;
    }

    return {
      id: asin,
      asin,
      title,
      targetPrice,
      currentPrice,
      originalPrice,
      imageUrl,
      url,
      isTargetMet: currentPrice <= targetPrice,
      addedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`Error fetching ASIN ${asin}:`, err);
    return null;
  }
}
