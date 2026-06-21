"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string;
  onSelect?: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
        Size
      </h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect?.(size)}
            className={cn(
              "min-w-[44px] h-11 px-4 text-sm font-medium border transition-colors",
              selectedSize === size
                ? "border-gold bg-gold/10 text-gold"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}