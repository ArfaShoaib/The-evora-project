'use client';

import * as React from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrency } from '@/lib/context/currency-context';
import type { User } from '@supabase/supabase-js';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  created_at: string;
  shipping_address: Record<string, string>;
  order_items: Array<{
    quantity: number;
    price: number;
    product_id: string | null;
    products?: { name: string; thumbnail: string | null } | null;
  }>;
}

const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Pending: Clock,
  Processing: Package,
  Shipped: Truck,
  Delivered: CheckCircle,
  Cancelled: XCircle,
};
const statusColors: Record<string, string> = {
  Delivered: 'text-emerald-500',
  Shipped: 'text-blue-500',
  Processing: 'text-amber-500',
  Pending: 'text-zinc-500',
  Cancelled: 'text-red-500',
};

export default function TrackOrderPage() {
  const supabase = createClient();
  const { formatPrice } = useCurrency();
  const [user, setUser] = React.useState<User | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    async function fetchOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(quantity, price, product_id, products(name, thumbnail))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const activeOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = orders.filter((o) => o.status === 'Delivered' || o.status === 'Cancelled');

  function getStepIndex(status: string) {
    return statusSteps.indexOf(status);
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        Track Your Orders
      </h2>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <Truck className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            You don&apos;t have any orders to track yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-11 px-6 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 hover:border-[#D4AF37] transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-4">
                Active Orders ({activeOrders.length})
              </h3>
              <div className="flex flex-col gap-4">
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    getStepIndex={getStepIndex}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-4">
                Past Orders ({pastOrders.length})
              </h3>
              <div className="flex flex-col gap-4">
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    getStepIndex={getStepIndex}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  isSelected,
  onSelect,
  getStepIndex,
}: {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
  getStepIndex: (status: string) => number;
}) {
  const { formatPrice } = useCurrency();
  const StatusIcon = statusIcons[order.status] ?? Clock;
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={onSelect}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${statusColors[order.status] ?? 'text-zinc-400'}`} />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Order #{order.order_number}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium ${statusColors[order.status] ?? 'text-zinc-500'}`}>
            {order.status}
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {formatPrice(order.total_price)}
          </span>
        </div>
      </button>

      {/* Expanded tracking */}
      {isSelected && (
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
          {/* Progress bar */}
          {!isCancelled && (
            <div className="py-6">
              <div className="flex items-center justify-between mb-2">
                {statusSteps.map((step, i) => {
                  const StepIcon = statusIcons[step] ?? Clock;
                  const isComplete = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                          isComplete
                            ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-400'
                        } ${isCurrent ? 'ring-2 ring-[#D4AF37]/30' : ''}`}
                      >
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <span
                        className={`mt-2 text-[10px] tracking-wider uppercase font-medium ${
                          isComplete ? 'text-[#D4AF37]' : 'text-zinc-400 dark:text-zinc-600'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Connecting line */}
              <div className="relative h-0.5 bg-zinc-100 dark:bg-zinc-800 mx-10 -mt-[52px] mb-6">
                <div
                  className="absolute h-full bg-[#D4AF37] transition-all"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="py-4 flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">This order has been cancelled.</span>
            </div>
          )}

          {/* Order items */}
          {order.order_items?.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                Items
              </p>
              {order.order_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.products?.name ?? 'Product'}
                    {item.quantity > 1 && (
                      <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                        x{item.quantity}
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-1">
                Shipping To
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {order.shipping_address.address_line1 ?? order.shipping_address.line1 ?? ''}
                {order.shipping_address.city && `, ${order.shipping_address.city}`}
                {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
