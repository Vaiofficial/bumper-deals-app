'use client';

import React, { useState } from 'react';
import { 
  X, 
  TrendingDown, 
  ExternalLink, 
  Flame, 
  ShieldCheck, 
  ShoppingBag,
  Check,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { DealItem } from '@/types/deal';
import { calculateInDepthPriceStats } from '@/lib/priceAnalytics';
import { injectAffiliateTag } from '@/lib/affiliate';
import { useSavedCart } from '@/context/SavedCartContext';

interface PriceHistoryModalProps {
  deal: DealItem | null;
  onClose: () => void;
}

export function PriceHistoryModal({ deal, onClose }: PriceHistoryModalProps) {
  const { addToCart, isInCart, removeFromCart } = useSavedCart();
  const [activeTimeframe, setActiveTimeframe] = useState<'30D' | '60D' | '90D'>('90D');

  if (!deal) return null;

  const stats = calculateInDepthPriceStats(
    deal.currentPrice,
    deal.originalPrice,
    deal.discountPercentage,
    deal.asin
  );

  let chartData = stats.historyTimeline;
  if (activeTimeframe === '30D') {
    chartData = stats.historyTimeline.slice(-6);
  } else if (activeTimeframe === '60D') {
    chartData = stats.historyTimeline.slice(-9);
  }

  const isSaved = isInCart(deal.id);
  const formatINR = (num: number) => '₹' + Math.round(num).toLocaleString('en-IN');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 border border-stone-700 p-2.5 rounded-xl shadow-xl text-xs font-mono text-white">
          <div className="text-stone-400 font-medium mb-0.5">{data.date}</div>
          <div className="text-sm font-bold text-emerald-400">
            {formatINR(data.price)}
          </div>
          {data.event && (
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">
              <Flame className="w-2.5 h-2.5 text-orange-400" /> {data.event}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border-t sm:border border-stone-200 dark:border-stone-800 shadow-2xl p-4 sm:p-6 text-stone-900 dark:text-stone-100 overflow-hidden my-0 sm:my-8 max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              90-DAY PRICE AUDIT
            </span>
            <span className="text-xs font-mono text-stone-500 uppercase">
              {deal.brandName || deal.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Summary */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 p-1 flex items-center justify-center shrink-0">
              <img 
                src={deal.imageUrl.startsWith('https://m.media-amazon.com/') ? `/api/image-proxy?url=${encodeURIComponent(deal.imageUrl)}` : deal.imageUrl} 
                alt={deal.title} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-950 dark:text-white line-clamp-2 leading-snug">
                {deal.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-bold text-stone-950 dark:text-white">★ {deal.rating || '4.2'}</span>
                <span className="text-stone-400">({deal.ratingCount ? deal.ratingCount.toLocaleString() : '840'} reviews)</span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">Vault Verified</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="flex sm:justify-end items-baseline gap-2 font-mono">
              <span className="text-2xl font-extrabold text-stone-950 dark:text-white tabular-nums">
                {formatINR(deal.currentPrice)}
              </span>
              {deal.originalPrice > deal.currentPrice && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  {formatINR(deal.originalPrice)}
                </span>
              )}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-mono font-bold">
              -{deal.discountPercentage}% OFF
            </span>
          </div>
        </div>

        {/* 90-Day Trend Chart Card */}
        <div className="rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-950 dark:text-white">
                  90-Day Price Trend
                </h4>
                {/* Timeframe pill selector */}
                <div className="inline-flex rounded-lg p-0.5 bg-stone-200/70 dark:bg-stone-800 text-[10px] font-mono">
                  {(['30D', '60D', '90D'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        activeTimeframe === tf
                          ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-white shadow-2xs'
                          : 'text-stone-500 hover:text-stone-950 dark:hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                {stats.verdictDescription || 'Lowest price recorded in the last 90 days'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-stone-400 block text-[10px]">90D HIGH</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">{formatINR(stats.highestPrice)}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">90D AVG</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">{formatINR(stats.averagePrice)}</span>
              </div>
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">TODAY</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatINR(deal.currentPrice)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Area */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dealSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#78716c" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#78716c" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={stats.averagePrice} 
                  stroke="#a8a29e" 
                  strokeDasharray="3 3"
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#059669" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#dealSparkGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (isSaved) {
                removeFromCart(deal.id);
              } else {
                addToCart(deal);
              }
            }}
            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition flex items-center gap-2 ${
              isSaved
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSaved ? 'In Vault Bag' : 'Save to Bag'}</span>
          </button>

          <a
            href={injectAffiliateTag(deal.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Grab Deal on Amazon</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
