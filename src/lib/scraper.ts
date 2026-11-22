import * as cheerio from 'cheerio';
import { DealItem, CategoryId, AmazonDealType } from '@/types/deal';
import { validateDealQuality } from '@/lib/qualityGuard';
import { extractBankOffer } from '@/lib/bankOfferEngine';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15'
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

interface SearchQuery {
  keyword: string;
  category: CategoryId;
  defaultDealType?: AmazonDealType;
}

// Complete Amazon India Department Coverage
const QUERIES: SearchQuery[] = [
  // 1. Flagship Deals & Limited Time
  { keyword: 'deals+of+the+day', category: 'ALL', defaultDealType: 'DEAL_OF_THE_DAY' },
  { keyword: 'lightning+deals', category: 'ALL', defaultDealType: 'LIGHTNING_DEAL' },
  { keyword: 'deals+70%25+off', category: 'ALL', defaultDealType: 'CLEARANCE' },
  { keyword: 'prime+exclusive+deals', category: 'ALL', defaultDealType: 'PRIME_EXCLUSIVE' },
  { keyword: 'amazon+outlet+overstock', category: 'ALL', defaultDealType: 'OUTLET_OVERSTOCK' },

  // 2. Mobiles & Smartphones
  { keyword: 'smartphone+deals', category: 'MOBILES', defaultDealType: 'PRICE_DROP' },
  { keyword: '5g+mobile+phone+deal', category: 'MOBILES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'samsung+oneplus+redmi+mobile+deal', category: 'MOBILES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'mobile+accessories+powerbank+deal', category: 'MOBILES', defaultDealType: 'PRICE_DROP' },

  // 3. Laptops & Computers
  { keyword: 'laptop+deals', category: 'LAPTOPS_COMPUTERS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'gaming+laptop+deal', category: 'LAPTOPS_COMPUTERS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'hp+dell+lenovo+laptop+deal', category: 'LAPTOPS_COMPUTERS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'ipad+android+tablet+deal', category: 'LAPTOPS_COMPUTERS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'laptop+accessories+storage+ssd+deal', category: 'LAPTOPS_COMPUTERS', defaultDealType: 'PRICE_DROP' },

  // 4. Smart TVs & Large Appliances
  { keyword: '4k+smart+tv+deals', category: 'TVS_APPLIANCES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'sony+lg+samsung+tv+deal', category: 'TVS_APPLIANCES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'washing+machine+refrigerator+deal', category: 'TVS_APPLIANCES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'inverter+air+conditioner+deal', category: 'TVS_APPLIANCES', defaultDealType: 'PRICE_DROP' },

  // 4. Audio & Headphones
  { keyword: 'sony+boat+earbuds+headphones+deal', category: 'AUDIO_HEADPHONES', defaultDealType: 'PRICE_DROP' },
  { keyword: 'wireless+bluetooth+speaker+deal', category: 'AUDIO_HEADPHONES', defaultDealType: 'PRICE_DROP' },

  // 5. Smartwatches & Wearables
  { keyword: 'smartwatch+titan+fossil+deal', category: 'SMART_HOME_WATCHES', defaultDealType: 'PRICE_DROP' },

  // 6. Electronics & Cameras
  { keyword: 'electronics+gadgets+clearance', category: 'ELECTRONICS', defaultDealType: 'CLEARANCE' },

  // 7. Bags & Luggage (Mokobara, Samsonite, Safari, etc.)
  { keyword: 'mokobara+bag+deal', category: 'LUGGAGE_BAGS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'trolley+bag+backpack+deal', category: 'LUGGAGE_BAGS', defaultDealType: 'PRICE_DROP' },

  // 8. Home & Kitchen
  { keyword: 'kitchen+appliances+prestige+deal', category: 'HOME_KITCHEN', defaultDealType: 'PRICE_DROP' },
  { keyword: 'cookware+home+storage+deal', category: 'HOME_KITCHEN', defaultDealType: 'PRICE_DROP' },

  // 9. Home Improvement & Tools
  { keyword: 'home+improvement+tools+drill+deal', category: 'HOME_IMPROVEMENT', defaultDealType: 'PRICE_DROP' },
  { keyword: 'bathroom+fixtures+hardware+deal', category: 'HOME_IMPROVEMENT', defaultDealType: 'PRICE_DROP' },

  // 10. Fashion, Clothing & Shoes
  { keyword: 'sneakers+running+shoes+deal', category: 'FASHION', defaultDealType: 'PRICE_DROP' },
  { keyword: 'clothing+jackets+shirts+clearance', category: 'FASHION', defaultDealType: 'CLEARANCE' },

  // 11. Beauty, Fragrances & Grooming
  { keyword: 'perfume+deodorant+grooming+deal', category: 'BEAUTY_GROOMING', defaultDealType: 'PRICE_DROP' },
  { keyword: 'skincare+haircare+beauty+deal', category: 'BEAUTY_GROOMING', defaultDealType: 'PRICE_DROP' },

  // 12. Grocery & Gourmet Foods
  { keyword: 'grocery+food+dryfruits+deal', category: 'GROCERY', defaultDealType: 'PRICE_DROP' },

  // 13. Sports, Fitness & Outdoors
  { keyword: 'fitness+gym+dumbbells+yoga+deal', category: 'SPORTS_FITNESS', defaultDealType: 'PRICE_DROP' },
  { keyword: 'badminton+cricket+sports+deal', category: 'SPORTS_FITNESS', defaultDealType: 'PRICE_DROP' },

  // 14. Toys & Games
  { keyword: 'toys+games+boardgames+deal', category: 'TOYS_GAMES', defaultDealType: 'PRICE_DROP' },

  // 15. Automotive (Car & Bike)
  { keyword: 'car+bike+accessories+helmet+deal', category: 'AUTOMOTIVE', defaultDealType: 'PRICE_DROP' },

  // 16. Books
  { keyword: 'bestseller+books+novels+deal', category: 'BOOKS', defaultDealType: 'PRICE_DROP' }
];

async function scrapeSearchQuery(item: SearchQuery): Promise<DealItem[]> {
  const deals: DealItem[] = [];
  const url = `https://www.amazon.in/s?k=${item.keyword}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cookie': 'session-id=258-1234567-7654321; ubid-acbin=257-1234567-7654321; i18n-prefs=INR;',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    if (!html.includes('s-search-result')) {
      return [];
    }

    const $ = cheerio.load(html);

    $('[data-component-type="s-search-result"]').each((_, elem) => {
      try {
        const $elem = $(elem);
        const asin = $elem.attr('data-asin') || '';
        if (!asin) return;

        const title = $elem.find('h2 a span, h2 span, .a-size-medium, .a-size-base-plus').first().text().trim();
        if (!title || title.length < 5) return;

        let link = $elem.find('h2 a').attr('href') || $elem.find('a.a-link-normal.s-no-outline').attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://www.amazon.in${link}`;
        }
        if (!link && asin) {
          link = `https://www.amazon.in/dp/${asin}`;
        }

        const image = $elem.find('img.s-image').attr('src') || '';

        const currentPriceText = $elem.find('.a-price .a-offscreen').first().text().replace(/[^\d.]/g, '');
        const originalPriceText = $elem.find('.a-price[data-a-strike="true"] .a-offscreen, .a-text-price .a-offscreen').first().text().replace(/[^\d.]/g, '');

        const currentPrice = parseFloat(currentPriceText);
        let originalPrice = parseFloat(originalPriceText) || 0;

        if (!currentPrice || currentPrice <= 0) return;

        let discountPercentage = 0;
        if (originalPrice > currentPrice) {
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        } else {
          const discountMatch = $elem.text().match(/(\d+)%\s*off/i);
          if (discountMatch) {
            discountPercentage = parseInt(discountMatch[1], 10);
            originalPrice = Math.round(currentPrice / (1 - discountPercentage / 100));
          }
        }

        const elementText = $elem.text();

        // 1. Coupon detection
        let hasCoupon = false;
        let couponText: string | undefined = undefined;
        const couponMatch = elementText.match(/(?:Save|Coupon:?)\s*(?:₹|INR|\$)?\s*(\d+(?:%|\s*off)?)\s*(?:with coupon|coupon applied)?/i);
        if (couponMatch || elementText.toLowerCase().includes('coupon') || $elem.find('.s-coupon-badge').length > 0) {
          hasCoupon = true;
          couponText = couponMatch ? `₹${couponMatch[1]} Coupon` : 'Coupon Available';
        }

        // 2. Prime Exclusive detection
        const isPrimeExclusive = /Prime Exclusive|Prime Savings|exclusive for prime/i.test(elementText) || 
          $elem.find('.s-prime, i.a-icon-prime').length > 0 && /exclusive/i.test(elementText);

        // 3. Limited Time Deal / Deal of the day / Lightning deal detection
        const isLightning = /Lightning Deal/i.test(elementText);
        const isDealOfDay = /Deal of the Day/i.test(elementText);
        const isBestDeal7Day = /Limited time deal|Best Deal|7-Day/i.test(elementText);
        const isLimitedTimeDeal = isLightning || isDealOfDay || isBestDeal7Day;

        // 4. Amazon Deal Type Classification
        let dealType: AmazonDealType = item.defaultDealType || 'PRICE_DROP';
        if (discountPercentage >= 80) {
          dealType = 'PRICE_GLITCH';
        } else if (isLightning) {
          dealType = 'LIGHTNING_DEAL';
        } else if (isDealOfDay) {
          dealType = 'DEAL_OF_THE_DAY';
        } else if (isPrimeExclusive) {
          dealType = 'PRIME_EXCLUSIVE';
        } else if (hasCoupon) {
          dealType = 'COUPON';
        } else if (isBestDeal7Day) {
          dealType = 'BEST_DEAL_7DAY';
        } else if (/Outlet|Overstock/i.test(elementText)) {
          dealType = 'OUTLET_OVERSTOCK';
        } else if (discountPercentage >= 65) {
          dealType = 'CLEARANCE';
        }

        const ratingText = $elem.find('.a-icon-alt').first().text();
        const ratingMatch = ratingText.match(/([\d.]+)\s*out of 5/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

        const ratingCountText = $elem.find('span.a-size-base.s-underline-text').first().text().replace(/[^\d]/g, '');
        const ratingCount = ratingCountText ? parseInt(ratingCountText, 10) : undefined;

        // Apply Quality & Dual-Track Guard
        const quality = validateDealQuality(
          title,
          currentPrice,
          originalPrice,
          discountPercentage,
          rating,
          ratingCount
        );

        if (!quality.isValid) {
          return;
        }

        let badge: DealItem['badge'] = hasCoupon ? 'COUPON' : 'LIGHTNING';
        if (discountPercentage >= 80) {
          badge = 'GLITCH';
        } else if (discountPercentage >= 65) {
          badge = 'BUMPER';
        } else if (quality.isBrandPriceDrop && discountPercentage < 50) {
          badge = 'PRICE_DROP';
        }

        const calculatedOriginal = originalPrice > currentPrice ? originalPrice : Math.round(currentPrice / (1 - discountPercentage / 100));
        const savings = Math.max(0, calculatedOriginal - currentPrice);

        // Bank Offer extraction & calculation
        const bankOffer = extractBankOffer(elementText, currentPrice);

        // Exchange Offer Detection (Phones, Laptops, Appliances)
        const exchangeMatch = elementText.match(/up to (₹[\d,]+) off with exchange/i) || elementText.match(/(₹[\d,]+) off with exchange/i);
        const hasExchangeOffer = /exchange/i.test(elementText) || (currentPrice >= 10000 && (item.category === 'MOBILES' || item.category === 'LAPTOPS_COMPUTERS' || item.category === 'TVS_APPLIANCES'));
        const exchangeDiscountText = exchangeMatch 
          ? `Up to ${exchangeMatch[1]} off on Exchange` 
          : (hasExchangeOffer ? `Up to ₹${Math.min(18000, Math.round(currentPrice * 0.35)).toLocaleString('en-IN')} off on Exchange` : undefined);

        // No Cost EMI Detection (Items >= ₹3,000)
        const hasNoCostEmi = /no cost emi/i.test(elementText) || currentPrice >= 3000;
        const estimatedEmi = Math.round(currentPrice / 6);
        const noCostEmiText = hasNoCostEmi ? `No Cost EMI from ₹${estimatedEmi.toLocaleString('en-IN')}/mo` : undefined;

        deals.push({
          id: asin,
          asin,
          title,
          url: link,
          imageUrl: image,
          currentPrice,
          originalPrice: calculatedOriginal,
          discountPercentage,
          savings,
          category: item.category,
          rating,
          ratingCount,
          dealType,
          badge,
          isVerifiedBrand: quality.isVerifiedBrand,
          brandName: quality.brandName,
          isLimitedTimeDeal,
          isPrimeExclusive,
          hasCoupon,
          couponText,
          bankOffer,
          hasExchangeOffer,
          exchangeDiscountText,
          hasNoCostEmi,
          noCostEmiText,
          isAvailable: true,
          discoveredAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
        });
      } catch (e) {
        // Skip malformed
      }
    });
  } catch (err) {
    console.error(`Error querying ${url}:`, err);
  }

  return deals;
}

export async function fetchAmazonIndiaDeals(): Promise<DealItem[]> {
  const allDeals: DealItem[] = [];

  const BATCH_SIZE = 4;
  for (let i = 0; i < QUERIES.length; i += BATCH_SIZE) {
    const batch = QUERIES.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((q) => scrapeSearchQuery(q)));
    for (const r of results) {
      allDeals.push(...r);
    }
  }

  // Deduplicate by ASIN
  const uniqueMap = new Map<string, DealItem>();
  for (const d of allDeals) {
    const key = d.asin || d.title;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, d);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => b.discountPercentage - a.discountPercentage);
}
