'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';

export type Currency = 'USD' | 'PKR';

const DEFAULT_EXCHANGE_RATE = 278;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amount: number) => string;
  formatDisplayPrice: (amount: number) => string;
  convert: (amount: number) => number;
  revert: (amount: number) => number;
  exchangeRate: number;
}

const CurrencyContext = React.createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = React.useState(DEFAULT_EXCHANGE_RATE);

  // Read saved currency from localStorage after mount (avoids hydration mismatch)
  React.useEffect(() => {
    const saved = localStorage.getItem('currency') as Currency | null;
    if (saved === 'USD' || saved === 'PKR') {
      React.startTransition(() => { setCurrencyState(saved); });
    }
  }, []);

  // Fetch exchange rate from Supabase on mount
  React.useEffect(() => {
    let cancelled = false;
    async function fetchRate() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'currency')
          .single();

        const row = data as { value?: Record<string, unknown> } | null;
        if (!cancelled && row?.value && typeof row.value === 'object' && 'exchange_rate' in row.value) {
          const rate = Number(row.value.exchange_rate);
          if (rate > 0) setExchangeRate(rate);
        }
      } catch {
        // fallback to default
      }
    }
    fetchRate();
    return () => { cancelled = true; };
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  };

  const convert = (amount: number): number => {
    // Base currency is PKR (admin inputs prices in PKR)
    if (currency === 'USD') {
      return Number((amount / exchangeRate).toFixed(2));
    }
    return amount;
  };

  const revert = (amount: number): number => {
    // Convert from display currency back to PKR
    if (currency === 'USD') {
      return Math.round(amount * exchangeRate);
    }
    return amount;
  };

  const formatPrice = (amount: number): string => {
    const converted = convert(amount);
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    }
    return `Rs ${Math.round(converted).toLocaleString('en-PK')}`;
  };

  const formatDisplayPrice = (amount: number): string => {
    // Format a value that is already in display currency (no conversion)
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatDisplayPrice, convert, revert, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
