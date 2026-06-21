"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, HelpCircle } from "lucide-react";

interface ColorSelectorProps {
  colors: { name: string; hex: string }[];
  selectedColor?: string;
  onSelect?: (color: string) => void;
}

export function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
        Color
        {selectedColor && (
          <span className="ml-2 font-normal text-muted-foreground normal-case tracking-normal">
            — {selectedColor}
          </span>
        )}
      </h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const hasHex = color.hex && color.hex !== "#808080";
          const isLegacy = !color.hex || color.hex === "#808080";
          return (
            <button
              key={color.name}
              onClick={() => onSelect?.(color.name)}
              className={cn(
                "relative size-10 rounded-full border-2 transition-all",
                selectedColor === color.name
                  ? "border-gold ring-2 ring-gold/20"
                  : "border-border hover:border-muted-foreground"
              )}
              title={isLegacy ? `${color.name} (set hex in admin)` : color.name}
            >
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  backgroundColor: hasHex ? color.hex : undefined,
                  background: !hasHex
                    ? "repeating-conic-gradient(#D1D5DB 0% 25%, #F3F4F6 0% 50%) 50% / 8px 8px"
                    : undefined,
                }}
              />
              {!hasHex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <HelpCircle className="size-3 text-gray-400" />
                </div>
              )}
              {selectedColor === color.name && hasHex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={cn(
                      "size-4",
                      color.hex === "#FFFFFF" || color.hex === "#FFFDD0" || color.hex === "#F5E6D3"
                        ? "text-foreground"
                        : "text-background"
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}