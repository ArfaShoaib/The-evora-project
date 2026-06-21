'use client';

import * as React from 'react';
import { getWishlist, toggleWishlist as toggleWishlistAction } from '@/lib/actions';

interface WishlistContextValue {
  wishlistIds: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => Promise<{ added: boolean }>;
  isInWishlist: (productId: string) => Promise<boolean>;
  isLoading: boolean;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getWishlist().then((ids) => {
      if (!cancelled) {
        setWishlistIds(ids);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const toggleWishlist = React.useCallback(async (productId: string) => {
    const result = await toggleWishlistAction(productId);
    setWishlistIds((prev) => {
      if (result.added) {
        return prev.includes(productId) ? prev : [...prev, productId];
      } else {
        return prev.filter((id) => id !== productId);
      }
    });
    return result;
  }, []);

  const isInWishlist = React.useCallback(async (productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const wishlistCount = wishlistIds.length;

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
