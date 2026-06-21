'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageInput } from '@/components/admin/ImageInput';
import {
  getAdminCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  type CollectionRow,
} from '@/lib/admin-actions';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CollectionsPage() {
  const [collections, setCollections] = React.useState<CollectionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [form, setForm] = React.useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    sort_order: '0',
    is_active: true,
  });

  React.useEffect(() => {
    getAdminCollections().then((data) => {
      React.startTransition(() => {
        setCollections(data);
        setLoading(false);
      });
    });
  }, []);

  const fetchCollections = React.useCallback(async () => {
    const data = await getAdminCollections();
    React.startTransition(() => {
      setCollections(data);
    });
  }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (col: CollectionRow) => {
    setForm({
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      image_url: col.image_url || '',
      sort_order: String(col.sort_order),
      is_active: col.is_active,
    });
    setEditId(col.id);
    setShowForm(true);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    const slugExists = collections.some(
      (c) => c.slug === form.slug && c.id !== editId
    );
    if (slugExists) e.slug = 'Slug already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        image_url: form.image_url.trim() || undefined,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (editId) {
        await updateCollection(editId, payload);
      } else {
        await createCollection(payload);
      }
      resetForm();
      fetchCollections();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCollection(deleteId);
      setDeleteId(null);
      fetchCollections();
    } catch {
      // keep modal open
    }
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
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Collections</h2>
          <p className="text-sm text-gray-500 mt-1">{collections.length} collections</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });
            setErrors({});
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Collection
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {editId ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: editId ? form.slug : slugify(e.target.value),
                      })
                    }
                    className={inputClass + ' w-full'}
                    placeholder="e.g. Summer Edit"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={inputClass + ' w-full font-mono'}
                    placeholder="summer-edit"
                  />
                  {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass + ' w-full'}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageInput
                  label="Image URL"
                  value={form.image_url}
                  onChange={(v) => setForm({ ...form, image_url: v })}
                  bucket="product-images"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
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
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No collections yet. Create your first one above.
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((col) => (
                  <TableRow key={col.id}>
                    <TableCell>
                      <GripVertical className="size-4 text-gray-300" />
                    </TableCell>
                    <TableCell className="font-medium">{col.name}</TableCell>
                    <TableCell className="text-gray-400 font-mono text-sm">{col.slug}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {col.description || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{col.sort_order}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          col.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {col.is_active ? 'Active' : 'Draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(col)}
                          className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(col.id)}
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
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Collection</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? Products in this collection will become unlinked. This action cannot be undone.
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
