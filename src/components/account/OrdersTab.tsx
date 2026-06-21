"use client";

import * as React from "react";
import Link from "next/link";
import { getUserOrders } from "@/lib/actions";
import { useCurrency } from "@/lib/context/currency-context";

interface OrderItem {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_price: number;
  order_items: Array<{ quantity: number }>;
}

const statusColors: Record<string, string> = {
  Delivered: "text-emerald-500",
  Shipped: "text-blue-500",
  Processing: "text-amber-500",
  Pending: "text-muted-foreground",
  Cancelled: "text-red-500",
};

export function OrdersTab() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getUserOrders().then((data) => {
      setOrders(data as OrderItem[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
        Order History
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        View and manage your past orders.
      </p>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-11 px-6 border border-border text-xs font-semibold tracking-wider uppercase text-foreground hover:border-gold transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {order.order_number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {order.order_items?.length || 0}{" "}
                  {(order.order_items?.length || 0) === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-medium ${statusColors[order.status] || "text-muted-foreground"}`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatPrice(order.total_price)}
                </span>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="px-4 py-2 text-xs font-semibold tracking-wider uppercase border border-border text-foreground hover:border-gold transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
