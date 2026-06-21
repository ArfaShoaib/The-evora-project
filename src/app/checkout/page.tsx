"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/cart-context";
import { useProductsByIds } from "@/lib/hooks/use-products-by-ids";
import { createOrder } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { BillingForm } from "@/components/checkout/BillingForm";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PlaceOrder } from "@/components/checkout/PlaceOrder";
import { addressSchema, type AddressInput } from "@/lib/validations";

const emptyAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

interface AppliedCoupon {
  coupon_id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_amount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [shippingData, setShippingData] = React.useState(emptyAddress);
  const [billingData, setBillingData] = React.useState(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = React.useState(true);
  const [selectedPayment, setSelectedPayment] = React.useState("cod");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = React.useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);

  // Validation errors
  const [shippingErrors, setShippingErrors] = React.useState<Partial<Record<keyof AddressInput, string>>>({});
  const [billingErrors, setBillingErrors] = React.useState<Partial<Record<keyof AddressInput, string>>>({});
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

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
  const { products } = useProductsByIds(productIds);

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

  const orderItems = cartProducts.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.salePrice ?? item.product.price,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * (taxPercentage / 100)).toFixed(2));
  const shipping = shippingCostPkr;
  const discount = appliedCoupon?.discount_amount ?? 0;
  const total = subtotal + tax + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), cart_total: subtotal }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          coupon_id: data.coupon_id,
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discount_amount: data.discount_amount,
        });
        const label =
          data.discount_type === "percentage"
            ? `${data.discount_value}% off`
            : `${data.discount_value} off`;
        setCouponSuccess(`${data.code} applied — ${label}!`);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error);
        setCouponSuccess(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    // Validate shipping
    const shippingResult = addressSchema.safeParse(shippingData);
    if (!shippingResult.success) {
      const fieldErrors: Partial<Record<keyof AddressInput, string>> = {};
      shippingResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AddressInput;
        fieldErrors[field] = issue.message;
      });
      setShippingErrors(fieldErrors);
      setBillingErrors({});
      setPaymentError(null);
      return;
    }
    setShippingErrors({});

    // Validate billing if different from shipping
    if (!sameAsShipping) {
      const billingResult = addressSchema.safeParse(billingData);
      if (!billingResult.success) {
        const fieldErrors: Partial<Record<keyof AddressInput, string>> = {};
        billingResult.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof AddressInput;
          fieldErrors[field] = issue.message;
        });
        setBillingErrors(fieldErrors);
        setPaymentError(null);
        return;
      }
    }
    setBillingErrors({});

    // Validate payment method
    if (!selectedPayment) {
      setPaymentError("Please select a payment method");
      return;
    }
    setPaymentError(null);

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartProducts.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.product.salePrice ?? item.product.price,
        })),
        shipping_address: shippingData,
        billing_address: sameAsShipping ? shippingData : billingData,
        payment_method: selectedPayment,
        customer_email: shippingData.email || undefined,
        coupon_id: appliedCoupon?.coupon_id,
        coupon_code: appliedCoupon?.code,
        discount_amount: appliedCoupon?.discount_amount,
      };

      await createOrder(orderData);

      // Increment coupon usage after successful order
      if (appliedCoupon?.coupon_id) {
        await fetch("/api/apply-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupon_id: appliedCoupon.coupon_id }),
        });
      }

      clearCart();
      router.push("/account?tab=orders");
    } catch (error) {
      console.error("Failed to place order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-8">
          Add some items to your cart before checking out.
        </p>
        <a
          href="/shop"
          className="inline-flex items-center justify-center h-13 px-8 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors"
        >
          Browse Shop
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8 sm:mb-12">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Forms */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <ShippingForm data={shippingData} onChange={setShippingData} errors={shippingErrors} />
          <div className="h-px bg-border" />
          <BillingForm
            data={billingData}
            onChange={setBillingData}
            sameAsShipping={sameAsShipping}
            onSameAsShippingChange={setSameAsShipping}
            errors={billingErrors}
          />
          <div className="h-px bg-border" />
          <PaymentMethod selected={selectedPayment} onSelect={setSelectedPayment} />
          {paymentError && (
            <p className="text-sm text-red-600">{paymentError}</p>
          )}
          <div className="h-px bg-border" />

          {/* Coupon Section */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Have a coupon?
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                  if (couponSuccess) setCouponSuccess(null);
                }}
                placeholder="Enter coupon code"
                disabled={!!appliedCoupon}
                className="flex-1 px-4 py-2.5 bg-muted/50 border border-border text-sm tracking-wider placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-6 py-2.5 text-sm font-medium border border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-6 py-2.5 bg-foreground text-background text-xs font-semibold tracking-[0.15em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              )}
            </div>
            {couponError && (
              <p className="mt-2 text-sm text-destructive">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="mt-2 text-sm text-emerald-600">{couponSuccess}</p>
            )}
          </div>

          <div className="h-px bg-border" />
          <PlaceOrder onPlaceOrder={handlePlaceOrder} />
        </div>

        {/* Order Summary */}
        <div>
          <OrderSummary
            items={orderItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            discount={discount}
            couponCode={appliedCoupon?.code ?? null}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
