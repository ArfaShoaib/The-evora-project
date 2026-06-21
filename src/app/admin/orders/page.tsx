'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminOrders, type AdminOrder } from '@/lib/admin-actions';

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-gray-50 text-gray-700 border-gray-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const statusFilters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const { orders: data, total: t } = await getAdminOrders({
        status: filter,
        page,
        pageSize: PAGE_SIZE,
      });
      if (!cancelled) {
        setOrders(data);
        setTotal(t);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [filter, page]);

  // Client-side search filter
  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      const orderId = o.order_number.toLowerCase();
      const customerName = (o.profiles?.name || '').toLowerCase();
      return orderId.includes(q) || customerName.includes(q);
    });
  }, [orders, searchQuery]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Orders</h2>
        <p className="text-sm text-gray-500 mt-1">{total} orders total</p>
      </div>

      {/* Search + Status filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search bar */}
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

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === s
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    {searchQuery ? 'No orders match your search.' : 'No orders found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-sm">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="text-sm">
                      {o.profiles?.name ?? 'Unknown'}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {o.order_items?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      Rs. {o.total_price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[o.status] ?? ''}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-400">
                      {new Date(o.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors inline-flex"
                      >
                        <Eye className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
