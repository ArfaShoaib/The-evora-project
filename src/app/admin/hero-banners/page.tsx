'use client';

import * as React from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Images } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageInput } from '@/components/admin/ImageInput';
import {
  getAdminHeroBanners,
  getAdminCollections,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  type HeroBannerRow,
  type CollectionRow,
} from '@/lib/admin-actions';

export default function HeroBannersPage() {
  const [banners, setBanners] = React.useState<HeroBannerRow[]>([]);
  const [collections, setCollections] = React.useState<CollectionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [form, setForm] = React.useState({
    image_url: '',
    heading: '',
    subheading: '',
    cta_text: 'Shop Now',
    collection_id: '',
    display_order: '0',
    is_active: true,
  });

  React.useEffect(() => {
    Promise.all([getAdminHeroBanners(), getAdminCollections()]).then(([b, c]) => {
      React.startTransition(() => {
        setBanners(b);
        setCollections(c);
        setLoading(false);
      });
    });
  }, []);

  const fetchBanners = React.useCallback(async () => {
    const data = await getAdminHeroBanners();
    React.startTransition(() => {
      setBanners(data);
    });
  }, []);

  const resetForm = () => {
    setForm({ image_url: '', heading: '', subheading: '', cta_text: 'Shop Now', collection_id: '', display_order: '0', is_active: true });
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (b: HeroBannerRow) => {
    setForm({
      image_url: b.image_url,
      heading: b.heading,
      subheading: b.subheading || '',
      cta_text: b.cta_text,
      collection_id: b.collection_id,
      display_order: String(b.display_order),
      is_active: b.is_active,
    });
    setEditId(b.id);
    setShowForm(true);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.image_url.trim()) e.image_url = 'Image is required';
    if (!form.heading.trim()) e.heading = 'Heading is required';
    if (!form.collection_id) e.collection_id = 'Collection is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        image_url: form.image_url.trim(),
        heading: form.heading.trim(),
        subheading: form.subheading.trim() || undefined,
        cta_text: form.cta_text.trim() || 'Shop Now',
        collection_id: form.collection_id,
        display_order: parseInt(form.display_order) || 0,
        is_active: form.is_active,
      };

      if (editId) {
        await updateHeroBanner(editId, payload);
      } else {
        await createHeroBanner(payload);
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHeroBanner(deleteId);
      setDeleteId(null);
      fetchBanners();
    } catch {
      // keep modal open
    }
  };

  const getCollectionName = (id: string) => {
    return collections.find((c) => c.id === id)?.name || '—';
  };

  const inputClass =
    'px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Hero Banners</h2>
          <p className="text-sm text-gray-500 mt-1">{banners.length} banners</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ image_url: '', heading: '', subheading: '', cta_text: 'Shop Now', collection_id: '', display_order: '0', is_active: true });
            setErrors({});
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {editId ? 'Edit Banner' : 'New Banner'}
              </h3>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageInput
                  label="Banner Image"
                  value={form.image_url}
                  onChange={(v) => setForm({ ...form, image_url: v })}
                  bucket="banners"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Heading *
                  </label>
                  <input
                    type="text"
                    value={form.heading}
                    onChange={(e) => setForm({ ...form, heading: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder="e.g. Timeless Elegance"
                  />
                  {errors.heading && <p className="text-xs text-red-500 mt-1">{errors.heading}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Subheading
                  </label>
                  <input
                    type="text"
                    value={form.subheading}
                    onChange={(e) => setForm({ ...form, subheading: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder="Optional tagline"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className={inputClass + ' w-full'}
                    placeholder="Shop Now"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Collection *
                  </label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => setForm({ ...form, collection_id: e.target.value })}
                    className={inputClass + ' w-full'}
                  >
                    <option value="">Select collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                  {errors.collection_id && <p className="text-xs text-red-500 mt-1">{errors.collection_id}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className={inputClass + ' w-full'}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label htmlFor="is_active" className="text-sm text-gray-600">Active (visible on storefront)</label>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Heading</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Images className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No hero banners yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first banner above</p>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="size-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                        <Image src={b.image_url} alt={b.heading} fill unoptimized className="object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[#0A0A0A]">{b.heading}</p>
                        {b.subheading && <p className="text-xs text-gray-400 mt-0.5">{b.subheading}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{getCollectionName(b.collection_id)}</TableCell>
                    <TableCell className="text-center text-sm text-gray-500">{b.display_order}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          b.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(b.id)}
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
        </CardContent>
      </Card>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Hero Banner</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
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
