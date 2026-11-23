import React from 'react';
import { getStoredDeals } from '@/lib/storage';
import DealsClientView from './DealsClientView';

// Ensure the page is dynamically rendered so stored deals are always fresh
export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialDeals = await getStoredDeals();

  return <DealsClientView initialDeals={initialDeals} />;
}
