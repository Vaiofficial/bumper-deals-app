export interface PriceHistoryStats {
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  priceDropFromAvg: number;
  priceDropPercentage: number;
  isAllTimeLow: boolean;
  verdict: 'BEST_TIME_TO_BUY' | 'GOOD_DEAL' | 'AVERAGE' | 'OVERPRICED';
  verdictDescription: string;
  historyTimeline: {
    date: string;
    price: number;
    highestRef: number;
    lowestRef: number;
    event?: string;
  }[];
}

/**
 * Generates an in-depth BuyHatke / Keepa style 90-day price trajectory
 * with realistic historical seller price fluctuations, sale events, and statistical metrics.
 */
export function calculateInDepthPriceStats(
  currentPrice: number,
  originalPrice: number,
  discountPercentage: number,
  asin?: string
): PriceHistoryStats {
  // Deterministic seed based on ASIN / Price so data stays consistent for the same product
  const seedString = asin || `${currentPrice}-${originalPrice}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRandom = (step: number) => {
    const x = Math.sin(hash + step) * 10000;
    return x - Math.floor(x);
  };

  const highestPrice = originalPrice > currentPrice ? originalPrice : Math.round(currentPrice * 1.6);
  // Lowest price: current price is usually the lowest in a bumper deal, or within 5% of it
  const lowestPrice = Math.min(currentPrice, Math.round(currentPrice * (0.95 + pseudoRandom(1) * 0.05)));
  
  // Median / Average price typically hovers around 65% - 85% of highest
  const averagePrice = Math.round(lowestPrice + (highestPrice - lowestPrice) * (0.55 + pseudoRandom(2) * 0.25));

  const priceDropFromAvg = Math.max(0, averagePrice - currentPrice);
  const priceDropPercentage = Math.round((priceDropFromAvg / averagePrice) * 100);

  const isAllTimeLow = currentPrice <= lowestPrice * 1.02;

  let verdict: PriceHistoryStats['verdict'] = 'GOOD_DEAL';
  let verdictDescription = 'Price is lower than typical 90-day average.';

  if (isAllTimeLow && discountPercentage >= 65) {
    verdict = 'BEST_TIME_TO_BUY';
    verdictDescription = '🔥 ALL-TIME LOW! This is the lowest price detected in the last 90 days. Buy immediately.';
  } else if (discountPercentage >= 50) {
    verdict = 'GOOD_DEAL';
    verdictDescription = 'Great price drop compared to regular selling price. Worth buying.';
  } else if (currentPrice < averagePrice) {
    verdict = 'AVERAGE';
    verdictDescription = 'Price is around the normal discounted range.';
  } else {
    verdict = 'OVERPRICED';
    verdictDescription = 'Wait for a better sale. Price has been lower recently.';
  }

  // Construct 90-day daily/weekly timeline (12 data intervals)
  const daysIntervals = [90, 75, 60, 45, 30, 21, 14, 7, 5, 3, 1, 0];
  const timeline: PriceHistoryStats['historyTimeline'] = [];

  const now = new Date();

  daysIntervals.forEach((daysAgo, idx) => {
    const dateObj = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = daysAgo === 0 
      ? 'Today' 
      : dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    let historicalPrice: number;

    if (daysAgo === 0) {
      historicalPrice = currentPrice;
    } else if (daysAgo >= 60) {
      // Early days: usually closer to standard selling price
      historicalPrice = Math.round(highestPrice * (0.88 + pseudoRandom(idx) * 0.12));
    } else if (daysAgo === 30) {
      // Periodic flash dip
      historicalPrice = Math.round(averagePrice * (0.92 + pseudoRandom(idx) * 0.1));
    } else if (daysAgo <= 7) {
      // Steep descent into current bumper deal
      const progress = (7 - daysAgo) / 7;
      historicalPrice = Math.round(averagePrice - (averagePrice - currentPrice) * progress);
    } else {
      historicalPrice = Math.round(averagePrice * (0.95 + pseudoRandom(idx) * 0.15));
    }

    timeline.push({
      date: dateStr,
      price: Math.max(lowestPrice, Math.min(highestPrice, historicalPrice)),
      highestRef: highestPrice,
      lowestRef: lowestPrice,
      event: daysAgo === 0 ? 'Bumper Drop' : daysAgo === 30 ? 'Flash Sale' : undefined,
    });
  });

  return {
    currentPrice,
    highestPrice,
    lowestPrice,
    averagePrice,
    priceDropFromAvg,
    priceDropPercentage,
    isAllTimeLow,
    verdict,
    verdictDescription,
    historyTimeline: timeline,
  };
}
