'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { getUserOrder, requestRefund } from '@/lib/actions';
import { useCurrency } from '@/lib/context/currency-context';

interface OrderVariant {
  size: string | null;
  color: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: { name: string; thumbnail: string | null; price: number } | null;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total_price: number;
  shipping_address: Record<string, string>;
  payment_method: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  refund_status: string;
  order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  Processing: 'bg-amber-50 text-amber-700 border border-amber-200',
  Pending: 'bg-gray-50 text-gray-600 border border-gray-200',
  Cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

const TIMELINE_STEPS = [
  { key: 'Pending', label: 'Placed', icon: Clock },
  { key: 'Processing', label: 'Processing', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
] as const;

const STATUS_ORDER: Record<string, number> = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function AccountOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const id = params.id as string;

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refundModalOpen, setRefundModalOpen] = React.useState(false);
  const [refundReason, setRefundReason] = React.useState('');
  const [refundSubmitting, setRefundSubmitting] = React.useState(false);
  const [refundStatus, setRefundStatus] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    getUserOrder(id).then((o) => {
      if (!o) {
        router.replace('/account/orders');
        return;
      }
      const orderData = o as unknown as Order;
      setOrder(orderData);
      setRefundStatus(orderData.refund_status || 'none');
      setLoading(false);
    });
  }, [id, router]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const shipping = order.shipping_address || {};
  const shippingName = shipping.name || shipping.full_name || 'Unknown';
  const shippingPhone = shipping.phone || '';
  const addressLine = shipping.address_line1 || shipping.address || shipping.line1 || '';
  const city = shipping.city || '';
  const postalCode = shipping.postal_code || shipping.zip || '';

  const currentStep = STATUS_ORDER[order.status] ?? -1;
  const isCancelled = order.status === 'Cancelled';

  const subtotal = order.order_items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shippingFee = order.total_price > subtotal ? order.total_price - subtotal : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:p-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.text}
        </div>
      )}

      {/* Back button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Order #{order.order_number}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}
        >
          {order.status}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#C9A84C] transition-all duration-500"
              style={{ width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
            />
            {TIMELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const reached = currentStep >= i;
              return (
                <div key={step.key} className="relative flex flex-col items-center gap-2 z-10">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      reached
                        ? 'bg-[#C9A84C] border-[#C9A84C] text-white'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className={`text-xs font-medium ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isCancelled && (
        <div className="mb-10 flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="size-9 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="size-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
            <p className="text-xs text-muted-foreground">This order has been cancelled.</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">Items</h3>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {item.products?.thumbnail ? (
                <Image
                  src={item.products.thumbnail}
                  alt={item.products.name ?? ''}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="size-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-[10px] flex-shrink-0">
                  No img
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.products?.name ?? 'Product'}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                   <span className="text-xs text-gray-500">Item</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-foreground">
                   {item.quantity} x {formatPrice(item.price)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                   {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">Delivery</h3>
          <div className="space-y-2 text-sm">
            {addressLine && <p className="text-foreground">{addressLine}</p>}
            {(city || postalCode) && (
              <p className="text-foreground">
                {city}{city && postalCode ? ', ' : ''}{postalCode}
              </p>
            )}
            {shippingPhone && (
              <p className="text-muted-foreground mt-2">Phone: {shippingPhone}</p>
            )}
            {order.status === 'Shipped' && order.courier_name && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Courier</p>
                <p className="text-foreground font-medium">{order.courier_name}</p>
              </div>
            )}
            {order.status === 'Shipped' && order.tracking_number && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                  {order.tracking_number}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">Payment</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium text-foreground">{order.payment_method || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.payment_method?.toUpperCase() === 'COD' ? 'COD' : 'Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Section */}
      {order.status === 'Delivered' && refundStatus === 'none' && (
        <div className="mt-6 rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Request Refund</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Not satisfied with your order? You can request a refund.
              </p>
            </div>
            <button
              onClick={() => setRefundModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C9A84C] border border-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/5 transition-colors"
            >
              <RotateCcw className="size-4" />
              Request Refund
            </button>
          </div>
        </div>
      )}

      {refundStatus && refundStatus !== 'none' && (
        <div className="mt-6 rounded-lg border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
              <RotateCcw className="size-5 text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Refund {refundStatus.replace('refund_', '').replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {refundStatus === 'refund_requested' && 'Your refund request is being reviewed.'}
                {refundStatus === 'refund_approved' && 'Your refund has been approved. We will process it shortly.'}
                {refundStatus === 'refund_rejected' && 'Your refund request was rejected.'}
                {refundStatus === 'refund_processed' && 'Your refund has been processed.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRefundModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Request Refund</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please tell us why you want to return this order.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Reason *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none bg-card text-foreground"
                placeholder="Describe the reason for your refund request..."
              />
            </div>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refund Amount</span>
                <span className="font-bold text-foreground">{formatPrice(order.total_price)}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRefundModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!refundReason.trim()) {
                    setToast({ type: 'error', text: 'Please provide a reason' });
                    return;
                  }
                  setRefundSubmitting(true);
                  const result = await requestRefund(id, refundReason, order.total_price);
                  setRefundSubmitting(false);
                  if (result.success) {
                    setToast({ type: 'success', text: 'Refund request submitted' });
                    setRefundModalOpen(false);
                    setRefundStatus('refund_requested');
                  } else {
                    setToast({ type: 'error', text: result.error || 'Failed to submit request' });
                  }
                }}
                disabled={refundSubmitting}
                className="px-4 py-2 text-sm text-white font-medium bg-[#C9A84C] hover:bg-[#B8973D] rounded-lg transition-colors disabled:opacity-50"
              >
                {refundSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
