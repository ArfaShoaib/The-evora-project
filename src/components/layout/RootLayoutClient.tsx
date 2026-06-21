'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/context/cart-context';
import { WishlistProvider } from '@/lib/context/wishlist-context';
import { CurrencyProvider } from '@/lib/context/currency-context';
import { FlashSaleBanner } from '@/components/ui/FlashSaleBanner';

async function fetchSection(key: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/site-content?key=${key}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content || null;
  } catch {
    return null;
  }
}

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [flashSaleData, setFlashSaleData] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    fetchSection('flash_sale').then(setFlashSaleData);
  }, []);

  if (isAdmin) {
    return (
      <CartProvider>
        {children}
        <Toaster position="top-right" richColors />
      </CartProvider>
    );
  }

  return (
    <CurrencyProvider>
      <CartProvider>
        <WishlistProvider>
          <FlashSaleBanner data={flashSaleData} />
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </WishlistProvider>
      </CartProvider>
      <Toaster position="top-right" richColors />
    </CurrencyProvider>
  );
}
