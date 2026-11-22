'use client';

import React, { useState } from 'react';
import { 
  X, 
  TrendingDown, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowDownRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid 
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

  // Filter timeline based on selected timeframe
  let chartData = stats.historyTimeline;
  if (activeTimeframe === '30D') {
    chartData = stats.historyTimeline.slice(-6);
  } else if (activeTimeframe === '60D') {
    chartData = stats.historyTimeline.slice(-9);
  }

  const isSaved = isInCart(deal.id);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <div className="text-slate-400 font-medium mb-1">{data.date}</div>
          <div className="text-base font-bold text-white">
            ₹{data.price.toLocaleString('en-IN')}
          </div>
          {data.event && (
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Flame className="w-2.5 h-2.5 text-amber-400" /> {data.event}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-900 dark:text-slate-100 overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-white/5 p-1.5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <img src={deal.imageUrl} alt={deal.title} className="object-contain max-h-full max-w-full" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-black">
                  {deal.discountPercentage}% OFF
                </span>
                {deal.isVerifiedBrand && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {deal.brandName}
                  </span>
                )}
                {deal.asin && (
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">ASIN: {deal.asin}</span>
                )}
              </div>
              <h3 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
                {deal.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BuyHatke-Style Price Verdict Alert */}
        <div className={`p-4 mb-5 rounded-2xl border flex items-start gap-3 ${
          stats.verdict === 'BEST_TIME_TO_BUY'
            ? 'bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
            : stats.verdict === 'GOOD_DEAL'
            ? 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-amber-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-100'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}>
          <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
            stats.verdict === 'BEST_TIME_TO_BUY'
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            {stats.verdict === 'BEST_TIME_TO_BUY' ? <Flame className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${
                stats.verdict === 'BEST_TIME_TO_BUY' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
              }`}>
                {stats.verdict.replace(/_/g, ' ')}
              </span>
              {stats.isAllTimeLow && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:text-black">
                  ⭐ ALL-TIME LOW
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {stats.verdictDescription}
            </p>
          </div>
        </div>

        {/* 4-Column BuyHatke Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {/* Current */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Current Price</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              ₹{stats.currentPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
              <ArrowDownRight className="w-3 h-3" /> {stats.priceDropPercentage}% below avg
            </div>
          </div>

          {/* Lowest */}
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-950/50">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Lowest Ever</span>
            <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
              ₹{stats.lowestPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Last 90 days</div>
          </div>

          {/* Average */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">90D Average</span>
            <div className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">
              ₹{stats.averagePrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Typical Price</div>
          </div>

          {/* Highest */}
          <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-950/50">
            <span className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Highest Price</span>
            <div className="text-lg font-black text-red-800 dark:text-red-300 mt-0.5">
              ₹{stats.highestPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-through">MRP Baseline</div>
          </div>
        </div>

        {/* Chart Header & Timeframe Switcher */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Price Graph</h4>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
            {(['30D', '60D', '90D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeframe(t)}
                className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                  activeTimeframe === t
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* In-Depth Recharts Area Graph */}
        <div className="h-56 w-full p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? Math.round(val / 1000) + 'k' : val}`}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={stats.averagePrice} 
                stroke="#64748b" 
                strokeDasharray="4 4" 
                label={{ value: 'Avg', fill: '#94a3b8', fontSize: 10, position: 'right' }} 
              />
              <ReferenceLine 
                y={stats.lowestPrice} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
                label={{ value: 'Lowest', fill: '#10b981', fontSize: 10, position: 'left' }} 
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#f59e0b" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (isSaved) {
                removeFromCart(deal.id);
              } else {
                addToCart(deal);
              }
            }}
            className={`px-4 py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-amber-400 text-black border-amber-300 shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSaved ? 'In Cart' : 'Save for Later'}</span>
          </button>

          <a
            href={injectAffiliateTag(deal.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition active:scale-98"
          >
            <span>Grab Deal on Amazon.in</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
