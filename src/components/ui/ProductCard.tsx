"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import type { Product } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <div
      className={cn("group relative flex flex-col w-full", className)}
    >
      {/* Card Container */}
      <div className="relative w-full rounded-lg lg:rounded-xl overflow-hidden border border-gray-100 bg-background shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Link
            href={`/product/${product.slug}`}
            className="absolute inset-0"
            aria-label={`View ${product.name}`}
          >
            <Image
              src={product.images?.[0] || "/mockpic.webp"}
              alt={product.name}
              fill
              unoptimized
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            {product.images?.[1] && (
              <Image
                src={product.images[1]}
                alt={product.name}
                fill
                unoptimized
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100"
              />
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 lg:top-4 lg:left-4 z-10 flex flex-col gap-2">
            {product.isNew && (
              <span className="inline-flex items-center rounded-full bg-black px-3 py-1 lg:px-4 lg:py-1.5 text-[10px] lg:text-xs font-semibold tracking-wider uppercase text-white">
                New
              </span>
            )}
            {product.salePrice && (
              <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 lg:px-4 lg:py-1.5 text-[10px] lg:text-xs font-semibold tracking-wider uppercase text-black">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 lg:p-6">
          <Link
            href={`/product/${product.slug}`}
            className="text-base lg:text-xl font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="mt-1.5 text-xs lg:text-sm text-[#B0B0B0] uppercase tracking-wider">
            {product.category}
          </p>
          <div className="mt-3">
            <PriceDisplay price={product.price} salePrice={product.salePrice} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-stretch gap-2 mt-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem({
                  productId: product.id,
                  size: product.sizes[0] || "One Size",
                  color: product.colors[0]?.name || "Default",
                });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 lg:gap-2 lg:py-2.5 lg:px-3 text-xs lg:text-sm font-semibold rounded-lg bg-[#D4AF37] text-black hover:brightness-110 transition-all whitespace-nowrap"
              aria-label="Add to bag"
            >
              <ShoppingBag className="size-4 shrink-0" />
              Add to Bag
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const result = await toggleWishlist(product.id);
                  if (result.added) {
                    toast.success("Added to wishlist");
                  } else {
                    toast.success("Removed from wishlist");
                  }
                } catch {
                  toast.error("Please log in to use wishlist", {
                    description: "Create an account or sign in to save your favorites.",
                  });
                }
              }}
              className={cn(
                "shrink-0 flex items-center justify-center size-[36px] lg:size-[40px] rounded-lg border transition-all",
                isWishlisted
                  ? "border-foreground bg-foreground text-background"
                  : "border-gray-200 text-foreground hover:border-gold hover:text-gold"
              )}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("size-4", isWishlisted && "fill-current")} />
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="shrink-0 flex items-center justify-center size-[36px] lg:size-[40px] rounded-lg border border-gray-200 text-foreground hover:border-gold hover:text-gold transition-all"
              aria-label="Quick view"
            >
              <Eye className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
