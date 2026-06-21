"use client";

import { useCurrency } from "@/lib/context/currency-context";

interface OrderSummaryProps {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

export function OrderSummary({ items, subtotal, shipping, tax, discount, couponCode, total }: OrderSummaryProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-muted/30 p-6 sticky top-24">
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        Order Summary
      </h2>

      {/* Items */}
      <div className="flex flex-col gap-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground line-clamp-1">
              {item.name} x {item.quantity}
            </span>
            <span className="text-foreground font-medium whitespace-nowrap">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px bg-border mb-4" />

      {/* Totals */}
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
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
        {discount > 0 && (
          <div className="flex justify-between text-[#C9A84C]">
            <span>Discount ({couponCode})</span>
            <span className="font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between font-semibold text-base">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
