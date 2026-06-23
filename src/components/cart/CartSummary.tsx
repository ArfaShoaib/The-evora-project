"use client";

import Link from "next/link";
import { useCurrency } from "@/lib/context/currency-context";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
}

export function CartSummary({ subtotal, shipping, tax, total, discount }: CartSummaryProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-muted/30 p-6">
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        Order Summary
      </h2>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        {discount != null && discount > 0 && (
          <div className="flex justify-between text-gold">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between font-semibold text-base">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-6 flex items-center justify-center h-13 w-full bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/shop"
        className="mt-3 flex items-center justify-center h-13 w-full border border-border text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:border-foreground transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}