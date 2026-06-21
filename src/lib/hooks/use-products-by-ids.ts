'use client';

import * as React from 'react';
import { getProductsByIdsAction } from '@/lib/actions';
import type { Product } from '@/lib/mock-data';

export function useProductsByIds(ids: string[]) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const idsKey = ids.join(',');

  React.useEffect(() => {
    if (ids.length === 0) {
      // Use requestAnimationFrame to defer the state update
      const raf = requestAnimationFrame(() => {
        setProducts([]);
        setLoading(false);
      });
      return () => cancelAnimationFrame(raf);
    }

    let cancelled = false;
    const controller = new AbortController();

    getProductsByIdsAction(ids).then((data) => {
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idsKey]);

  return { products, loading };
}
