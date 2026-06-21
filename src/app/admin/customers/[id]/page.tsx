'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminCustomer } from '@/lib/admin-actions';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = React.useState<{ id: string; name: string; email: string; phone: string; address: string; joined: string; orders: Array<{ id: string; order_number: string; total_price: number; status: string; created_at: string }> } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data = await getAdminCustomer(id);
        if (!cancelled) setCustomer(data as never);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}</div>;
  if (!customer) return <p className="text-sm text-gray-500">Customer not found.</p>;

  const totalSpent = customer.orders.reduce((sum: number, o: { total_price: number }) => sum + (o.total_price || 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A0A0A] transition-colors">
        <ArrowLeft className="size-4" />Back to Customers
      </Link>

      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-2xl font-bold text-[#C9A84C]">
          {customer.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">{customer.name}</h2>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-gray-400">Email:</span> {customer.email}</p>
            <p><span className="text-gray-400">Phone:</span> {customer.phone || '—'}</p>
            <p><span className="text-gray-400">Address:</span> {customer.address || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-gray-400">Total Orders:</span> {customer.orders.length}</p>
            <p><span className="text-gray-400">Total Spent:</span> Rs. {totalSpent.toLocaleString()}</p>
            <p><span className="text-gray-400">Joined:</span> {new Date(customer.joined).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Order History</CardTitle></CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((o: { id: string; order_number: string; total_price: number; status: string; created_at: string }) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_number}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">Rs. {(o.total_price || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}