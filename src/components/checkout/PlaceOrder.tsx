"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

interface PlaceOrderProps {
  onPlaceOrder?: () => void;
}

export function PlaceOrder({ onPlaceOrder }: PlaceOrderProps) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer mb-6">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 rounded border-border accent-gold"
        />
        <span className="text-sm text-muted-foreground">
          I agree to the{" "}
          <a href="/terms" className="text-foreground underline hover:text-gold transition-colors">
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="text-foreground underline hover:text-gold transition-colors">
            Privacy Policy
          </a>
        </span>
      </label>

      <button
        onClick={onPlaceOrder}
        disabled={!agreed}
        className="w-full h-13 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Place Order
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4" />
        <span>Secure checkout powered by Stripe</span>
      </div>
    </div>
  );
}