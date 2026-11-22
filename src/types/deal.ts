export interface PricePoint {
  timestamp: string;
  price: number;
}

export type AmazonDealType = 
  | 'LIGHTNING_DEAL'      // Short flash sale (4-8 hours) with timer/claimed bar
  | 'DEAL_OF_THE_DAY'     // 24-hour flagship daily deals
  | 'BEST_DEAL_7DAY'      // 7-day featured promo deals
  | 'PRICE_GLITCH'        // Unusually massive drop (80%+ off)
  | 'PRICE_DROP'          // Direct cash drop on verified/premium brands
  | 'COUPON'              // Checkbox coupons (₹ or % off)
  | 'PRIME_EXCLUSIVE'     // Special pricing for Prime members
  | 'OUTLET_OVERSTOCK'    // Amazon Outlet overstock markdowns
  | 'CLEARANCE';          // Permanent liquidation / end-of-season clearance

export interface BankOfferInfo {
  hasBankOffer: boolean;
  bankName?: string;
  offerText: string;
  instantDiscountAmount: number;
  effectivePriceWithBank: number;
}

export interface DealItem {
  id: string;
  asin?: string;
  title: string;
  url: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  savings: number;
  category: CategoryId;
  rating?: number;
  ratingCount?: number;
  dealType: AmazonDealType;
  badge?: 'GLITCH' | 'BUMPER' | 'LIGHTNING' | 'COUPON' | 'CLEARANCE' | 'PRICE_DROP';
  isVerifiedBrand?: boolean;
  brandName?: string;
  isLimitedTimeDeal?: boolean;
  isPrimeExclusive?: boolean;
  hasCoupon?: boolean;
  couponText?: string;
  bankOffer?: BankOfferInfo;
  hasExchangeOffer?: boolean;
  exchangeDiscountText?: string;
  hasNoCostEmi?: boolean;
  noCostEmiText?: string;
  isAvailable: boolean;
  discoveredAt: string;
  lastCheckedAt: string;
  priceHistory?: PricePoint[];
}

export interface WishlistItem {
  id: string;
  asin: string;
  title: string;
  targetPrice: number;
  currentPrice: number;
  originalPrice: number;
  imageUrl: string;
  url: string;
  isTargetMet: boolean;
  addedAt: string;
  lastCheckedAt: string;
}

export type CategoryId = 
  | 'ALL'
  | 'MOBILES'
  | 'LAPTOPS_COMPUTERS'
  | 'TVS_APPLIANCES'
  | 'AUDIO_HEADPHONES'
  | 'SMART_HOME_WATCHES'
  | 'ELECTRONICS'
  | 'LUGGAGE_BAGS'
  | 'HOME_KITCHEN'
  | 'HOME_IMPROVEMENT'
  | 'FASHION'
  | 'BEAUTY_GROOMING'
  | 'GROCERY'
  | 'SPORTS_FITNESS'
  | 'TOYS_GAMES'
  | 'AUTOMOTIVE'
  | 'BOOKS';

export type BudgetFilter = 'ALL' | 'UNDER_199' | 'UNDER_499' | 'UNDER_999' | 'UNDER_1999' | 'SAVINGS_2000';
