'use client';

import React from 'react';
import { X, ShoppingBag, Trash2, ExternalLink, ArrowRight, TrendingDown, PartyPopper, CheckCircle2 } from 'lucide-react';
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
  const totalOriginalPrice = cart.reduce((acc, item) => acc + (item.deal.originalPrice || item.deal.currentPrice), 0);
  const formatINR = (num: number) => '₹' + Math.round(num).toLocaleString('en-IN');

  const freeShippingThreshold = 2999;
  const shippingPct = Math.min(100, Math.round((totalCartPrice / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside className="w-screen max-w-md bg-white dark:bg-[#0B0F19] border-l border-stone-200/80 dark:border-stone-800 shadow-2xl flex flex-col h-full max-h-screen">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-950 dark:text-white flex items-center gap-2">
                  Vault Bag
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    {cart.length}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Locked Price Drops for Checkout</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Savings & Shipping Progress */}
          {cart.length > 0 && (
            <div className="px-6 py-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-200/70 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>You're saving {formatINR(totalSavedValue)} on these drops!</span>
                </span>
              </div>

              {/* Free Express Shipping Meter */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  <span>
                    {totalCartPrice >= freeShippingThreshold 
                      ? '✓ Unlocked Free Express Air Shipping' 
                      : `Add ${formatINR(freeShippingThreshold - totalCartPrice)} for Free Express Shipping`}
                  </span>
                  <span className="font-mono">{shippingPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white dark:bg-stone-800 overflow-hidden border border-emerald-200 dark:border-emerald-800/50">
                  <div 
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${shippingPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {cart.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Your Vault Bag is empty</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                  Click the bag icon on any live drop to lock in today's lowest prices.
                </p>
              </div>
            ) : (
              cart.map(({ deal }) => (
                <div
                  key={deal.id}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 flex items-center justify-center shrink-0 p-1">
                    <img
                      src={deal.imageUrl.startsWith('https://m.media-amazon.com/') ? `/api/image-proxy?url=${encodeURIComponent(deal.imageUrl)}` : deal.imageUrl}
                      alt={deal.title}
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                          -{deal.discountPercentage}% OFF
                        </span>
                        {deal.isVerifiedBrand && (
                          <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400">
                            {deal.brandName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                        {deal.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="font-extrabold text-sm text-stone-950 dark:text-white">
                          {formatINR(deal.currentPrice)}
                        </span>
                        {deal.originalPrice > deal.currentPrice && (
                          <span className="text-[11px] text-stone-400 line-through">
                            {formatINR(deal.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={injectAffiliateTag(deal.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold inline-flex items-center gap-1 transition"
                        >
                          <span>Buy</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => removeFromCart(deal.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-500 transition"
                          title="Remove from bag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Total MRP</span>
                  <span className="line-through tabular-nums">{formatINR(totalOriginalPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Total Savings</span>
                  <span className="tabular-nums">-{formatINR(totalSavedValue)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-950 dark:text-white pt-2 border-t border-stone-200/80 dark:border-stone-800">
                  <span>Locked Total</span>
                  <span className="tabular-nums">{formatINR(totalCartPrice)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 transition"
                >
                  Clear
                </button>
                <a
                  href={cart.length > 0 ? injectAffiliateTag(cart[0].deal.url) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span>Checkout on Amazon</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
