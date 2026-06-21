"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/mock-data";

interface SalePageContentProps {
  products: Product[];
}

export function SalePageContent({ products }: SalePageContentProps) {
  return (
    <>
      {/* Product count */}
      <p className="text-sm text-muted-foreground mb-8">
        {products.length} products on sale
      </p>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
