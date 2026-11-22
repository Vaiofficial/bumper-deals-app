import { NextRequest, NextResponse } from 'next/server';
import { fetchAmazonIndiaDeals } from '@/lib/scraper';
import { saveDeals } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    // Optional secret key verification for Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development or if CRON_SECRET is not set, allow execution
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[Cron] Starting Amazon India deals scan...');
    const deals = await fetchAmazonIndiaDeals();
    console.log(`[Cron] Found ${deals.length} deals.`);

    const saved = await saveDeals(deals);

    return NextResponse.json({
      success: true,
      message: `Refreshed deals successfully. Found ${deals.length} deals. Total stored: ${saved.length}`,
      timestamp: new Date().toISOString(),
      topDeals: saved.slice(0, 5),
    });
  } catch (error: any) {
    console.error('[Cron] Error refreshing deals:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}
