'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, Search, X, RotateCcw, Clock, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminRefunds, getRefundStats, type RefundRow } from '@/lib/admin-actions';

const formatPrice = (n: number) => `PKR ${n.toLocaleString()}`;

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  processed: 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30',
};

const statusFilters = ['all', 'pending', 'approved', 'rejected', 'processed'];

export default function RefundsPage() {
  const [refunds, setRefunds] = React.useState<RefundRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stats, setStats] = React.useState({ total: 0, pending: 0, approvedThisMonth: 0, totalRefunded: 0 });

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const [{ refunds: data, total: t }, s] = await Promise.all([
        getAdminRefunds({ status: filter, page, pageSize: PAGE_SIZE }),
        getRefundStats(),
      ]);
      if (!cancelled) {
        setRefunds(data);
        setTotal(t);
        setStats(s);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [filter, page]);

  const filteredRefunds = React.useMemo(() => {
    if (!searchQuery.trim()) return refunds;
    const q = searchQuery.toLowerCase();
    return refunds.filter((r) => {
      const orderId = (r.order_number || '').toLowerCase();
      const customerName = (r.customer_name || '').toLowerCase();
      return orderId.includes(q) || customerName.includes(q);
    });
  }, [refunds, searchQuery]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statCards = [
    { label: 'Total Requests', value: stats.total, icon: RotateCcw, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved This Month', value: stats.approvedThisMonth, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Refunded', value: formatPrice(stats.totalRefunded), icon: DollarSign, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/5' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Refunds</h2>
        <p className="text-sm text-gray-500 mt-1">{total} refund requests</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold text-[#0A0A0A] mt-1">{s.value}</p>
                  </div>
                  <div className={`size-10 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <Icon className={`size-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Status filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === s
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="size-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No refund requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRefunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">
                    {r.order_number || r.order_id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{r.customer_name || 'Unknown'}</TableCell>
                  <TableCell className="font-medium">{formatPrice(r.amount)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-gray-500 text-sm">
                    {r.reason}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[r.status] || ''}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/refunds/${r.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C9A84C] hover:bg-[#C9A84C]/5 rounded-lg transition-colors"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
