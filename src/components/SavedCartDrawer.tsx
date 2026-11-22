'use client';

import React from 'react';
import { X, ShoppingBag, Trash2, ExternalLink, ArrowRight, TrendingDown } from 'lucide-react';
import { useSavedCart } from '@/context/SavedCartContext';
import { injectAffiliateTag } from '@/lib/affiliate';

interface SavedCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedCartDrawer({ isOpen, onClose }: SavedCartDrawerProps) {
  const { cart, removeFromCart, clearCart, totalSavedValue } = useSavedCart();

  if (!isOpen) return null;

  const totalCartPrice = cart.reduce((acc, item) => acc + item.deal.currentPrice, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Saved For Later
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {cart.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Products saved to buy in future</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Your saved cart is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click the "Save to Cart" button on any bumper deal to store it here for future purchase.
                </p>
              </div>
            ) : (
              cart.map(({ deal }) => (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg bg-white dark:bg-white/5 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-transparent">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-black">
                          {deal.discountPercentage}% OFF
                        </span>
                        {deal.isVerifiedBrand && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            {deal.brandName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-xs text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition">
                        {deal.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          ₹{deal.currentPrice.toLocaleString('en-IN')}
                        </span>
                        {deal.originalPrice > deal.currentPrice && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                            ₹{deal.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeFromCart(deal.id)}
                          title="Remove from saved cart"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={injectAffiliateTag(deal.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Buy</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Total Value</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{totalCartPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Total Savings
                  </span>
                  <span>₹{totalSavedValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Continue Browsing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
