import React from 'react';
import { getStoredDeals } from '@/lib/storage';
import DealsClientView from './DealsClientView';

// Ensure the page is dynamically rendered so stored deals are always fresh
export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialDeals = await getStoredDeals();

  // Structured ItemList schema for Google Product Rich Snippets
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Amazon India Verified Deals, Discounts & Loot Offers',
    itemListElement: initialDeals.slice(0, 30).map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: deal.title,
        image: deal.imageUrl || undefined,
        description: `Save ${deal.discountPercentage}% on ${deal.title}. Live verified price drop on Amazon India.`,
        brand: {
          '@type': 'Brand',
          name: deal.brandName || 'Amazon Brand',
        },
        offers: {
          '@type': 'Offer',
          price: deal.currentPrice,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `https://bumper-deals-app.vercel.app/?deal=${deal.id}`,
          seller: {
            '@type': 'Organization',
            name: 'Amazon India',
          },
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <DealsClientView initialDeals={initialDeals} />
    </>
  );
}
