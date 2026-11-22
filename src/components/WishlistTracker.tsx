'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, ExternalLink, CheckCircle, RefreshCw, BellRing } from 'lucide-react';
import { WishlistItem } from '@/types/deal';
import { injectAffiliateTag } from '@/lib/affiliate';

export function WishlistTracker() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlOrAsin, setUrlOrAsin] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrAsin || !targetPrice) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrAsin, targetPrice: parseFloat(targetPrice) }),
      });
      const data = await res.json();
      if (data.success) {
        setUrlOrAsin('');
        setTargetPrice('');
        fetchWishlist();
      } else {
        setErrorMsg(data.error || 'Failed to add item');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/wishlist?id=${id}`, { method: 'DELETE' });
      fetchWishlist();
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  return (
    <div className="mb-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Custom Price Drop Wishlist
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {items.length} Tracked
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paste any Amazon product link or ASIN to track its price</p>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Amazon URL or ASIN (e.g. B08N5WRWNW or https://amazon.in/dp/...)"
          value={urlOrAsin}
          onChange={(e) => setUrlOrAsin(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <input
          type="number"
          placeholder="Target Price (₹)"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/10 disabled:opacity-50"
        >
          {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{submitting ? 'Tracking...' : 'Track Item'}</span>
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Tracked Items Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => {
            const isMet = item.currentPrice <= item.targetPrice;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isMet
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-10 object-contain rounded-lg bg-white dark:bg-white/5 p-1 shrink-0 border border-slate-200 dark:border-transparent"
                    />
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-white">₹{item.currentPrice.toLocaleString('en-IN')}</span>
                      <span className="text-slate-500">| Target: ₹{item.targetPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isMet ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:text-black flex items-center gap-1 animate-pulse">
                      <BellRing className="w-3 h-3" /> HIT
                    </span>
                  ) : null}
                  <a
                    href={injectAffiliateTag(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
