// Expanded list of reputable & premium brands in India
export const KNOWN_BRANDS = [
  // Laptops & Computers
  'macbook', 'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'samsung', 
  'ideapad', 'thinkpad', 'inspiron', 'pavilion', 'vivobook', 'zenbook', 'predator',
  'logitech', 'sandisk', 'kingston', 'crucial',

  // Mobile Phones & Tablets
  'iphone', 'galaxy', 'oneplus', 'redmi', 'xiaomi', 'realme', 'iqoo', 'poco', 
  'motorola', 'moto', 'vivo', 'oppo', 'pixel', 'nothing', 'lava',

  // Premium Travel & Luggage
  'mokobara', 'samsonite', 'american tourister', 'safari', 'skybags', 
  'aristocrat', 'wildcraft', 'delsey', 'tumi', 'tommy hilfiger',
  
  // Premium Audio & Electronics
  'sony', 'boat', 'noise', 'fire-boltt', 'zebronics', 
  'boult', 'jbl', 'sennheiser', 'marshall', 'bose', 'anker', 'portronics', 'ambrane', 'ptron',

  // Smart TVs & Large Appliances
  'lg', 'sony', 'samsung', 'tcl', 'vu', 'hisense', 'toshiba', 'panasonic',
  'whirlpool', 'godrej', 'haier', 'voltas', 'daikin', 'carrier', 'hitachi', 'bosch', 'ifb',

  // Tablets & E-Readers
  'ipad', 'kindle', 'tab', 'lenovo tab', 'xiaomi pad',
  'titan', 'fossil', 'casio', 'fastrack', 'timex', 'amazfit',

  // Home & Kitchen Appliances
  'pigeon', 'prestige', 'philips', 'havells', 'bajaj', 'butterfly', 
  'milton', 'cello', 'wonderchef', 'orient', 'crompton', 'solimo', 'amazon basics', 'dyson',

  // Fashion & Footwear
  'crocs', 'puma', 'adidas', 'nike', 'sparx', 'bata', 'campus', 'asian', 'woodland', 'skechers'
];

/**
 * Validates whether an item qualifies as a deal:
 * - Either a deep discount (>= 45%)
 * - OR a real cash drop / price drop on a premium/verified brand (like Laptops, Smartphones, Mokobara)
 */
export function validateDealQuality(
  title: string,
  currentPrice: number,
  originalPrice: number,
  discountPercentage: number,
  rating?: number,
  ratingCount?: number
): { isValid: boolean; isVerifiedBrand: boolean; brandName?: string; isBrandPriceDrop: boolean } {
  const lowerTitle = title.toLowerCase();

  // 1. Identify known/premium brands
  let matchedBrand: string | undefined = undefined;
  for (const b of KNOWN_BRANDS) {
    if (lowerTitle.includes(b)) {
      matchedBrand = b.toUpperCase();
      break;
    }
  }

  const savings = Math.max(0, originalPrice - currentPrice);

  // 2. Reject obvious scam/inflated fake MRPs or seller typo glitches (e.g. 99% off laptop/appliances)
  if (originalPrice > 100000 && discountPercentage >= 95) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }
  if (currentPrice > 1000 && discountPercentage >= 96) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }
  if (originalPrice > currentPrice * 15 && currentPrice > 500) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }
  if (currentPrice < 500 && originalPrice > 5000) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }
  if (currentPrice < 1000 && originalPrice > 15000) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }
  if (currentPrice < 2500 && originalPrice > 35000 && !matchedBrand) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }

  // 3. Mathematical impossibility checks
  if (discountPercentage >= 95 && !matchedBrand) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }

  // 4. Low-quality unbranded filter
  if (!matchedBrand && (!rating || rating < 3.2) && discountPercentage > 80 && currentPrice < 400) {
    return { isValid: false, isVerifiedBrand: false, isBrandPriceDrop: false };
  }

  // 5. High-Value Tech (Laptops & Mobiles) Criteria:
  // If price >= ₹8,000 and savings >= ₹1,500 (or >= 10% drop), it is a major real-world deal!
  const isHighValueTech = currentPrice >= 8000 && (savings >= 1500 || discountPercentage >= 10);

  // 6. General Brand Price Drop (e.g. Mokobara, shoes, audio dropping by ₹500+ or 20%+)
  const isBrandPriceDrop = !!matchedBrand && (savings >= 500 || discountPercentage >= 20 || isHighValueTech);

  // 7. General Deep Discount (>= 45%)
  const isDeepDiscount = discountPercentage >= 45;

  if (!isBrandPriceDrop && !isDeepDiscount && !isHighValueTech) {
    return { isValid: false, isVerifiedBrand: !!matchedBrand, isBrandPriceDrop: false };
  }

  return {
    isValid: true,
    isVerifiedBrand: !!matchedBrand || isHighValueTech,
    brandName: matchedBrand || 'TECH',
    isBrandPriceDrop: isBrandPriceDrop || isHighValueTech,
  };
}
