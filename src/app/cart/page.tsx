"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";
import { createClient } from "@/lib/supabase/client";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponInput } from "@/components/cart/CouponInput";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [couponDiscount, setCouponDiscount] = React.useState(0);

  // Tax percentage from site_settings
  const [taxPercentage, setTaxPercentage] = React.useState(0);

  // Shipping cost from site_settings (PKR base)
  const [shippingCostPkr, setShippingCostPkr] = React.useState(0);

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = createClient();
        const [taxRes, shippingRes] = await Promise.all([
          supabase.from("site_settings").select("value").eq("key", "tax").single(),
          supabase.from("site_settings").select("value").eq("key", "shipping").single(),
        ]);

        const taxRow = taxRes.data as { value?: Record<string, unknown> } | null;
        if (taxRow?.value && typeof taxRow.value === "object" && "tax_percentage" in taxRow.value) {
          const pct = Number(taxRow.value.tax_percentage);
          if (pct >= 0 && pct <= 100) setTaxPercentage(pct);
        }

        const shippingRow = shippingRes.data as { value?: Record<string, unknown> } | null;
        if (shippingRow?.value && typeof shippingRow.value === "object" && "shipping_cost_pkr" in shippingRow.value) {
          setShippingCostPkr(Number(shippingRow.value.shipping_cost_pkr) || 0);
        }
      } catch {
        // fallback to 0
      }
    }
    fetchSettings();
  }, []);

  const productIds = React.useMemo(() => items.map((i) => i.productId), [items]);
  const { products, loading } = useProductsByIds(productIds);

  // Still loading if cart has items but products haven't loaded yet
  const isLoading = loading || (items.length > 0 && products.length === 0);

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as Array<{
      productId: string;
      quantity: number;
      size: string;
      color: string;
      product: (typeof products)[0];
    }>;

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );

  const shippingCost = shippingCostPkr;
  const tax = Number(((subtotal - couponDiscount) * (taxPercentage / 100)).toFixed(2));
  const total = subtotal - couponDiscount + shippingCost + tax;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-10 w-48 bg-muted animate-pulse rounded mb-8 sm:mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 sm:gap-6 py-6 border-b border-border">
                <div className="size-24 sm:size-32 bg-muted animate-pulse rounded" />
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2 mt-4">
                    <div className="size-9 bg-muted animate-pulse rounded" />
                    <div className="w-10 h-9 bg-muted animate-pulse rounded" />
                    <div className="size-9 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 p-6 animate-pulse rounded">
            <div className="h-5 w-32 bg-muted rounded mb-6" />
            <div className="flex flex-col gap-3">
              <div className="flex justify-between"><div className="h-4 w-20 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded" /></div>
              <div className="flex justify-between"><div className="h-4 w-16 bg-muted rounded" /><div className="h-4 w-12 bg-muted rounded" /></div>
              <div className="h-px bg-muted my-2" />
              <div className="flex justify-between"><div className="h-5 w-14 bg-muted rounded" /><div className="h-5 w-20 bg-muted rounded" /></div>
            </div>
            <div className="h-13 w-full bg-muted rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="size-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Your bag is empty
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Discover our curated collection of premium fashion pieces and find something you love.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-13 px-8 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8 sm:mb-12">
        Shopping Bag ({cartProducts.reduce((sum, item) => sum + item.quantity, 0)})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartProducts.map((item) => (
            <CartItem
              key={item.productId}
              product={item.product}
              quantity={item.quantity}
              size={item.size}
              color={item.color}
              onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
              onRemove={() => removeItem(item.productId)}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <CouponInput
            subtotal={subtotal}
            onApply={(c) => {
              setCouponDiscount(c.discount);
            }}
            onRemove={() => {
              setCouponDiscount(0);
            }}
          />
          <CartSummary subtotal={subtotal} shipping={shippingCost} tax={tax} total={total} discount={couponDiscount} />
        </div>
      </div>
    </div>
  );
}
