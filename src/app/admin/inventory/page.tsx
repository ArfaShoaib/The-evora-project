'use client';

import * as React from 'react';
import { Search, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getInventoryProducts,
  updateStock,
  type InventoryProduct,
} from '@/lib/admin-actions';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
  const [products, setProducts] = React.useState<InventoryProduct[]>([]);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);

  // Inline stock editing
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const data = await getInventoryProducts({ search, filter });
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [search, filter]);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const startEdit = (p: InventoryProduct) => {
    setEditingId(p.id);
    setEditValue(p.stock.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveStock = async (id: string) => {
    const newStock = parseInt(editValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      cancelEdit();
      return;
    }

    setSaving(true);
    try {
      await updateStock(id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
      cancelEdit();
    } catch {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveStock(id);
    if (e.key === 'Escape') cancelEdit();
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (stock <= LOW_STOCK_THRESHOLD) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + alert */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Inventory</h2>
        <p className="text-sm text-gray-500 mt-1">
          {outOfStockCount} out of stock, {lowStockCount} low stock
        </p>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="size-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            {lowStockCount} product{lowStockCount > 1 ? 's' : ''} with low stock need attention.
          </p>
        </div>
      )}

      {outOfStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="size-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            {outOfStockCount} product{outOfStockCount > 1 ? 's' : ''} out of stock.
          </p>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'low', label: 'Low Stock' },
            { key: 'out', label: 'Out of Stock' },
            { key: 'in', label: 'In Stock' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f.key
                  ? 'bg-[#C9A84C] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
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
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Inventory Value</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {p.sku} {p.categories?.name ? `· ${p.categories.name}` : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === p.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, p.id)}
                          onBlur={() => saveStock(p.id)}
                          className="w-20 px-2 py-1 text-center text-sm font-semibold border border-[#C9A84C] rounded focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="font-semibold hover:text-[#C9A84C] transition-colors cursor-pointer"
                          title="Click to edit stock"
                        >
                          {p.stock}
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStockBadge(p.stock)}>
                        {getStockLabel(p.stock)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      Rs. {(p.stock * p.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === p.id && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveStock(p.id)}
                            disabled={saving}
                            className="p-1.5 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="size-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center">
        Click any stock number to edit inline. Press Enter to save, Escape to cancel.
      </p>
    </div>
  );
}
