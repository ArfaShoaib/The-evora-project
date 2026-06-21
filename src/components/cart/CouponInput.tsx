"use client";

import * as React from "react";
import { Tag, AlertCircle } from "lucide-react";
import { validateCoupon } from "@/lib/actions";
import { useCurrency } from "@/lib/context/currency-context";

interface CouponInputProps {
  subtotal: number;
  onApply: (coupon: {
    couponId: string;
    discountType: string;
    discountValue: number;
    discount: number;
  }) => void;
  onRemove: () => void;
}

export function CouponInput({ subtotal, onApply, onRemove }: CouponInputProps) {
  const { formatPrice } = useCurrency();
  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [discount, setDiscount] = React.useState(0);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await validateCoupon(code.trim(), subtotal);
      if (result.valid) {
        setApplied(true);
        setDiscount(result.discount!);
        onApply({
          couponId: result.couponId!,
          discountType: result.discountType!,
          discountValue: result.discountValue!,
          discount: result.discount!,
        });
      } else {
        setError(result.error!);
      }
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(false);
    setCode("");
    setDiscount(0);
    setError(null);
    onRemove();
  };

  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">
        Coupon Code
      </h3>
      {applied ? (
        <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold/20">
          <div className="flex items-center gap-2 text-gold text-sm">
            <Tag className="size-4" />
            <span className="font-medium">{code.toUpperCase()}</span>
            <span className="text-muted-foreground">
              — {formatPrice(discount)} off
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
            <button
              onClick={handleApply}
              disabled={!code.trim() || loading}
              className="px-6 py-3 border border-border text-xs font-semibold tracking-wider uppercase text-foreground hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Apply"}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="size-3.5" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
