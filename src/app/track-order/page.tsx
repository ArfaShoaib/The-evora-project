"use client";

import * as React from "react";
import Image from "next/image";
import { Package, CheckCircle, Clock, Truck, XCircle, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackOrderSchema, type TrackOrderInput } from "@/lib/validations";
import { trackOrder } from "@/lib/actions";
import { useCurrency } from "@/lib/context/currency-context";

const statusSteps = [
  { key: "Pending", label: "Order Placed", icon: Clock },
  { key: "Processing", label: "Processing", icon: Package },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle },
];

const statusOrder = ["Pending", "Processing", "Shipped", "Delivered"];

const statusLabels: Record<string, string> = {
  Pending: "Your order has been placed and is awaiting processing.",
  Processing: "Your order is being prepared and packed.",
  Shipped: "Your order is on its way to you.",
  Delivered: "Your order has been delivered successfully.",
  Cancelled: "This order has been cancelled.",
};

export default function TrackOrderPage() {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<Record<string, unknown> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackOrderInput>({
    resolver: zodResolver(trackOrderSchema),
  });

  const handleTrack = async (data: TrackOrderInput) => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await trackOrder(data.orderNumber.trim(), data.email.trim());
      if (!result) {
        setError("No order found with that number and email combination.");
      } else {
        setOrder(result as Record<string, unknown>);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = order?.status as string;
  const currentStepIndex = statusOrder.indexOf(currentStatus);
  const shipping = order?.shipping_address as Record<string, string> | undefined;
  const items = (order?.order_items as Array<{
    quantity: number;
    price: number;
    products?: { name: string; images?: string[] } | null;
  }>) || [];
  const trackingNumber = order?.tracking_number as string | null;
  const courierName = order?.courier_name as string | null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
      <h1 className="font-serif text-4xl font-bold text-foreground mb-4 text-center">
        Track Your Order
      </h1>
      <p className="text-muted-foreground mb-8 text-center">
        Enter your order number and email to check delivery status.
      </p>

      <form onSubmit={handleSubmit(handleTrack)} className="flex flex-col gap-4 max-w-md mx-auto">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Order Number
          </label>
          <input
            type="text"
            {...register("orderNumber")}
            placeholder="EV-000001"
            className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
          />
          {errors.orderNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.orderNumber.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-13 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "Tracking..." : "Track Order"}
        </button>
      </form>

      {error && (
        <div className="mt-8 p-4 border border-red-200 bg-red-50 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-10 border border-border p-6 sm:p-8">
          {/* Order Header */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Order</p>
              <p className="font-serif text-lg font-bold text-foreground">
                {order.order_number as string}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="font-serif text-lg font-bold text-foreground">
                {formatPrice(Number(order.total_price))}
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="flex items-center justify-between mb-4">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? "bg-gold text-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-2 ring-gold ring-offset-2" : ""}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wider uppercase text-center ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Description */}
          <p className="text-sm text-muted-foreground text-center mb-8">
            {statusLabels[currentStatus] || "Status unknown."}
          </p>

          {currentStatus === "Cancelled" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
              <XCircle className="size-4" />
              This order has been cancelled.
            </div>
          )}

          {/* Tracking Info */}
          {(trackingNumber || courierName) && (
            <div className="p-4 bg-muted/50 border border-border rounded-lg mb-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">Shipping Details</p>
              <div className="flex flex-col gap-1 text-sm">
                {courierName && <p><span className="text-muted-foreground">Courier:</span> {courierName}</p>}
                {trackingNumber && <p><span className="text-muted-foreground">Tracking #:</span> <span className="font-mono">{trackingNumber}</span></p>}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {shipping && (
            <div className="p-4 bg-muted/50 border border-border rounded-lg mb-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Shipping Address
              </p>
              <div className="text-sm text-foreground">
                <p>{shipping.address_line1}{shipping.address_line2 ? `, ${shipping.address_line2}` : ""}</p>
                <p>{shipping.city}, {shipping.postal_code}</p>
                {shipping.phone && <p className="text-muted-foreground mt-1">{shipping.phone}</p>}
              </div>
            </div>
          )}

          {/* Order Items */}
          {items.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">Items Ordered</p>
              <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative size-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.products?.images?.[0] ? (
                        <Image
                          src={item.products.images[0]}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center size-full text-muted-foreground">
                          <Package className="size-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.products?.name || "Product"}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Ordered on{" "}
            {new Date(order.created_at as string).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
