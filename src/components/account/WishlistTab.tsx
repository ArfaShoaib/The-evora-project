"use client";

import * as React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { useWishlist } from "@/lib/context/wishlist-context";
import { getProductsByIdsAction } from "@/lib/actions";
import type { Product } from "@/lib/mock-data";

export function WishlistTab() {
  const { wishlistIds, isLoading } = useWishlist();
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    if (wishlistIds.length > 0) {
      getProductsByIdsAction(wishlistIds).then((data) => {
        if (!cancelled) setProducts(data);
      });
    }
    return () => { cancelled = true; };
  }, [wishlistIds]);

  const displayProducts = wishlistIds.length > 0 ? products : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        My Wishlist
      </h2>

      {displayProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Your wishlist is empty. Browse our collection and save items you love.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-11 px-6 border border-border text-xs font-semibold tracking-wider uppercase text-foreground hover:border-gold transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
