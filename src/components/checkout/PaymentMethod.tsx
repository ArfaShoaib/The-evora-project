"use client";

import * as React from "react";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const paymentMethods = [
  {
    id: "credit-card",
    name: "Credit Card",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay securely with PayPal",
    icon: Wallet,
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your order arrives at your door",
    icon: Banknote,
  },
];

interface PaymentMethodProps {
  selected?: string;
  onSelect?: (id: string) => void;
}

export function PaymentMethod({ selected = "cod", onSelect }: PaymentMethodProps) {
  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        Payment Method
      </h2>

      <div className="flex flex-col gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <label
              key={method.id}
              className={cn(
                "flex items-center gap-4 p-4 border cursor-pointer transition-colors",
                selected === method.id
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selected === method.id}
                onChange={() => onSelect?.(method.id)}
                className="sr-only"
              />
              <div className={cn(
                "size-10 flex items-center justify-center flex-shrink-0",
                selected === method.id ? "text-gold" : "text-muted-foreground"
              )}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Card Details (placeholder) */}
      {selected === "credit-card" && (
        <div className="mt-6 p-4 bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            Card payment form will be integrated with Stripe in Phase 3
          </p>
        </div>
      )}
    </div>
  );
}