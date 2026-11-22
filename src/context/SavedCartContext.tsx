'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DealItem } from '@/types/deal';

interface SavedCartItem {
  deal: DealItem;
  addedAt: string;
}

interface SavedCartContextType {
  cart: SavedCartItem[];
  addToCart: (deal: DealItem) => void;
  removeFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  clearCart: () => void;
  totalSavedValue: number;
}

const SavedCartContext = createContext<SavedCartContextType | undefined>(undefined);

const STORAGE_KEY = 'bumper_deals_saved_cart';

export function SavedCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<SavedCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved cart:', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart:', e);
      }
    }
  }, [cart, mounted]);

  const addToCart = (deal: DealItem) => {
    setCart((prev) => {
      if (prev.some((item) => item.deal.id === deal.id)) {
        return prev;
      }
      return [{ deal, addedAt: new Date().toISOString() }, ...prev];
    });
  };

  const removeFromCart = (dealId: string) => {
    setCart((prev) => prev.filter((item) => item.deal.id !== dealId));
  };

  const isInCart = (dealId: string) => {
    return cart.some((item) => item.deal.id === dealId);
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalSavedValue = cart.reduce((acc, item) => acc + (item.deal.savings || 0), 0);

  return (
    <SavedCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        isInCart,
        clearCart,
        totalSavedValue,
      }}
    >
      {children}
    </SavedCartContext.Provider>
  );
}

export function useSavedCart() {
  const context = useContext(SavedCartContext);
  if (!context) {
    throw new Error('useSavedCart must be used within a SavedCartProvider');
  }
  return context;
}
