"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import { useCart } from "@/lib/context/cart-context";
import { useWishlist } from "@/lib/context/wishlist-context";
import type { Product } from "@/lib/mock-data";

interface NewArrivalsProductCardProps {
  product: Product;
  index?: number;
}

export function NewArrivalsProductCard({
  product,
  index = 0,
}: NewArrivalsProductCardProps) {
  const { addItem } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative flex flex-col w-full"
    >
      {/* Card Container */}
      <div className="relative rounded-md overflow-hidden border border-gray-100 bg-background transition-shadow duration-300 hover:shadow-lg">
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
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

          {/* "NEW" Pill Badge */}
          {product.isNew && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: index * 0.1 + 0.2 }}
              className="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-semibold tracking-wider text-white"
            >
              NEW
            </motion.span>
          )}

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
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={cn("size-4", isWishlisted && "fill-current")}
            />
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
        <div className="p-4">
          <Link
            href={`/product/${product.slug}`}
            className="text-base font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-[#B0B0B0] uppercase tracking-wider">
            {product.category}
          </p>
          <div className="mt-2">
            <PriceDisplay
              price={product.price}
              salePrice={product.salePrice}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
