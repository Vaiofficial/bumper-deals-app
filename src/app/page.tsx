'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Search, 
  TrendingDown, 
  Tag, 
  Star, 
  Clock, 
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
  ArrowLeftRight,
  CalendarCheck,
  Wrench,
  Sparkle,
  Apple,
  Dumbbell,
  Gamepad2,
  Car,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { DealItem, CategoryId, BudgetFilter, AmazonDealType } from '@/types/deal';
import { PriceHistoryModal } from '@/components/PriceHistoryModal';
import { WishlistTracker } from '@/components/WishlistTracker';
import { SavedCartDrawer } from '@/components/SavedCartDrawer';
import { useSavedCart } from '@/context/SavedCartContext';
import { injectAffiliateTag } from '@/lib/affiliate';

const CATEGORIES: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Deals', icon: LayoutGrid },
  { id: 'MOBILES', label: 'Mobiles & Accessories', icon: Smartphone },
  { id: 'LAPTOPS_COMPUTERS', label: 'Laptops & Computers', icon: Laptop },
  { id: 'TVS_APPLIANCES', label: 'TVs & Large Appliances', icon: Tv },
  { id: 'AUDIO_HEADPHONES', label: 'Audio & Earbuds', icon: Headphones },
  { id: 'SMART_HOME_WATCHES', label: 'Smartwatches & Watches', icon: Zap },
  { id: 'ELECTRONICS', label: 'Electronics & Gadgets', icon: Sparkles },
  { id: 'LUGGAGE_BAGS', label: 'Bags & Luggage', icon: Briefcase },
  { id: 'HOME_KITCHEN', label: 'Home & Kitchen', icon: UtensilsCrossed },
  { id: 'HOME_IMPROVEMENT', label: 'Home Improvement & Tools', icon: Wrench },
  { id: 'FASHION', label: 'Fashion & Footwear', icon: Shirt },
  { id: 'BEAUTY_GROOMING', label: 'Beauty & Grooming', icon: Sparkle },
  { id: 'GROCERY', label: 'Grocery & Gourmet', icon: Apple },
  { id: 'SPORTS_FITNESS', label: 'Sports & Fitness', icon: Dumbbell },
  { id: 'TOYS_GAMES', label: 'Toys & Games', icon: Gamepad2 },
  { id: 'AUTOMOTIVE', label: 'Car & Bike Accessories', icon: Car },
  { id: 'BOOKS', label: 'Books', icon: BookOpen },
];

const BUDGET_OPTIONS: { id: BudgetFilter; label: string }[] = [
  { id: 'ALL', label: 'Any Budget' },
  { id: 'UNDER_199', label: 'Under ₹199' },
  { id: 'UNDER_499', label: 'Under ₹499' },
  { id: 'UNDER_999', label: 'Under ₹999' },
  { id: 'UNDER_1999', label: 'Under ₹1,999' },
  { id: 'SAVINGS_2000', label: '₹2,000+ Savings' },
];

export default function Home() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('ALL');
  const [activeBudget, setActiveBudget] = useState<BudgetFilter>('ALL');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('ALL');
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

  const { cart, addToCart, removeFromCart, isInCart } = useSavedCart();
  const { theme, toggleTheme } = useTheme();

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.success && data.deals) {
        setDeals(data.deals);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
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
  const handleCopyDealUrl = (deal: DealItem) => {
    navigator.clipboard.writeText(injectAffiliateTag(deal.url));
    setCopiedDealId(deal.id);
    setTimeout(() => setCopiedDealId(null), 2000);
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
        // Amazon Deal Type Filter (Genuine multi-attribute matching)
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
        if (searchQuery.trim() && !deal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        // Discount threshold
        if (minDiscount > 0 && deal.discountPercentage < minDiscount && !deal.hasCoupon) {
          return false;
        }
        // Badge filter
        if (selectedBadge !== 'ALL' && deal.badge !== selectedBadge) {
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
  }, [deals, activeCategory, onlyVerifiedBrands, onlyBankOffers, selectedDealType, minRating, activeBudget, searchQuery, minDiscount, selectedBadge, sortBy]);

  const glitchCount = useMemo(() => deals.filter((d) => d.badge === 'GLITCH').length, [deals]);
  const verifiedCount = useMemo(() => deals.filter((d) => d.isVerifiedBrand).length, [deals]);
  const couponCount = useMemo(() => deals.filter((d) => d.hasCoupon).length, [deals]);
  const bankOfferCount = useMemo(() => deals.filter((d) => d.bankOffer?.hasBankOffer).length, [deals]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  BumperDeals.in
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hidden xs:inline-block">
                  Amazon India
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Live price drops & glitches for you and friends</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 overflow-x-auto py-1">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* 1-Click Share App Link */}
            <button
              onClick={handleCopyAppUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Copy App URL to share with friends"
            >
              {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
              <span>{copiedAppUrl ? 'Copied Link!' : 'Share App'}</span>
            </button>

            {/* Saved Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="View items saved to buy later"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Saved</span>
              {cart.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Wishlist Tracker Toggle */}
            <button
              onClick={() => setShowWishlistSection(!showWishlistSection)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showWishlistSection
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-black dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Wishlist</span>
            </button>

            {/* Scanner Button */}
            <button
              onClick={triggerManualScan}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-500 dark:text-amber-400' : ''}`} />
              <span>{refreshing ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wishlist Section (Toggled) */}
        {showWishlistSection && <WishlistTracker />}

        {/* Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Card 1: All Deals Reset */}
          <button
            onClick={() => {
              setOnlyVerifiedBrands(false);
              setSelectedDealType('ALL');
              setSelectedBadge('ALL');
            }}
            className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 ${
              !onlyVerifiedBrands && selectedDealType === 'ALL' && selectedBadge === 'ALL'
                ? 'ring-2 ring-sky-500 bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">All Verified Deals</span>
              <Tag className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{deals.length}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Click to show all</p>
          </button>

          {/* Card 2: Verified Brands Filter */}
          <button
            onClick={() => {
              if (onlyVerifiedBrands && selectedDealType === 'ALL') {
                setOnlyVerifiedBrands(false);
              } else {
                setOnlyVerifiedBrands(true);
                setSelectedDealType('ALL');
                setSelectedBadge('ALL');
              }
            }}
            className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 ${
              onlyVerifiedBrands
                ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20 dark:to-transparent hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-semibold">Verified Brands</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{verifiedCount}</div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              {onlyVerifiedBrands ? '✓ Filter active (click to clear)' : 'Click to filter brands'}
            </p>
          </button>

          {/* Card 3: Coupons Stacking Filter */}
          <button
            onClick={() => {
              if (selectedDealType === 'COUPON') {
                setSelectedDealType('ALL');
              } else {
                setSelectedDealType('COUPON');
                setOnlyVerifiedBrands(false);
                setSelectedBadge('ALL');
              }
            }}
            className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 ${
              selectedDealType === 'COUPON'
                ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-950/60 bg-gradient-to-br from-yellow-50/40 to-transparent dark:from-yellow-950/20 dark:to-transparent hover:border-yellow-400'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-yellow-400 mb-2">
              <span className="text-xs font-semibold">Coupons Stacking</span>
              <Ticket className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-yellow-300">{couponCount}</div>
            <p className="text-[10px] text-amber-600/80 dark:text-yellow-400/80 mt-1">
              {selectedDealType === 'COUPON' ? '✓ Filter active (click to clear)' : 'Click to filter coupons'}
            </p>
          </button>

          {/* Card 4: Price Glitches Filter */}
          <button
            onClick={() => {
              if (selectedDealType === 'PRICE_GLITCH') {
                setSelectedDealType('ALL');
              } else {
                setSelectedDealType('PRICE_GLITCH');
                setOnlyVerifiedBrands(false);
                setSelectedBadge('ALL');
              }
            }}
            className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 ${
              selectedDealType === 'PRICE_GLITCH'
                ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/40 border-red-400 dark:border-red-700'
                : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-950/60 bg-gradient-to-br from-red-50/40 to-transparent dark:from-red-950/20 dark:to-transparent hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-2">
              <span className="text-xs font-semibold">Price Glitches (80%+ Off)</span>
              <Zap className="w-4 h-4 text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{glitchCount}</div>
            <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-1">
              {selectedDealType === 'PRICE_GLITCH' ? '✓ Filter active (click to clear)' : 'Click to filter 80%+ glitches'}
            </p>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Budget Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
          <span className="text-slate-500 font-medium px-1 whitespace-nowrap">Budget:</span>
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBudget(b.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeBudget === b.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Controls / Filter Bar */}
        <div className="p-4 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title, brand or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Verified Brand Toggle */}
            <button
              onClick={() => setOnlyVerifiedBrands(!onlyVerifiedBrands)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                onlyVerifiedBrands
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Brands</span>
            </button>

            {/* Bank Offers Filter Toggle */}
            <button
              onClick={() => setOnlyBankOffers(!onlyBankOffers)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                onlyBankOffers
                  ? 'bg-blue-500 text-white border-blue-400 shadow shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank Offers ({bankOfferCount})</span>
            </button>

            {/* Amazon Deal Type Dropdown */}
            <select
              value={selectedDealType}
              onChange={(e) => setSelectedDealType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Deal Types</option>
              <option value="LIGHTNING_DEAL">⚡ Lightning Deals (Flash)</option>
              <option value="DEAL_OF_THE_DAY">☀️ Deal of the Day (24H)</option>
              <option value="BEST_DEAL_7DAY">🗓️ 7-Day / Best Deals</option>
              <option value="PRICE_GLITCH">🔥 Price Glitches (80%+)</option>
              <option value="PRICE_DROP">🏷️ Brand Drops (₹500+ Off)</option>
              <option value="COUPON">🎟️ Coupons Available</option>
              <option value="PRIME_EXCLUSIVE">👑 Prime Exclusive</option>
              <option value="OUTLET_OVERSTOCK">📦 Amazon Outlet / Overstock</option>
              <option value="CLEARANCE">🏷️ Clearance Liquidation</option>
            </select>

            {/* Minimum Star Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & up (Top Rated)</option>
              <option value="4.0">★ 4.0 & up (Great)</option>
              <option value="3.5">★ 3.5 & up (Good)</option>
              <option value="3.0">★ 3.0 & up</option>
            </select>

            {/* Discount Slider */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">Min: {minDiscount}%</span>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={minDiscount}
                onChange={(e) => setMinDiscount(parseInt(e.target.value, 10))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="discount">Highest % Drop</option>
              <option value="savings">Max ₹ Savings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Scanning Amazon India for bumper deals...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-300 mb-1">No deals found matching your criteria</h3>
            <p className="text-sm text-slate-500 mb-4">Try relaxing budget filters, minimum discount, or category selection.</p>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setActiveBudget('ALL');
                setMinDiscount(0);
                setSelectedBadge('ALL');
                setSelectedDealType('ALL');
                setMinRating(0);
                setOnlyVerifiedBrands(false);
                setOnlyBankOffers(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredDeals.map((deal) => {
              const isGlitch = deal.badge === 'GLITCH';
              const isCopied = copiedDealId === deal.id;

              return (
                <div
                  key={deal.id}
                  className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    isGlitch 
                      ? 'border-red-500/40 hover:border-red-500 hover:shadow-red-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40 hover:shadow-amber-500/5'
                  }`}
                >
                  {/* Badge & Brand Pill */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wide ${
                        isGlitch
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-amber-400 text-black'
                      }`}
                    >
                      {deal.discountPercentage}% OFF
                    </span>

                    {deal.hasCoupon && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-400 text-black shadow flex items-center gap-1 animate-bounce">
                        <Ticket className="w-3 h-3" />
                        {deal.couponText || 'COUPON'}
                      </span>
                    )}

                    {deal.isLimitedTimeDeal && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-400" /> LIMITED TIME
                      </span>
                    )}

                    {deal.isPrimeExclusive && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-950 text-sky-300 border border-blue-800 flex items-center gap-1">
                        👑 PRIME
                      </span>
                    )}

                    {deal.dealType === 'OUTLET_OVERSTOCK' && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                        📦 OUTLET
                      </span>
                    )}

                    {deal.isVerifiedBrand && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {deal.brandName || 'BRAND'}
                      </span>
                    )}

                    {isGlitch && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-950 text-red-300 border border-red-800">
                        ⚡ GLITCH
                      </span>
                    )}

                    {deal.badge === 'PRICE_DROP' && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> DROP
                      </span>
                    )}
                  </div>

                  {/* Top-Right Copy Link Button */}
                  <button
                    onClick={() => handleCopyDealUrl(deal)}
                    title="Copy direct Amazon deal link"
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition shadow"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Image Container */}
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-t-2xl flex items-center justify-center h-48 overflow-hidden relative border-b border-slate-100 dark:border-transparent">
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="object-contain max-h-full max-w-full group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-slate-400 dark:text-slate-600 text-xs flex items-center gap-1">
                        <Tag className="w-4 h-4" /> No Preview
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Rating info */}
                      {deal.rating ? (
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 mb-1.5 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{deal.rating}</span>
                          {deal.ratingCount && (
                            <span className="text-slate-400 dark:text-slate-500">({deal.ratingCount.toLocaleString()})</span>
                          )}
                        </div>
                      ) : (
                        <div className="h-5" />
                      )}

                      {/* Title */}
                      <h3
                        title={deal.title}
                        className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm line-clamp-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition mb-3 leading-snug"
                      >
                        {deal.title}
                      </h3>
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                          ₹{deal.currentPrice.toLocaleString('en-IN')}
                        </span>
                        {deal.originalPrice > deal.currentPrice && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                            ₹{deal.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {deal.savings > 0 && (
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Save ₹{deal.savings.toLocaleString('en-IN')}
                        </div>
                      )}

                      {/* Bank Offer Pill & Effective Price */}
                      {deal.bankOffer && deal.bankOffer.hasBankOffer && (
                        <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-[11px]">
                          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-medium">
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold">{deal.bankOffer.bankName ? `${deal.bankOffer.bankName} Offer` : 'Bank Offer'}</span>
                            </span>
                            <span className="font-bold text-blue-900 dark:text-white">
                              ₹{deal.bankOffer.effectivePriceWithBank.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {deal.bankOffer.offerText && (
                            <p className="text-[10px] text-blue-600/90 dark:text-blue-400/80 truncate mt-0.5 font-medium">
                              {deal.bankOffer.offerText}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Exchange Offer & No Cost EMI Badges */}
                      {(deal.hasExchangeOffer || deal.hasNoCostEmi) && (
                        <div className="mb-3 flex flex-wrap gap-1.5 text-[10px]">
                          {deal.hasExchangeOffer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/20 font-semibold">
                              <ArrowLeftRight className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                              <span className="truncate max-w-[130px]">{deal.exchangeDiscountText || 'Exchange Available'}</span>
                            </span>
                          )}
                          {deal.hasNoCostEmi && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/20 font-semibold">
                              <CalendarCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{deal.noCostEmiText || 'No Cost EMI'}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons: History + Add to Cart + Buy */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDealForHistory(deal)}
                          title="View Price Trend & History"
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (isInCart(deal.id)) {
                              removeFromCart(deal.id);
                            } else {
                              addToCart(deal);
                            }
                          }}
                          title={isInCart(deal.id) ? 'Remove from Saved Cart' : 'Save to Cart for later'}
                          className={`p-2.5 rounded-xl border transition ${
                            isInCart(deal.id)
                              ? 'bg-amber-400 text-black border-amber-300 shadow'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        <a
                          href={injectAffiliateTag(deal.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition shadow-sm ${
                            isGlitch
                              ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                              : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                          }`}
                        >
                          <span>Grab Deal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Price History Modal */}
      <PriceHistoryModal
        deal={selectedDealForHistory}
        onClose={() => setSelectedDealForHistory(null)}
      />

      {/* Saved Cart Drawer */}
      <SavedCartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />
    </div>
  );
}
