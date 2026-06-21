"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import type { Product } from "@/lib/mock-data";

interface SaleProductCardProps {
  product: Product;
  className?: string;
}

export function SaleProductCard({ product, className }: SaleProductCardProps) {
  const { addItem } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistIds.includes(product.id);

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div
      className={cn("group relative flex flex-col w-full", className)}
    >
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.images?.[1] && (
            <Image
              src={product.images[1]}
              alt={product.name}
              fill
              unoptimized
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.salePrice && (
            <span className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase bg-gold text-foreground">
              −{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            try {
              await toggleWishlist(product.id);
            } catch {
              // not logged in — ignore
            }
          }}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300",
            isWishlisted
              ? "bg-foreground text-background"
              : "bg-background/80 text-foreground opacity-0 group-hover:opacity-100"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("size-4", isWishlisted && "fill-current")} />
        </button>

        {/* Quick Actions Overlay — hidden on mobile, visible on hover for desktop */}
        <div
          className={cn(
            "absolute bottom-3 left-3 right-3 z-10 hidden lg:flex flex-col gap-2 transition-all duration-300",
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                productId: product.id,
                size: product.sizes[0] || "One Size",
                color: product.colors[0]?.name || "Default",
              });
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-md bg-[#D4AF37] text-black hover:brightness-110 transition-all whitespace-nowrap"
            aria-label="Add to bag"
          >
            <ShoppingBag className="size-3.5" />
            Add to Bag
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-md bg-white/80 backdrop-blur-sm text-black hover:bg-white transition-all whitespace-nowrap"
          >
            <Eye className="size-3.5" />
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1.5 pt-4">
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </p>
        <PriceDisplay price={product.price} salePrice={product.salePrice} />
      </div>
    </div>
  );
}
