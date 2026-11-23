import { fetchAmazonIndiaDeals } from '../src/lib/scraper';
import { saveDeals, getStoredDeals } from '../src/lib/storage';

async function main() {
  console.log(`[Scraper Script] Starting deals fetch at ${new Date().toISOString()}...`);
  
  const existing = await getStoredDeals();
  console.log(`[Scraper Script] Currently stored deals: ${existing.length}`);

  const freshDeals = await fetchAmazonIndiaDeals();
  console.log(`[Scraper Script] Scraped ${freshDeals.length} deals from Amazon India.`);

  if (freshDeals.length > 0) {
    const updated = await saveDeals(freshDeals);
    console.log(`[Scraper Script] Successfully saved and pruned. Total deals in database: ${updated.length}`);
  } else {
    console.warn('[Scraper Script] Warning: No deals were scraped. Keeping existing dataset.');
  }
}

main().catch((err) => {
  console.error('[Scraper Script] Fatal error running scrape:', err);
  process.exit(1);
});
