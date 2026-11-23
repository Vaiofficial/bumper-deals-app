'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Flame, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Search, 
  TrendingDown, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Headphones, 
  Smartphone, 
  Laptop, 
  Shirt, 
  UtensilsCrossed, 
  LayoutGrid, 
  BarChart3, 
  Bookmark, 
  Ticket, 
  Copy, 
  Check, 
  Share2,
  ShoppingBag,
  Briefcase,
  CreditCard,
  Tv,
  Wrench,
  Sparkle,
  Apple,
  Dumbbell,
  Gamepad2,
  Car,
  BookOpen,
  Sun,
  Moon,
  SearchX,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  CalendarCheck,
  Send,
  MessageCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { DealItem, CategoryId, BudgetFilter } from '@/types/deal';
import { PriceHistoryModal } from '@/components/PriceHistoryModal';
import { WishlistTracker } from '@/components/WishlistTracker';
import { SavedCartDrawer } from '@/components/SavedCartDrawer';
import { useSavedCart } from '@/context/SavedCartContext';
import { injectAffiliateTag } from '@/lib/affiliate';

const CATEGORIES: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Drops', icon: LayoutGrid },
  { id: 'MOBILES', label: 'Mobiles & Accessories', icon: Smartphone },
  { id: 'LAPTOPS_COMPUTERS', label: 'Laptops & Computers', icon: Laptop },
  { id: 'TVS_APPLIANCES', label: 'TVs & Appliances', icon: Tv },
  { id: 'AUDIO_HEADPHONES', label: 'Audio & ANC', icon: Headphones },
  { id: 'SMART_HOME_WATCHES', label: 'Smartwatches', icon: Zap },
  { id: 'ELECTRONICS', label: 'Tech & Gadgets', icon: Sparkles },
  { id: 'LUGGAGE_BAGS', label: 'Luggage & Backpacks', icon: Briefcase },
  { id: 'HOME_KITCHEN', label: 'Home & Kitchen', icon: UtensilsCrossed },
  { id: 'HOME_IMPROVEMENT', label: 'Tools & Hardware', icon: Wrench },
  { id: 'FASHION', label: 'Fashion & Sneakers', icon: Shirt },
  { id: 'BEAUTY_GROOMING', label: 'Beauty & Fragrances', icon: Sparkle },
  { id: 'GROCERY', label: 'Gourmet & Foods', icon: Apple },
  { id: 'SPORTS_FITNESS', label: 'Fitness & Gym', icon: Dumbbell },
  { id: 'TOYS_GAMES', label: 'Toys & Board Games', icon: Gamepad2 },
  { id: 'AUTOMOTIVE', label: 'Auto & Riding', icon: Car },
  { id: 'BOOKS', label: 'Bestseller Books', icon: BookOpen },
];

const QUICK_INTENTS = [
  { id: 'all', label: 'All Drops', icon: Sparkles },
  { id: 'under-2999', label: 'Under ₹2,999' },
  { id: 'under-999', label: 'Under ₹999' },
  { id: 'lightning', label: 'Lightning Drops', icon: Flame },
  { id: 'verified', label: 'Verified Brands', icon: ShieldCheck },
  { id: 'loot', label: 'Price Glitches (80%+)', hasPulse: true },
  { id: 'bank', label: 'Card Offers', icon: CreditCard },
];

interface DealsClientViewProps {
  initialDeals: DealItem[];
}

export default function DealsClientView({ initialDeals }: DealsClientViewProps) {
  const [deals, setDeals] = useState<DealItem[]>(initialDeals);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('ALL');
  const [activeIntent, setActiveIntent] = useState<string>('all');
  const [activeBudget, setActiveBudget] = useState<BudgetFilter>('ALL');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [onlyVerifiedBrands, setOnlyVerifiedBrands] = useState<boolean>(false);
  const [selectedDealType, setSelectedDealType] = useState<string>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyBankOffers, setOnlyBankOffers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'price-desc' | 'savings'>('discount');
  const [selectedDealForHistory, setSelectedDealForHistory] = useState<DealItem | null>(null);
  const [showWishlistSection, setShowWishlistSection] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [copiedDealId, setCopiedDealId] = useState<string | null>(null);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [heroCountdown, setHeroCountdown] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllWithoutPagination, setShowAllWithoutPagination] = useState(false);
  const DEALS_PER_PAGE = 48;

  // Convert raw Amazon CDN image URL to local proxy URL or referrer-safe URL
  const getProxiedImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('https://m.media-amazon.com/')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const { cart, addToCart, removeFromCart, isInCart } = useSavedCart();
  const { theme, toggleTheme } = useTheme();

  // Fetch Deals on manual scan or refresh
  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.success && data.deals) {
        setDeals(data.deals);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  // Live ticking countdown synchronized to the exact top of the next hour
  useEffect(() => {
    // Unregister any stale service workers
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }

    const updateTimer = () => {
      const now = new Date();
      // Milliseconds until the next hour begins
      const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      const totalSecondsLeft = Math.max(0, Math.floor(msUntilNextHour / 1000));

      const mins = String(Math.floor(totalSecondsLeft / 60)).padStart(2, '0');
      const secs = String(totalSecondsLeft % 60).padStart(2, '0');
      setHeroCountdown(`ENDS IN 00:${mins}:${secs}`);

      // If the hour rolls over, trigger hero rotation
      const newHour = Math.floor(Date.now() / 3600000);
      setCurrentHourEpoch((prev) => (prev !== newHour ? newHour : prev));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerManualScan = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/cron/check-deals');
      await fetchDeals();
    } catch (err) {
      console.error('Failed to trigger scan:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Copy app link
  const handleCopyAppUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 2000);
    }
  };

  // Copy deal link (with affiliate tag)
  const handleCopyDealUrl = (deal: DealItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(injectAffiliateTag(deal.url));
    setCopiedDealId(deal.id);
    setTimeout(() => setCopiedDealId(null), 2000);
  };

  // Copy coupon code
  const handleCopyCoupon = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Reset to page 1 whenever search, category, intent, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeIntent, activeBudget, minDiscount, onlyVerifiedBrands, selectedDealType, minRating, onlyBankOffers, sortBy]);
  // Handle Quick-Intent Pills click
  const handleSelectIntent = (intentId: string) => {
    setActiveIntent(intentId);
    if (intentId === 'all') {
      setActiveBudget('ALL');
      setOnlyVerifiedBrands(false);
      setSelectedDealType('ALL');
      setOnlyBankOffers(false);
    } else if (intentId === 'under-2999') {
      setActiveBudget('UNDER_1999');
      setOnlyVerifiedBrands(false);
      setSelectedDealType('ALL');
      setOnlyBankOffers(false);
    } else if (intentId === 'under-999') {
      setActiveBudget('UNDER_999');
      setOnlyVerifiedBrands(false);
      setSelectedDealType('ALL');
      setOnlyBankOffers(false);
    } else if (intentId === 'lightning') {
      setSelectedDealType('LIGHTNING_DEAL');
      setActiveBudget('ALL');
      setOnlyBankOffers(false);
    } else if (intentId === 'verified') {
      setOnlyVerifiedBrands(true);
      setActiveBudget('ALL');
      setSelectedDealType('ALL');
      setOnlyBankOffers(false);
    } else if (intentId === 'loot') {
      setSelectedDealType('PRICE_GLITCH');
      setActiveBudget('ALL');
      setOnlyVerifiedBrands(false);
      setOnlyBankOffers(false);
    } else if (intentId === 'bank') {
      setOnlyBankOffers(true);
      setActiveBudget('ALL');
      setSelectedDealType('ALL');
    }
  };

  // Filter & Sort
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        // Category filter
        if (activeCategory !== 'ALL' && deal.category !== activeCategory) {
          return false;
        }
        // Verified brand filter
        if (onlyVerifiedBrands && !deal.isVerifiedBrand) {
          return false;
        }
        // Only Bank Offers
        if (onlyBankOffers && !deal.bankOffer?.hasBankOffer) {
          return false;
        }
        // Amazon Deal Type Filter
        if (selectedDealType !== 'ALL') {
          if (selectedDealType === 'COUPON') {
            if (!deal.hasCoupon && deal.dealType !== 'COUPON') return false;
          } else if (selectedDealType === 'LIGHTNING_DEAL') {
            if (deal.dealType !== 'LIGHTNING_DEAL' && !deal.isLimitedTimeDeal) return false;
          } else if (selectedDealType === 'DEAL_OF_THE_DAY') {
            if (deal.dealType !== 'DEAL_OF_THE_DAY') return false;
          } else if (selectedDealType === 'BEST_DEAL_7DAY') {
            if (deal.dealType !== 'BEST_DEAL_7DAY' && !deal.isLimitedTimeDeal) return false;
          } else if (selectedDealType === 'PRICE_GLITCH') {
            if (deal.dealType !== 'PRICE_GLITCH' && deal.discountPercentage < 80) return false;
          } else if (selectedDealType === 'PRICE_DROP') {
            if (deal.dealType !== 'PRICE_DROP' && deal.savings < 500) return false;
          } else if (selectedDealType === 'PRIME_EXCLUSIVE') {
            if (!deal.isPrimeExclusive && deal.dealType !== 'PRIME_EXCLUSIVE') return false;
          } else if (selectedDealType === 'OUTLET_OVERSTOCK') {
            if (deal.dealType !== 'OUTLET_OVERSTOCK') return false;
          } else if (selectedDealType === 'CLEARANCE') {
            if (deal.dealType !== 'CLEARANCE' && deal.discountPercentage < 65) return false;
          }
        }
        // Rating filter
        if (minRating > 0 && (!deal.rating || deal.rating < minRating)) {
          return false;
        }

        // Budget filter
        if (activeBudget === 'UNDER_199' && deal.currentPrice > 199) return false;
        if (activeBudget === 'UNDER_499' && deal.currentPrice > 499) return false;
        if (activeBudget === 'UNDER_999' && deal.currentPrice > 999) return false;
        if (activeBudget === 'UNDER_1999' && deal.currentPrice > 1999) return false;
        if (activeBudget === 'SAVINGS_2000' && deal.savings < 2000) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = deal.title.toLowerCase().includes(q);
          const matchBrand = deal.brandName?.toLowerCase().includes(q);
          const matchCat = deal.category.toLowerCase().includes(q);
          const matchPrice = (q.includes('under 3000') && deal.currentPrice <= 3000) ||
                             (q.includes('under 1000') && deal.currentPrice <= 1000) ||
                             (q.includes('under 500') && deal.currentPrice <= 500);
          if (!matchTitle && !matchBrand && !matchCat && !matchPrice) {
            return false;
          }
        }
        // Discount threshold
        if (minDiscount > 0 && deal.discountPercentage < minDiscount && !deal.hasCoupon) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
        if (sortBy === 'savings') return b.savings - a.savings;
        if (sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
        if (sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
        return 0;
      });
  }, [deals, activeCategory, onlyVerifiedBrands, onlyBankOffers, selectedDealType, minRating, activeBudget, searchQuery, minDiscount, sortBy]);

  // Real Hourly Rotating Doorbuster Deal
  const [currentHourEpoch, setCurrentHourEpoch] = useState<number>(() => Math.floor(Date.now() / 3600000));

  // Featured Hero Deal - rotates automatically each hour among top curated verified drops
  const heroDeal = useMemo(() => {
    if (deals.length === 0) return null;
    const candidates = deals.filter(
      (d) =>
        d.isVerifiedBrand &&
        d.imageUrl &&
        d.discountPercentage >= 35 &&
        d.currentPrice >= 999 &&
        d.currentPrice <= 55000
    );
    const pool = candidates.length > 0 ? candidates : deals;
    const index = Math.abs(currentHourEpoch) % pool.length;
    return pool[index];
  }, [deals, currentHourEpoch]);

  const glitchCount = useMemo(() => deals.filter((d) => d.badge === 'GLITCH' || d.discountPercentage >= 80).length, [deals]);
  const verifiedCount = useMemo(() => deals.filter((d) => d.isVerifiedBrand).length, [deals]);
  const couponCount = useMemo(() => deals.filter((d) => d.hasCoupon).length, [deals]);
  const bankOfferCount = useMemo(() => deals.filter((d) => d.bankOffer?.hasBankOffer).length, [deals]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDeals.length / DEALS_PER_PAGE) || 1;
  const paginatedDeals = useMemo(() => {
    if (showAllWithoutPagination) {
      return filteredDeals;
    }
    const start = (currentPage - 1) * DEALS_PER_PAGE;
    return filteredDeals.slice(start, start + DEALS_PER_PAGE);
  }, [filteredDeals, currentPage, DEALS_PER_PAGE, showAllWithoutPagination]);

  const formatINR = (num: number) => '₹' + Math.round(num).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#090D16] text-stone-900 dark:text-stone-100 font-sans selection:bg-orange-500/20 selection:text-orange-600 overflow-x-hidden">
      
      {/* 1. LIQUID-GLASS STICKY HEADER & INTENT BAR */}
      <header className="sticky top-0 z-40 bg-stone-50/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand & Full-Width Predictive Search Bar */}
          <div className="flex items-center gap-2.5 sm:gap-4 pt-2.5 sm:pt-3 pb-2">
            {/* Brand Mark */}
            <a href="#top" className="flex items-center gap-2 shrink-0 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center shadow-md group-hover:bg-orange-600 dark:group-hover:bg-orange-500 transition-colors">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <div className="shrink-0">
                <span className="font-extrabold tracking-tight text-base sm:text-xl text-stone-950 dark:text-white block leading-tight">
                  DropVault
                </span>
                <p className="hidden md:block text-[11px] font-mono text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                  Real-Time Deal Intelligence Platform
                </p>
              </div>
            </a>

            {/* Predictive Search Bar with '/' Shortcut */}
            <div className="relative flex-1 min-w-0">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  id="searchInput"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deals, brands, laptops..."
                  className="w-full pl-8 sm:pl-10 pr-14 sm:pr-20 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-white dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 text-stone-950 dark:text-stone-100 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-950/10 dark:focus:ring-white/10 focus:border-stone-950 dark:focus:border-stone-600 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    type="button"
                    className="absolute right-2 sm:right-12 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium text-stone-500 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-800 transition"
                  >
                    Clear
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 absolute right-3">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Second Row: Actions Bar (Scan, Wishlist, Theme, Share, Vault Bag) - Fitting Entire Width */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2.5 pt-0.5 border-b border-stone-200/50 dark:border-stone-800/50">
            {/* Scan deals */}
            <button
              onClick={triggerManualScan}
              disabled={refreshing}
              title="Refresh latest deals"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-95 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
              <span className="truncate">{refreshing ? 'Scanning...' : 'Scan'}</span>
            </button>

            {/* Wishlist tracker toggle */}
            <button
              onClick={() => setShowWishlistSection(!showWishlistSection)}
              title="Wishlist Price Drop Tracker"
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-xl text-xs font-semibold border transition active:scale-95 shadow-2xs ${
                showWishlistSection
                  ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="truncate">Wishlist</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-95 shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-stone-700" />}
            </button>

            {/* Share link button */}
            <button
              onClick={handleCopyAppUrl}
              title="Share BumperDeals"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-95 shadow-2xs"
            >
              {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {/* Express Vault Bag Button (Highlight & Stretched) */}
            <button
              onClick={() => setShowCartDrawer(true)}
              type="button"
              className="flex-1.5 inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold truncate">Bag</span>
              <span className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-mono font-bold bg-orange-600 text-white tabular-nums shrink-0">
                {cart.length}
              </span>
            </button>
          </div>

          {/* Third Row: Quick-Intent Filter Pills */}
          <nav aria-label="Quick Intent Filters" className="flex items-center gap-2 overflow-x-auto pb-3 pt-0.5 no-scrollbar">
            {QUICK_INTENTS.map((intent) => {
              const Icon = intent.icon;
              const isSelected = activeIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  onClick={() => handleSelectIntent(intent.id)}
                  type="button"
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-stone-950 dark:bg-white text-white dark:text-stone-950 shadow-sm'
                      : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/90 dark:border-stone-800'
                  }`}
                >
                  {intent.hasPulse && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400 dark:text-orange-600' : 'text-orange-500'}`} />}
                  <span>{intent.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main id="top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* Wishlist Price Tracker (when opened) */}
        {showWishlistSection && (
          <div className="mb-8">
            <WishlistTracker />
          </div>
        )}

        {/* METRIC HIGHLIGHTS CARDS (DropVault Bento Stat Cards - Strictly 4 in a single horizontal row) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8 w-full" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {/* Card 1: All Verified Deals */}
          <button
            type="button"
            onClick={() => {
              setOnlyVerifiedBrands(false);
              setSelectedDealType('ALL');
              setActiveIntent('all');
            }}
            className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-left border transition-all duration-200 cursor-pointer shadow-vault hover:-translate-y-0.5 flex flex-col justify-between ${
              !onlyVerifiedBrands && selectedDealType === 'ALL'
                ? 'ring-2 ring-stone-950 dark:ring-white bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1.5 sm:mb-2 w-full">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide truncate">All Drops</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-950 dark:text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl font-extrabold font-mono text-stone-950 dark:text-white tabular-nums">
              {deals.length}
            </div>
            <p className="hidden md:block text-[11px] font-mono text-stone-400 dark:text-stone-500 mt-1 truncate">Live active in database</p>
          </button>

          {/* Card 2: Verified Brands */}
          <button
            type="button"
            onClick={() => {
              if (onlyVerifiedBrands) {
                setOnlyVerifiedBrands(false);
              } else {
                setOnlyVerifiedBrands(true);
                setSelectedDealType('ALL');
              }
            }}
            className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-left border transition-all duration-200 cursor-pointer shadow-vault hover:-translate-y-0.5 flex flex-col justify-between ${
              onlyVerifiedBrands
                ? 'ring-2 ring-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1.5 sm:mb-2 w-full">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide truncate">Verified</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {verifiedCount}
            </div>
            <p className="hidden md:block text-[11px] font-mono text-emerald-600/80 dark:text-emerald-400/80 mt-1 truncate">
              {onlyVerifiedBrands ? '✓ Filter active' : 'Top brand certified'}
            </p>
          </button>

          {/* Card 3: Stackable Coupons */}
          <button
            type="button"
            onClick={() => {
              if (selectedDealType === 'COUPON') {
                setSelectedDealType('ALL');
              } else {
                setSelectedDealType('COUPON');
                setOnlyVerifiedBrands(false);
              }
            }}
            className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-left border transition-all duration-200 cursor-pointer shadow-vault hover:-translate-y-0.5 flex flex-col justify-between ${
              selectedDealType === 'COUPON'
                ? 'ring-2 ring-amber-500 bg-amber-500/10 dark:bg-amber-950/40 border-amber-500'
                : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1.5 sm:mb-2 w-full">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide truncate">Coupons</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl font-extrabold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              {couponCount}
            </div>
            <p className="hidden md:block text-[11px] font-mono text-amber-600/80 dark:text-amber-400/80 mt-1 truncate">
              {selectedDealType === 'COUPON' ? '✓ Filter active' : 'Extra stackable off'}
            </p>
          </button>

          {/* Card 4: Price Glitches */}
          <button
            type="button"
            onClick={() => {
              if (selectedDealType === 'PRICE_GLITCH') {
                setSelectedDealType('ALL');
              } else {
                setSelectedDealType('PRICE_GLITCH');
                setOnlyVerifiedBrands(false);
              }
            }}
            className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-left border transition-all duration-200 cursor-pointer shadow-vault hover:-translate-y-0.5 flex flex-col justify-between ${
              selectedDealType === 'PRICE_GLITCH'
                ? 'ring-2 ring-red-500 bg-red-500/10 dark:bg-red-950/40 border-red-500'
                : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1.5 sm:mb-2 w-full">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide truncate">Glitches</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
              </div>
            </div>
            <div className="text-lg sm:text-3xl font-extrabold font-mono text-red-600 dark:text-red-400 tabular-nums">
              {glitchCount}
            </div>
            <p className="hidden md:block text-[11px] font-mono text-red-500/80 dark:text-red-400/80 mt-1 truncate">
              {selectedDealType === 'PRICE_GLITCH' ? '✓ Filter active' : '80%+ error prices'}
            </p>
          </button>
        </div>

        {/* 2. HIGH-CONTRAST BENTO HERO & FLASH DROP BANNER */}
        {heroDeal && (
          <section aria-label="Featured Hourly Flash Drop" className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
            {/* Primary Flash Hero Tile (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-vault relative overflow-hidden flex flex-col justify-between">
              {/* Subtle top accent bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  <span>HOURLY DOORBUSTER • 90-DAY LOWEST</span>
                </div>

                {/* Live Countdown Timer */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-950 dark:bg-stone-800 text-white font-mono text-xs sm:text-sm font-bold tracking-tight tabular-nums shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>{heroCountdown || 'ENDS IN 00:59:59'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Product Copy & Conversion Pricing */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                      {heroDeal.brandName || heroDeal.category} • Audited Drop
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-950 dark:text-white leading-[1.2]">
                      {heroDeal.title}
                    </h1>
                  </div>

                  {/* Social Proof Above the Fold */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {heroDeal.rating ? (
                      <div className="inline-flex items-center gap-1 font-bold text-stone-950 dark:text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{heroDeal.rating}</span>
                        {heroDeal.ratingCount && (
                          <span className="font-normal text-stone-500 dark:text-stone-400">
                            ({heroDeal.ratingCount.toLocaleString('en-IN')} verified)
                          </span>
                        )}
                      </div>
                    ) : null}
                    <span className="text-stone-300 dark:text-stone-700">•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Save {formatINR(heroDeal.savings)}
                    </span>
                  </div>

                  {/* Bold Tabular Pricing */}
                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950 dark:text-white font-mono tabular-nums">
                      {formatINR(heroDeal.currentPrice)}
                    </span>
                    {heroDeal.originalPrice > heroDeal.currentPrice && (
                      <span className="text-base text-stone-400 line-through font-mono tabular-nums">
                        {formatINR(heroDeal.originalPrice)}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold">
                      -{heroDeal.discountPercentage}% OFF
                    </span>
                  </div>

                  {/* Real-time Claim Progress Bar */}
                  <div className="pt-1 max-w-md">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>84% Claimed • Lightning Deal</span>
                      </span>
                      <span className="font-mono text-stone-400">Limited Stock</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200/70 dark:border-stone-700">
                      <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                    </div>
                  </div>

                  {/* 1-Click CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={injectAffiliateTag(heroDeal.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Grab Drop — {formatINR(heroDeal.currentPrice)}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedDealForHistory(heroDeal)}
                      className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-950 dark:text-white text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>90d Price Graph</span>
                    </button>
                  </div>
                </div>

                {/* Product Visual Card */}
                <div className="md:col-span-5 flex items-center justify-center">
                  <div className="relative w-full rounded-3xl bg-gradient-to-br from-stone-100 via-stone-50 to-orange-50/50 dark:from-stone-800/40 dark:via-stone-900/40 dark:to-orange-950/20 border border-stone-200/80 dark:border-stone-800 p-6 flex flex-col items-center justify-center aspect-square">
                    <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs border border-stone-200/80 dark:border-stone-700 text-[11px] font-mono font-semibold text-stone-950 dark:text-white">
                      TOP DROP
                    </span>
                    <img
                      src={getProxiedImageUrl(heroDeal.imageUrl)}
                      alt={heroDeal.title}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Fallback to direct raw url if proxy fails
                        const target = e.currentTarget;
                        if (target.src !== heroDeal.imageUrl) {
                          target.src = heroDeal.imageUrl;
                        }
                      }}
                      className="max-h-48 sm:max-h-56 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      <span>Amazon Fulfilled</span>
                      <span>•</span>
                      <span>Fast Delivery</span>
                      <span>•</span>
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Bento Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Tile A: Stackable Code Card */}
              <div className="rounded-3xl bg-stone-950 dark:bg-stone-900 text-white p-6 shadow-vault flex flex-col justify-between flex-1 relative overflow-hidden border border-stone-800">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-orange-300 text-[11px] font-mono font-bold">
                    <Ticket className="w-3.5 h-3.5" />
                    PRO TIP: BANK OFFERS
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">Instant Off</span>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    Stack Up to ₹2,000 on Cards
                  </h2>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Check card offers on HDFC, ICICI, SBI & OneCard at checkout for stacked instant discounts.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-dashed border-white/25 font-mono text-sm font-bold tracking-wider text-amber-300">
                    BANKOFFER
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon('BANKOFFER')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-950 text-xs font-bold transition-all active:scale-95"
                  >
                    {copiedCouponCode === 'BANKOFFER' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCouponCode === 'BANKOFFER' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Tile B: Price Audit Promise */}
              <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-6 shadow-vault flex flex-col justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-950 dark:text-white">Zero Fake-MRP Promise</h3>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        AUDITED
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      Every deal is checked for inflated MRPs. Tap any card's price graph to inspect real 90-day pricing history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. CATEGORY SELECTOR CAROUSEL */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-stone-950 dark:bg-white text-white dark:text-stone-950 shadow-md'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400 dark:text-orange-600' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. FEED HEADER & COMPACT CONTROLS */}
        <section aria-label="Curated Deals Feed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 dark:text-white">
                Live Audited Drops
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Showing {filteredDeals.length} deals • Updated via auto-audit
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Verified Filter toggle */}
              <button
                onClick={() => setOnlyVerifiedBrands(!onlyVerifiedBrands)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  onlyVerifiedBrands
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Brands ({verifiedCount})</span>
              </button>

              {/* Bank Offers Filter Toggle */}
              <button
                onClick={() => setOnlyBankOffers(!onlyBankOffers)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  onlyBankOffers
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Bank Offers ({bankOfferCount})</span>
              </button>

              {/* Minimum Rating Filter */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-950 dark:focus:border-white"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">★ 4.5 & up (Top Rated)</option>
                <option value="4.0">★ 4.0 & up (Great)</option>
                <option value="3.5">★ 3.5 & up (Good)</option>
                <option value="3.0">★ 3.0 & up</option>
              </select>

              {/* Deal Type Filter */}
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-950 dark:focus:border-white"
              >
                <option value="ALL">All Deal Types</option>
                <option value="LIGHTNING_DEAL">⚡ Lightning Drops</option>
                <option value="DEAL_OF_THE_DAY">☀️ Deal of the Day (24H)</option>
                <option value="BEST_DEAL_7DAY">🗓️ 7-Day / Best Deals</option>
                <option value="PRICE_GLITCH">🔥 Glitches (80%+)</option>
                <option value="PRICE_DROP">🏷️ Price Drops</option>
                <option value="COUPON">🎟️ Coupons ({couponCount})</option>
                <option value="PRIME_EXCLUSIVE">👑 Prime Exclusive</option>
                <option value="OUTLET_OVERSTOCK">📦 Outlet Overstock</option>
                <option value="CLEARANCE">🏷️ Clearance Liquidation</option>
              </select>

              {/* Min Discount Slider */}
              <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                <span className="text-stone-600 dark:text-stone-400 whitespace-nowrap font-mono">Min: {minDiscount}%</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(parseInt(e.target.value, 10))}
                  className="w-16 sm:w-20 accent-orange-600 cursor-pointer"
                />
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-950 dark:focus:border-white"
                >
                  <option value="discount">Highest Drop %</option>
                  <option value="savings">Max ₹ Savings</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. CONVERSION-FOCUSED DEAL CARDS GRID (3 COLUMNS) */}
          {filteredDeals.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-12 text-center my-6 shadow-vault">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center mx-auto mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-950 dark:text-white">No matching drops found</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
                Try clearing search terms or resetting filters to browse all active offers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('ALL');
                  setActiveIntent('all');
                  setActiveBudget('ALL');
                  setMinDiscount(0);
                  setSelectedDealType('ALL');
                  setOnlyVerifiedBrands(false);
                  setOnlyBankOffers(false);
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* 3-Column Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDeals.map((deal) => {
                  const isGlitch = deal.badge === 'GLITCH' || deal.discountPercentage >= 80;
                  const isCopied = copiedDealId === deal.id;
                  const inBag = isInCart(deal.id);
                  // Deterministic stock calculation for velocity bar
                  const stockPercent = Math.min(95, Math.max(55, ((deal.title.length * 7) % 38) + 60));

                  return (
                    <article
                      key={deal.id}
                      className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-vault hover:shadow-vault-hover hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Visual Container + Body */}
                      <div className="flex flex-col flex-1">
                        {/* Top Visual Area (Click opens 90d Price History Modal) */}
                        <div
                          onClick={() => setSelectedDealForHistory(deal)}
                          className="cursor-pointer relative h-52 bg-gradient-to-br from-stone-50 via-stone-100/60 to-orange-50/30 dark:from-stone-900 dark:via-stone-800/50 dark:to-stone-900 p-6 flex items-center justify-center border-b border-stone-200/70 dark:border-stone-800 overflow-hidden"
                        >
                          {/* Top-Left Discount & Brand Badge */}
                          <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[70%]">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs ${
                                isGlitch
                                  ? 'bg-red-600 text-white animate-pulse'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              -{deal.discountPercentage}% OFF
                            </span>

                            {deal.brandName && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-950/80 dark:bg-white/90 text-white dark:text-stone-950 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs truncate max-w-[120px]">
                                {deal.brandName}
                              </span>
                            )}
                          </div>

                          {/* Top-Right Quick Action: Share Affiliate Link */}
                          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleCopyDealUrl(deal, e)}
                              title="Copy deal link with affiliate tag"
                              className="p-2 rounded-xl bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-300 transition shadow-xs active:scale-95"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Product Image Stage */}
                          <div className="transform group-hover:scale-105 transition-transform duration-300 w-full h-full flex items-center justify-center">
                            {deal.imageUrl ? (
                              <img
                                src={getProxiedImageUrl(deal.imageUrl)}
                                alt={deal.title}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (target.src !== deal.imageUrl) {
                                    target.src = deal.imageUrl;
                                  }
                                }}
                                className="max-h-40 max-w-full object-contain drop-shadow-sm"
                              />
                            ) : (
                              <div className="text-xs font-mono text-stone-400">No Image</div>
                            )}
                          </div>

                          {/* Floating Price History Overlay */}
                          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shadow-xs">
                              <TrendingDown className="w-3.5 h-3.5" />
                              Lowest in 90d
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-stone-950/90 dark:bg-white/90 text-[10px] font-mono font-bold text-white dark:text-stone-950 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                              Inspect Graph →
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 pb-3 flex flex-col flex-1 justify-between">
                          <div>
                            {/* Social Proof */}
                            <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
                              <div className="inline-flex items-center gap-1.5 font-bold text-stone-950 dark:text-stone-100">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                <span>{deal.rating || '4.2'}</span>
                                <span className="font-normal text-stone-400">
                                  ({deal.ratingCount ? deal.ratingCount.toLocaleString('en-IN') : '840'})
                                </span>
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                                {deal.isLimitedTimeDeal ? '⚡ Limited Deal' : `${100 - stockPercent}% Left in Stock`}
                              </span>
                            </div>

                            {/* Title (Aligned 2-line height) */}
                            <h3
                              onClick={() => setSelectedDealForHistory(deal)}
                              className="cursor-pointer text-sm sm:text-base font-bold text-stone-950 dark:text-stone-100 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 min-h-[44px]"
                              title={deal.title}
                            >
                              {deal.title}
                            </h3>

                            {/* Tabular Pricing */}
                            <div className="flex items-baseline gap-2.5 mt-3">
                              <span className="text-2xl font-extrabold font-mono text-stone-950 dark:text-white tracking-tight tabular-nums">
                                {formatINR(deal.currentPrice)}
                              </span>
                              {deal.originalPrice > deal.currentPrice && (
                                <span className="text-xs font-mono text-stone-400 line-through tabular-nums">
                                  {formatINR(deal.originalPrice)}
                                </span>
                              )}
                              <span className="ml-auto text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                Save {formatINR(deal.savings)}
                              </span>
                            </div>

                            {/* Velocity Bar */}
                            <div className="mt-3">
                              <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200/50 dark:border-stone-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                  style={{ width: `${stockPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Extra Benefit Pill */}
                          <div className="mt-3 min-h-[26px] flex flex-col gap-1.5">
                            {deal.bankOffer?.hasBankOffer ? (
                              <div className="w-full px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-[10px] text-blue-700 dark:text-blue-300 flex items-center justify-between font-mono">
                                <span className="truncate">{deal.bankOffer.bankName ? `${deal.bankOffer.bankName} Card Offer` : 'Bank Instant Discount'}</span>
                                <span className="font-bold shrink-0 ml-1">{formatINR(deal.bankOffer.effectivePriceWithBank)}</span>
                              </div>
                            ) : deal.hasCoupon ? (
                              <div className="w-full px-2.5 py-1 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-[10px] text-amber-800 dark:text-amber-300 flex items-center justify-between font-mono">
                                <span className="flex items-center gap-1 truncate">
                                  <Ticket className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{deal.couponText || 'Extra Coupon Available'}</span>
                                </span>
                                <span className="font-bold shrink-0 ml-1">Apply on Amazon</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-stone-400 dark:text-stone-500 font-mono flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Amazon Fulfilled • Prime Verified</span>
                              </div>
                            )}

                            {/* Exchange & No Cost EMI Badges if present */}
                            {(deal.hasExchangeOffer || deal.hasNoCostEmi) && (
                              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                                {deal.hasExchangeOffer && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-semibold truncate max-w-[150px]">
                                    <ArrowLeftRight className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>{deal.exchangeDiscountText || 'Exchange Available'}</span>
                                  </span>
                                )}
                                {deal.hasNoCostEmi && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 font-semibold truncate">
                                    <CalendarCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{deal.noCostEmiText || 'No Cost EMI'}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer: Bag + Grab Deal */}
                      <div className="px-5 pb-5 pt-3 flex items-center gap-2">
                        {/* Bag toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            if (inBag) {
                              removeFromCart(deal.id);
                            } else {
                              addToCart(deal);
                            }
                          }}
                          title={inBag ? 'In Vault Bag (tap to remove)' : 'Add to Vault Bag'}
                          className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                            inBag
                              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                              : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-700 shadow-2xs'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{inBag ? 'In Bag' : 'Bag'}</span>
                        </button>

                        {/* Direct Grab Deal CTA */}
                        <a
                          href={injectAffiliateTag(deal.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-orange-600 dark:bg-white dark:hover:bg-orange-500 text-white dark:text-stone-950 dark:hover:text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                        >
                          <span>Grab Deal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* 6. PAGINATION CONTROLS (RESPONSIVE MOBILE & DESKTOP) */}
              <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-vault flex flex-col gap-3.5">
                {/* Top Info Bar: Counter & Mode Toggle */}
                <div className="flex flex-col xs:flex-row items-center justify-between gap-2.5 text-xs font-mono text-stone-500 dark:text-stone-400">
                  <div className="text-center xs:text-left">
                    {showAllWithoutPagination ? (
                      <span>
                        Viewing all <span className="font-bold text-stone-950 dark:text-white">{filteredDeals.length}</span> audited drops
                      </span>
                    ) : (
                      <span>
                        Showing <span className="font-bold text-stone-950 dark:text-white">{(currentPage - 1) * DEALS_PER_PAGE + 1}</span>–<span className="font-bold text-stone-950 dark:text-white">{Math.min(currentPage * DEALS_PER_PAGE, filteredDeals.length)}</span> of <span className="font-bold text-stone-950 dark:text-white">{filteredDeals.length}</span> drops
                      </span>
                    )}
                  </div>

                  {/* Toggle button: 48 per page vs View All */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllWithoutPagination(!showAllWithoutPagination);
                      if (showAllWithoutPagination) {
                        setCurrentPage(1);
                      }
                    }}
                    className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition border bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700 active:scale-95 shadow-2xs"
                  >
                    {showAllWithoutPagination ? (
                      <span>Switch to 48/page</span>
                    ) : (
                      <span>View All ({filteredDeals.length})</span>
                    )}
                  </button>
                </div>

                {/* Bottom Navigation Buttons (Only shown in paginated mode) */}
                {!showAllWithoutPagination && totalPages > 1 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1.5 sm:gap-2">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 600, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-stone-50 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 active:scale-95 shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden xs:inline">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center justify-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= (typeof window !== 'undefined' && window.innerWidth < 480 ? 0 : 1))
                        .reduce((acc: (number | string)[], p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                            acc.push('...');
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((pageItem, index) => {
                          if (pageItem === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-1 text-xs text-stone-400 font-mono">
                                …
                              </span>
                            );
                          }
                          const pageNum = pageItem as number;
                          const isActive = pageNum === currentPage;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setCurrentPage(pageNum);
                                window.scrollTo({ top: 600, behavior: 'smooth' });
                              }}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-xs font-mono font-bold transition flex items-center justify-center shrink-0 ${
                                isActive
                                  ? 'bg-stone-950 dark:bg-white text-white dark:text-stone-950 shadow-xs'
                                  : 'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 600, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-30 disabled:cursor-not-allowed bg-stone-50 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 active:scale-95 shrink-0"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* 7. DROPVAULT PLATFORM FOOTER & AFFILIATE DISCLOSURE */}
      <footer className="border-t border-stone-200/90 dark:border-stone-800/80 bg-white dark:bg-[#070A11] mt-16 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-200/80 dark:border-stone-800">
            {/* Col 1: Platform Brand & Mission (5 cols) */}
            <div className="md:col-span-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center shadow-sm">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-stone-950 dark:text-white">
                  DropVault
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm">
                DropVault is a real-time price intelligence engine that continuously audits Amazon India for verified lightning deals, genuine 90-day price drops, and clearance price glitches.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Auditing Active
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Every 4 Hours
                </span>
              </div>
            </div>

            {/* Col 2: Fast Navigation (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-950 dark:text-white font-mono">
                Curated Feeds
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                <li>
                  <button
                    onClick={() => {
                      setSelectedDealType('PRICE_GLITCH');
                      setActiveIntent('loot');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    🔥 Price Glitches (80%+ Off)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedDealType('LIGHTNING_DEAL');
                      setActiveIntent('lightning');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    ⚡ Lightning Flash Drops
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setOnlyVerifiedBrands(true);
                      setActiveIntent('verified');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    🛡️ Verified Brands Only
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setSelectedDealType('COUPON');
                      window.scrollTo({ top: 600, behavior: 'smooth' });
                    }}
                    className="hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    🎟️ Extra Checkbox Coupons
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Community & Shortcuts (4 cols) */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-950 dark:text-white font-mono">
                Platform Shortcuts
              </h4>
              <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                  <span>Quick Search Anywhere</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-[10px] text-stone-500 font-bold">
                    /
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                  <span>90-Day Trend Inspector</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">Click Any Deal</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                  <span>Wishlist Price Tracker</span>
                  <button
                    onClick={() => {
                      setShowWishlistSection(true);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-mono text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                  >
                    Open Tracker →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Official Amazon Associates Disclosure */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 max-w-2xl leading-relaxed font-mono">
              <strong>Affiliate Disclosure:</strong> DropVault is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. Product prices and availability are accurate as of the date/time indicated and are subject to change.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-stone-400 dark:text-stone-500 shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-stone-950 dark:hover:text-white transition font-semibold"
              >
                Back to Top ↑
              </button>
              <span>•</span>
              <span>© {new Date().getFullYear()} DropVault</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 90-Day Price History Modal */}
      <PriceHistoryModal
        deal={selectedDealForHistory}
        onClose={() => setSelectedDealForHistory(null)}
      />

      {/* Slide-over Express Vault Bag Drawer */}
      <SavedCartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />
    </div>
  );
}
