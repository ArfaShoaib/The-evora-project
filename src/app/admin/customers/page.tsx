'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminCustomers } from '@/lib/admin-actions';

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string; email: string; phone: string; orders_count: number; total_spent: number; joined: string; last_order: { id: string; total_amount: number; status: string; created_at: string } | null }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data = await getAdminCustomers();
        if (!cancelled) setCustomers(data as never);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total customers</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No customers found</p>
          <p className="text-xs text-gray-400 mt-1">Customers will appear here once users register</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-sm font-semibold text-[#C9A84C]">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{c.orders_count}</TableCell>
                    <TableCell className="text-right">Rs. {c.total_spent.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-gray-400">{new Date(c.joined).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/customers/${c.id}`} className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors inline-flex">
                        <Eye className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}