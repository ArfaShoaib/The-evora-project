"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/mock-data";

interface NewArrivalsGridProps {
  products: Product[];
}

export function NewArrivalsGrid({ products }: NewArrivalsGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="size-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="size-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No new arrivals yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Check back soon — fresh styles are always on the way.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
