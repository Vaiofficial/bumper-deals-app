import { NextResponse } from 'next/server';
import { getStoredDeals, saveDeals } from '@/lib/storage';
import { fetchAmazonIndiaDeals } from '@/lib/scraper';

export async function GET() {
  try {
    let deals = await getStoredDeals();

    // If storage is empty, do an initial fetch
    if (deals.length === 0) {
      const scraped = await fetchAmazonIndiaDeals();
      if (scraped.length > 0) {
        deals = await saveDeals(scraped);
      }
    }

    return NextResponse.json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
