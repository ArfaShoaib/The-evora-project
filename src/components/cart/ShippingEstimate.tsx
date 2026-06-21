"use client";

import * as React from "react";
import { Truck, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/context/currency-context";

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5–7 business days",
    price: 0,
    freeOver: 250,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2–3 business days",
    price: 15,
    freeOver: null,
    icon: Zap,
  },
  {
    id: "next-day",
    name: "Next Day Delivery",
    description: "Next business day",
    price: 25,
    freeOver: null,
    icon: Clock,
  },
];

interface ShippingEstimateProps {
  subtotal: number;
  selected?: string;
  onSelect?: (id: string) => void;
}

export function ShippingEstimate({ subtotal, selected = "standard", onSelect }: ShippingEstimateProps) {
  const { formatPrice } = useCurrency();
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
        Shipping Method
      </h3>
      <div className="flex flex-col gap-2">
        {shippingOptions.map((option) => {
          const isFree = option.freeOver !== null && subtotal >= option.freeOver;
          const price = isFree ? 0 : option.price;
          const Icon = option.icon;

          return (
            <label
              key={option.id}
              className={cn(
                "flex items-center gap-4 p-4 border cursor-pointer transition-colors",
                selected === option.id
                  ? "border-gold bg-gold/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selected === option.id}
                onChange={() => onSelect?.(option.id)}
                className="sr-only"
              />
              <div className={cn(
                "size-10 flex items-center justify-center flex-shrink-0",
                selected === option.id ? "text-gold" : "text-muted-foreground"
              )}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{option.name}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <span className="text-sm font-medium text-foreground">
                {price === 0 ? "Free" : formatPrice(price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}