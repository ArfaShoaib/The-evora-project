"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/context/wishlist-context";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";
import { ProductCard } from "@/components/ui/ProductCard";

export default function WishlistPage() {
  const { wishlistIds, isLoading } = useWishlist();
  const { products } = useProductsByIds(wishlistIds);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="size-6 mx-auto border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="size-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Heart className="size-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Your wishlist is empty
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Save your favorite pieces here for later. Tap the heart icon on any product to add it.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-13 px-8 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
        Wishlist
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {products.length} {products.length === 1 ? "item" : "items"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 justify-items-center">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-13 px-8 border border-border text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:border-foreground transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
