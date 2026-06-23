'use client';

import * as React from 'react';
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponActive,
  deleteCoupon,
  type CouponRow,
} from '@/lib/admin-actions';

export default function DiscountsPage() {
  const [coupons, setCoupons] = React.useState<CouponRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [toast, setToast] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '',
    usage_limit: '',
    expires_at: '',
    is_active: true,
  });

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      const data = await getCoupons();
      if (!cancelled) {
        setCoupons(data);
        setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const resetForm = () => {
    setForm({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      usage_limit: '',
      expires_at: '',
      is_active: true,
    });
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (c: CouponRow) => {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value.toString(),
      min_order_value: c.min_order_value?.toString() || '',
      usage_limit: c.usage_limit?.toString() || '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      is_active: c.is_active,
    });
    setEditId(c.id);
    setShowForm(true);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = 'Code is required';
    if (!form.discount_value || Number(form.discount_value) <= 0) e.discount_value = 'Valid value required';
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) e.discount_value = 'Max 100%';
    const codeExists = coupons.some(
      (c) => c.code === form.code.toUpperCase() && c.id !== editId
    );
    if (codeExists) e.code = 'Code already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      };

      if (editId) {
        await updateCoupon(editId, payload);
        setToast('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        setToast('Coupon created successfully');
      }
      resetForm();
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleCouponActive(id, !current);
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCoupon(deleteId);
    setDeleteId(null);
    setToast('Coupon deleted');
    const data = await getCoupons();
    setCoupons(data);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const inputClass =
    'px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-lg">
          <Check className="size-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Discounts</h2>
          <p className="text-sm text-gray-500 mt-1">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({
              code: '',
              discount_type: 'percentage',
              discount_value: '',
              min_order_value: '',
              usage_limit: '',
              expires_at: '',
              is_active: true,
            });
            setErrors({});
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="size-4" />
          Create Discount
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {editId ? 'Edit Coupon' : 'New Coupon'}
              </h3>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className={inputClass + ' w-full font-mono'}
                    placeholder="e.g. SUMMER25"
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Type
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className={inputClass + ' w-full'}
                  >
                    <option value="percentage">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={form.discount_type === 'percentage' ? 100 : undefined}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder={form.discount_type === 'percentage' ? 'e.g. 25' : 'e.g. 50'}
                  />
                  {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Min Order Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className={inputClass + ' w-full'}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.is_active ? 'bg-[#C9A84C]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                        form.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <label className="text-xs font-medium text-gray-600 tracking-wider uppercase">
                    {form.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>
              {errors.submit && (
                <p className="text-sm text-red-500">{errors.submit}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    No coupons yet. Create your first one above.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((c) => (
                  <TableRow
                    key={c.id}
                    className={isExpired(c.expires_at) ? 'opacity-60' : ''}
                  >
                    <TableCell className="font-mono font-medium">{c.code}</TableCell>
                    <TableCell className="capitalize text-sm">{c.discount_type}</TableCell>
                    <TableCell className="text-sm">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${c.discount_value.toLocaleString()}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.min_order_value ? `Rs. ${c.min_order_value.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {c.usage_limit
                        ? `${c.used_count} / ${c.usage_limit}`
                        : `${c.used_count} / Unlimited`}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {isExpired(c.expires_at) ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Expired
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            c.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                          }
                        >
                          {c.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(c.id, c.is_active)}
                          className="text-gray-400 hover:text-[#C9A84C] transition-colors"
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {c.is_active ? (
                            <ToggleRight className="size-5 text-[#C9A84C]" />
                          ) : (
                            <ToggleLeft className="size-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Coupon</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? This coupon will no longer be usable.
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
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
