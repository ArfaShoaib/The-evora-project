"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />

      <div className="flex justify-center mb-6">
        <div className="size-16 rounded-full bg-gold/10 flex items-center justify-center">
          <CheckCircle className="size-8 text-gold" />
        </div>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
        Thank You!
      </h1>
      <p className="text-muted-foreground mb-2">
        Your order has been placed successfully.
      </p>
      {orderNumber && (
        <p className="text-sm text-muted-foreground mb-8">
          Order Number: <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link
          href={`/track-order${orderNumber ? `?order=${orderNumber}` : ""}`}
          className="inline-flex items-center gap-2 h-12 px-6 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors"
        >
          <Truck className="size-4" />
          Track Order
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 h-12 px-6 border border-border text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-colors"
        >
          Continue Shopping
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="border border-border p-6 text-left">
        <div className="flex items-center gap-3 mb-4">
          <Package className="size-5 text-gold" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground">
            What&apos;s Next?
          </h2>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">1.</span>
            <span>You&apos;ll receive an email confirmation with your order details.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">2.</span>
            <span>We&apos;ll process your order and send you a tracking number once shipped.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">3.</span>
            <span>Track your order anytime using your order number and email.</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Create an account to view your order history and save your details for faster checkout.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 h-10 px-5 bg-gold text-black text-xs font-semibold tracking-[0.15em] uppercase hover:brightness-110 transition-all"
          >
            Create Account
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 h-10 px-5 border border-border text-foreground text-xs font-semibold tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
          <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </React.Suspense>
  );
}
