'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Truck, CheckCircle2, Package, Clock, XCircle, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminOrder, updateOrderWithTracking, type AdminOrder } from '@/lib/admin-actions';

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-gray-50 text-gray-700 border-gray-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

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

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = React.useState<AdminOrder | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [courierName, setCourierName] = React.useState('');
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    getAdminOrder(id).then((o) => {
      if (o) {
        setOrder(o);
        setStatus(o.status);
        setCourierName(o.courier_name || '');
        setTrackingNumber(o.tracking_number || '');
      }
      setLoading(false);
    });
  }, [id]);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async () => {
    if (!order) return;
    const statusChanged = status !== order.status;
    const trackingChanged =
      courierName !== (order.courier_name || '') ||
      trackingNumber !== (order.tracking_number || '');
    if (!statusChanged && !trackingChanged) return;

    setSaving(true);
    try {
      await updateOrderWithTracking(order.id, {
        status: status as typeof ALL_STATUSES[number],
        courier_name: courierName || null,
        tracking_number: trackingNumber || null,
      });
      setOrder({
        ...order,
        status: status as typeof order.status,
        courier_name: courierName || null,
        tracking_number: trackingNumber || null,
      });
      setToast({ type: 'success', text: 'Order updated successfully.' });
    } catch {
      setStatus(order.status);
      setCourierName(order.courier_name || '');
      setTrackingNumber(order.tracking_number || '');
      setToast({ type: 'error', text: 'Failed to update order.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link href="/admin/orders" className="text-sm text-[#C9A84C] hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const shipping = order.shipping_address as Record<string, string>;
  const shippingName = shipping?.name || shipping?.full_name || order.profiles?.name || 'Unknown';
  const shippingEmail = shipping?.email || order.profiles?.email || '';
  const shippingPhone = shipping?.phone || (order.profiles as Record<string, string>)?.phone || '';
  const addressLine = shipping?.address_line1 || shipping?.address || shipping?.line1 || '';
  const city = shipping?.city || '';
  const postalCode = shipping?.postal_code || shipping?.zip || shipping?.zipcode || '';
  const country = shipping?.country || '';

  const currentStep = STATUS_ORDER[order.status] ?? -1;
  const isCancelled = order.status === 'Cancelled';

  // Compute subtotal from items
  const subtotal = order.order_items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shippingFee = order.total_price > subtotal ? order.total_price - subtotal : 0;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice, #invoice * { visibility: visible !important; }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background: white;
          }
          #invoice .no-print { display: none !important; }
        }
      `}</style>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}

      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A0A0A] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">
            Order #{order.order_number}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={statusColors[order.status] ?? ''}>
            {order.status}
          </Badge>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#b8953d] transition-colors"
          >
            <Printer className="size-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Timeline stepper */}
      {!isCancelled && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between relative">
              {/* Background line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
              {/* Active line */}
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
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className={`text-xs font-medium ${reached ? 'text-[#0A0A0A]' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {isCancelled && (
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
              <p className="text-xs text-gray-500">This order has been cancelled.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{shippingName}</p>
            {shippingEmail && <p className="text-gray-500">{shippingEmail}</p>}
            {shippingPhone && <p className="text-gray-500">{shippingPhone}</p>}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-gray-500">
            {addressLine && <p>{addressLine}</p>}
            {(city || postalCode) && (
              <p>
                {city}{city && postalCode ? ', ' : ''}{postalCode}
              </p>
            )}
            {country && <p>{country}</p>}
            {!addressLine && !city && <p className="text-gray-400">No address provided</p>}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium">{order.payment_method || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Paid
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking info (visible when Shipped) */}
      {status === 'Shipped' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="size-4 text-[#C9A84C]" />
              Tracking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wider uppercase">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                  placeholder="e.g. FedEx, DHL, TCS"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wider uppercase">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                  placeholder="e.g. 1Z999AA10123456784"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show saved tracking when not editing (status is Shipped but fields are from DB) */}
      {status === 'Shipped' && order.tracking_number && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="size-4 text-[#C9A84C]" />
              <span className="text-gray-500">Tracking:</span>
              <span className="font-medium">{order.courier_name || 'N/A'}</span>
              <span className="text-gray-400">—</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order.tracking_number}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                  status === s
                    ? s === 'Cancelled'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-[#C9A84C] text-white border-[#C9A84C]'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0A0A0A] text-white text-sm font-semibold rounded-lg hover:bg-[#0A0A0A]/90 transition-colors disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </CardContent>
      </Card>

      {/* Order items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items?.map((item, i) => (
                <TableRow key={item.id || i}>
                  <TableCell>
                    {item.products?.thumbnail ? (
                      <Image
                        src={item.products.thumbnail}
                        alt={item.products.name ?? ''}
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{item.products?.name ?? 'Product'}</p>
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                  <TableCell className="text-right text-sm">Rs. {item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `Rs. ${shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>Rs. {order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── PRINTABLE INVOICE ───────────────────────────────────── */}
      <div id="invoice" className="hidden print:block">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #C9A84C', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '4px', color: '#0A0A0A', margin: 0 }}>EVORA</h1>
            <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#888', margin: '4px 0 0' }}>LUXURY FASHION</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#C9A84C', margin: 0 }}>Order Invoice</h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
              Order #{order.order_number}
            </p>
          </div>
        </div>

        {/* Order Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '12px', color: '#333' }}>
          <div>
            <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p style={{ marginTop: '4px' }}><strong>Payment Method:</strong> {order.payment_method || 'N/A'}</p>
            <p style={{ marginTop: '4px' }}>
              <strong>Payment Status:</strong>{' '}
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              }}>
                {order.payment_method?.toUpperCase() === 'COD' ? 'COD' : 'Paid'}
              </span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>Status:</strong> {order.status}</p>
            {order.courier_name && (
              <p style={{ marginTop: '4px' }}><strong>Courier:</strong> {order.courier_name}</p>
            )}
            {order.tracking_number && (
              <p style={{ marginTop: '4px' }}><strong>Tracking #:</strong> {order.tracking_number}</p>
            )}
          </div>
        </div>

        {/* Customer & Delivery */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
              Customer
            </h3>
            <p style={{ fontSize: '13px', fontWeight: 600 }}>{shippingName}</p>
            {shippingEmail && <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{shippingEmail}</p>}
            {shippingPhone && <p style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{shippingPhone}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
              Delivery Address
            </h3>
            {addressLine && <p style={{ fontSize: '12px', color: '#333' }}>{addressLine}</p>}
            {(city || postalCode) && (
              <p style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>
                {city}{city && postalCode ? ', ' : ''}{postalCode}
              </p>
            )}
            {country && <p style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{country}</p>}
            {!addressLine && !city && <p style={{ fontSize: '12px', color: '#999' }}>No address provided</p>}
          </div>
        </div>

        {/* COD Notice */}
        {order.payment_method?.toUpperCase() === 'COD' && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '30px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#92400e',
          }}>
            CASH ON DELIVERY — Collect PKR {order.total_price.toFixed(0)} at delivery
          </div>
        )}

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #C9A84C' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>PRODUCT</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>SIZE</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>COLOR</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>PRICE</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', color: '#666' }}>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, i) => (
              <tr key={item.id || i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 8px', fontWeight: 500 }}>{item.products?.name ?? 'Product'}</td>
                <td style={{ padding: '10px 8px', color: '#555' }}>—</td>
                <td style={{ padding: '10px 8px', color: '#555' }}>—</td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>Rs. {item.price.toLocaleString()}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#555' }}>
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', color: '#555' }}>
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `Rs. ${shippingFee.toLocaleString()}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 6px', fontSize: '14px', fontWeight: 700, borderTop: '2px solid #0A0A0A', marginTop: '4px' }}>
              <span>Total</span>
              <span>Rs. {order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#333', fontWeight: 500 }}>Thank you for shopping with EVORA</p>
          <p style={{ fontSize: '10px', color: '#aaa', marginTop: '6px', letterSpacing: '1px' }}>www.evora.com</p>
        </div>
      </div>
    </div>
  );
}
