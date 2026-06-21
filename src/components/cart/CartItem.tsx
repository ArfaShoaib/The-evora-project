"use client";

import * as React from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/lib/mock-data";
import { useCurrency } from "@/lib/context/currency-context";

interface CartItemProps {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
}

export function CartItem({
  product,
  quantity,
  size,
  color,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const { formatPrice } = useCurrency();
  const price = product.salePrice ?? product.price;
  const total = price * quantity;

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-border">
      {/* Image */}
      <Image
        src={product.images?.[0] || "/mockpic.webp"}
        alt={product.name}
        width={128}
        height={128}
        unoptimized
        className="flex-shrink-0 size-24 sm:size-32 object-cover"
      />

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground line-clamp-1">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
                {product.category}
              </p>
            </div>
            <p className="text-sm font-medium text-foreground whitespace-nowrap">
              {formatPrice(total)}
            </p>
          </div>

          {/* Options */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {size && <span>Size: {size}</span>}
            {size && color && <span>·</span>}
            {color && <span>Color: {color}</span>}
          </div>
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="inline-flex items-center border border-border">
            <button
              onClick={() => onUpdateQuantity?.(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-foreground">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity?.(quantity + 1)}
              className="size-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}