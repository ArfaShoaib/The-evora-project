'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminRefund, approveRefund, rejectRefund, markRefundProcessed, type RefundRow } from '@/lib/admin-actions';

const formatPrice = (n: number) => `PKR ${n.toLocaleString()}`;

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
  rejected: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
  processed: { color: 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30', label: 'Processed' },
};

export default function RefundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [refund, setRefund] = React.useState<RefundRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = React.useState<'approve' | 'reject' | null>(null);
  const [modalNotes, setModalNotes] = React.useState('');

  React.useEffect(() => {
    getAdminRefund(id).then((r) => {
      if (!r) {
        router.replace('/admin/refunds');
        return;
      }
      setRefund(r);
      setLoading(false);
    });
  }, [id, router]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleApprove = async () => {
    setActionLoading(true);
    const result = await approveRefund(id, modalNotes);
    setActionLoading(false);
    setModalOpen(null);
    setModalNotes('');
    if (result.success) {
      setToast({ type: 'success', text: 'Refund approved' });
      const updated = await getAdminRefund(id);
      if (updated) setRefund(updated);
    } else {
      setToast({ type: 'error', text: result.error || 'Failed to approve' });
    }
  };

  const handleReject = async () => {
    if (!modalNotes.trim()) {
      setToast({ type: 'error', text: 'Please add a rejection reason' });
      return;
    }
    setActionLoading(true);
    const result = await rejectRefund(id, modalNotes);
    setActionLoading(false);
    setModalOpen(null);
    setModalNotes('');
    if (result.success) {
      setToast({ type: 'success', text: 'Refund rejected' });
      const updated = await getAdminRefund(id);
      if (updated) setRefund(updated);
    } else {
      setToast({ type: 'error', text: result.error || 'Failed to reject' });
    }
  };

  const handleMarkProcessed = async () => {
    setActionLoading(true);
    const result = await markRefundProcessed(id);
    setActionLoading(false);
    if (result.success) {
      setToast({ type: 'success', text: 'Refund marked as processed' });
      const updated = await getAdminRefund(id);
      if (updated) setRefund(updated);
    } else {
      setToast({ type: 'error', text: result.error || 'Failed to mark as processed' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!refund) return null;

  const shipping = refund.order_shipping_address || {};
  const status = statusConfig[refund.status] || statusConfig.pending;

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/refunds"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-[#0A0A0A]">
              Refund #{refund.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Order #{refund.order_number || refund.order_id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <Badge className={`${status.color} border text-sm px-3 py-1`}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono">{refund.order_number || refund.order_id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Total</span>
                <span className="font-medium">{formatPrice(refund.order_total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Refund Amount</span>
                <span className="font-bold text-[#C9A84C]">{formatPrice(refund.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Status</span>
                <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                  {refund.order_status || 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-4">Customer</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{refund.customer_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-xs">{refund.customer_email || 'N/A'}</span>
              </div>
              {shipping.address_line1 || shipping.address ? (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs mb-1">Address</p>
                  <p>{shipping.address_line1 || shipping.address}</p>
                  {shipping.city && <p>{shipping.city}{shipping.postal_code ? `, ${shipping.postal_code}` : ''}</p>}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Refund Details */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-4">Refund Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Reason</span>
                <p className="mt-1">{refund.reason}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Requested</span>
                <p className="mt-1">
                  {new Date(refund.created_at).toLocaleDateString('en-PK', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {refund.admin_notes && (
                <div>
                  <span className="text-gray-500 text-xs">Admin Notes</span>
                  <p className="mt-1">{refund.admin_notes}</p>
                </div>
              )}
              {refund.rejection_reason && (
                <div>
                  <span className="text-gray-500 text-xs">Rejection Reason</span>
                  <p className="mt-1 text-red-600">{refund.rejection_reason}</p>
                </div>
              )}
              {refund.resolved_at && (
                <div>
                  <span className="text-gray-500 text-xs">Resolved</span>
                  <p className="mt-1">
                    {new Date(refund.resolved_at).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      {refund.status === 'pending' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-4">Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => { setModalOpen('approve'); setModalNotes(''); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="size-4" />
                Approve
              </button>
              <button
                onClick={() => { setModalOpen('reject'); setModalNotes(''); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="size-4" />
                Reject
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {refund.status === 'approved' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-4">Actions</h3>
            <button
              onClick={handleMarkProcessed}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-lg hover:bg-[#B8973D] transition-colors disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              {actionLoading ? 'Processing...' : 'Mark as Processed'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Mark as processed after manually completing the refund transfer (JazzCash/EasyPaisa/Bank).
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">
              {modalOpen === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2">
                {modalOpen === 'approve' ? 'Admin Notes (optional)' : 'Rejection Reason (required)'}
              </label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none"
                placeholder={modalOpen === 'approve' ? 'Add notes...' : 'Reason for rejection...'}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalOpen(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalOpen === 'approve' ? handleApprove : handleReject}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  modalOpen === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Saving...' : modalOpen === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
