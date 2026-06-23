'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type CategoryWithParent,
} from '@/lib/admin-actions';

const VARIATION_FIELD_OPTIONS = ['Size', 'Color', 'Material', 'Volume (ml)', 'Scent Family', 'Strap Material'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryWithParent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Subcategory state
  const [expandedParent, setExpandedParent] = React.useState<string | null>(null);
  const [showSubForm, setShowSubForm] = React.useState(false);
  const [editSubId, setEditSubId] = React.useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({ name: '', slug: '', description: '' });
  const [subForm, setSubForm] = React.useState({ name: '', slug: '', description: '', variation_fields: [] as string[] });

  React.useEffect(() => {
    getAdminCategories().then((data) => {
      React.startTransition(() => {
        setCategories(data);
        setLoading(false);
      });
    });
  }, []);

  const fetchCategories = React.useCallback(async () => {
    const data = await getAdminCategories();
    React.startTransition(() => {
      setCategories(data);
    });
  }, []);

  // Group: parent categories + their subcategories
  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubs = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '' });
    setEditId(null);
    setShowForm(false);
    setErrors({});
  };

  const resetSubForm = () => {
    setSubForm({ name: '', slug: '', description: '', variation_fields: [] });
    setEditSubId(null);
    setShowSubForm(false);
    setErrors({});
  };

  const handleEdit = (cat: CategoryWithParent) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setEditId(cat.id);
    setShowForm(true);
    setErrors({});
  };

  const handleEditSub = (sub: CategoryWithParent) => {
    setSubForm({
      name: sub.name,
      slug: sub.slug,
      description: sub.description || '',
      variation_fields: (sub.variation_fields as string[]) || [],
    });
    setEditSubId(sub.id);
    setShowSubForm(true);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    const slugExists = categories.some(
      (c) => c.slug === form.slug && c.id !== editId
    );
    if (slugExists) e.slug = 'Slug already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSub = (): boolean => {
    const e: Record<string, string> = {};
    if (!subForm.name.trim()) e.subName = 'Name is required';
    if (!subForm.slug.trim()) e.subSlug = 'Slug is required';
    const slugExists = categories.some(
      (c) => c.slug === subForm.slug && c.id !== editSubId
    );
    if (slugExists) e.subSlug = 'Slug already exists';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
      } else {
        await createCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSub() || !expandedParent) return;

    setSaving(true);
    try {
      if (editSubId) {
        await updateSubcategory(editSubId, {
          name: subForm.name.trim(),
          slug: subForm.slug.trim(),
          description: subForm.description.trim() || undefined,
          variation_fields: subForm.variation_fields.length > 0 ? subForm.variation_fields : undefined,
        });
      } else {
        await createSubcategory({
          name: subForm.name.trim(),
          slug: subForm.slug.trim(),
          parent_id: expandedParent,
          description: subForm.description.trim() || undefined,
          variation_fields: subForm.variation_fields.length > 0 ? subForm.variation_fields : undefined,
        });
      }
      resetSubForm();
      fetchCategories();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      setDeleteId(null);
      fetchCategories();
    } catch {
      // keep modal open
    }
  };

  const handleDeleteSub = async () => {
    if (!deleteSubId) return;
    try {
      await deleteSubcategory(deleteSubId);
      setDeleteSubId(null);
      fetchCategories();
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
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">{parentCategories.length} categories, {categories.length - parentCategories.length} subcategories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ name: '', slug: '', description: '' });
            setErrors({});
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      {/* Parent Category Form */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {editId ? 'Edit Category' : 'New Category'}
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
                        name: e.target.value,
                        slug: editId ? form.slug : slugify(e.target.value),
                        description: form.description,
                      })
                    }
                    className={inputClass + ' w-full'}
                    placeholder="e.g. Dresses"
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
                    placeholder="dresses"
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

      {/* Categories with Subcategories */}
      <Card>
        <CardContent className="p-0">
          {parentCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No categories yet. Create your first one above.
            </div>
          ) : (
            parentCategories.map((parent) => {
              const subs = getSubs(parent.id);
              const isExpanded = expandedParent === parent.id;
              return (
                <div key={parent.id} className="border-b border-gray-100 last:border-b-0">
                  {/* Parent row */}
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedParent(null);
                            setShowSubForm(false);
                            setEditSubId(null);
                          } else {
                            setExpandedParent(parent.id);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{parent.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{parent.slug}</p>
                      </div>
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {subs.length} subs
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(parent)}
                        className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(parent.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: subcategories */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {/* Add subcategory button */}
                      <div className="px-6 py-3 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 tracking-wider uppercase">Subcategories</p>
                        <button
                          onClick={() => {
                            setShowSubForm(true);
                            setEditSubId(null);
                            setSubForm({ name: '', slug: '', description: '', variation_fields: [] });
                            setErrors({});
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#C9A84C] text-white rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
                        >
                          <Plus className="size-3" />
                          Add Subcategory
                        </button>
                      </div>

                      {/* Subcategory form */}
                      {showSubForm && (
                        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 p-4 space-y-3">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h4 className="text-xs font-semibold text-gray-700 tracking-wider uppercase">
                              {editSubId ? 'Edit Subcategory' : 'New Subcategory'}
                            </h4>
                            <button onClick={resetSubForm} className="p-1 text-gray-400 hover:text-gray-600">
                              <X className="size-3" />
                            </button>
                          </div>
                          <form onSubmit={handleSubSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                                <input
                                  type="text"
                                  value={subForm.name}
                                  onChange={(e) =>
                                    setSubForm({
                                      ...subForm,
                                      name: e.target.value,
                                      slug: editSubId ? subForm.slug : slugify(e.target.value),
                                    })
                                  }
                                  className={inputClass + ' w-full'}
                                  placeholder="e.g. Western Wear"
                                />
                                {errors.subName && <p className="text-xs text-red-500 mt-1">{errors.subName}</p>}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                                <input
                                  type="text"
                                  value={subForm.slug}
                                  onChange={(e) => setSubForm({ ...subForm, slug: e.target.value })}
                                  className={inputClass + ' w-full font-mono'}
                                  placeholder="western-wear"
                                />
                                {errors.subSlug && <p className="text-xs text-red-500 mt-1">{errors.subSlug}</p>}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <input
                                type="text"
                                value={subForm.description}
                                onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                                className={inputClass + ' w-full'}
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1.5">Variation Fields</label>
                              <div className="flex flex-wrap gap-2">
                                {VARIATION_FIELD_OPTIONS.map((field) => {
                                  const isSelected = subForm.variation_fields.includes(field);
                                  return (
                                    <button
                                      key={field}
                                      type="button"
                                      onClick={() => {
                                        setSubForm({
                                          ...subForm,
                                          variation_fields: isSelected
                                            ? subForm.variation_fields.filter((f) => f !== field)
                                            : [...subForm.variation_fields, field],
                                        });
                                      }}
                                      className={`px-3 py-1 text-xs font-medium border rounded-md transition-all ${
                                        isSelected
                                          ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#0A0A0A]'
                                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                      }`}
                                    >
                                      {field}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-[#C9A84C] text-white text-xs font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : editSubId ? 'Update' : 'Create'}
                              </button>
                              <button
                                type="button"
                                onClick={resetSubForm}
                                className="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Subcategory list */}
                      {subs.length === 0 && !showSubForm ? (
                        <p className="px-6 pb-4 text-xs text-gray-400 italic">No subcategories yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Slug</TableHead>
                              <TableHead>Variation Fields</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subs.map((sub) => (
                              <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.name}</TableCell>
                                <TableCell className="text-gray-400 font-mono text-sm">{sub.slug}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {((sub.variation_fields as string[]) || []).map((f) => (
                                      <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {f}
                                      </span>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditSub(sub)}
                                      className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors"
                                    >
                                      <Pencil className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteSubId(sub.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Delete Parent Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Category</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? All subcategories in this category will also be deleted.
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

      {/* Delete Subcategory Modal */}
      {deleteSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">Delete Subcategory</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure? Products using this subcategory will become uncategorized.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteSubId(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSub}
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
