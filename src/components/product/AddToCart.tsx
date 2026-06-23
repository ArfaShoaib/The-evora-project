"use client";

import * as React from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";

interface AddToCartProps {
  productId: string;
  stock: number;
  selectedSize?: string;
  selectedColor?: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
}

export function AddToCart({ productId, stock, selectedSize, selectedColor, sizes, colors }: AddToCartProps) {
  const [quantity, setQuantity] = React.useState(1);
  const { addItem } = useCart();
  const outOfStock = stock === 0;

  const handleAddToBag = () => {
    if (outOfStock) return;
    addItem({
      productId,
      size: selectedSize || sizes[0] || "One Size",
      color: selectedColor || colors[0]?.name || "Default",
      quantity,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity */}
      <div>
        <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
          Quantity
        </h3>
        <div className="inline-flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="size-11 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium text-foreground">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={quantity >= stock}
            className="size-11 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        <button
          onClick={handleAddToBag}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 h-13 px-8 bg-[#D4AF37] text-black text-xs font-semibold tracking-[0.2em] uppercase hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-md"
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
