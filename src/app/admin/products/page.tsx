'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAdminProducts, deleteProduct, type AdminProduct } from '@/lib/admin-actions';

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const { products: data, total: t } = await getAdminProducts({
        search,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      if (!cancelled) {
        setProducts(data);
        setTotal(t);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [search, statusFilter, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteId);
      setDeleteId(null);
      setLoading(true);
      const { products: data, total: t } = await getAdminProducts({
        search,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setProducts(data);
      setTotal(t);
      setLoading(false);
    } catch {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Products</h2>
          <p className="text-sm text-gray-500">{total} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="size-10 rounded object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-[#0A0A0A]">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {p.categories?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const variations = p.variations as Record<string, string[]> | null;
                        if (!variations || Object.keys(variations).length === 0) {
                          return <span className="text-xs text-gray-400">No variations</span>;
                        }
                        const tags: string[] = [];
                        Object.entries(variations).forEach(([key, vals]) => {
                          if (vals && vals.length > 0) {
                            tags.push(`${key}: ${vals.length}`);
                          }
                        });
                        return tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      Rs. {p.price.toLocaleString()}
                      {p.sale_price && (
                        <span className="ml-1 text-xs text-gray-400 line-through">
                          Rs. {p.sale_price.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={p.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[p.status] ?? 'bg-gray-50 text-gray-600'}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2 text-gray-500 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-gray-50"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
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

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
