'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { createProduct, uploadProductImage, getAdminCollections, getAdminCategories, type CollectionRow } from '@/lib/admin-actions';
import { CategorySubcategoryVariations, COLOR_HEX_MAP, type VariationsData } from '@/components/admin/CategorySubcategoryVariations';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [collections, setCollections] = React.useState<CollectionRow[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [images, setImages] = React.useState<string[]>([]);
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [catCategory, setCatCategory] = React.useState('');
  const [catSubcategory, setCatSubcategory] = React.useState('');
  const [catVariations, setCatVariations] = React.useState<VariationsData>({});

  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    sku: '',
    category_id: '',
    collection_id: '',
    status: 'draft',
    is_new: false,
    is_best_seller: false,
    is_trending: false,
    collection: '',
  });

  const [categories, setCategories] = React.useState<Array<{ id: string; name: string; parent_name?: string | null }>>([]);

  React.useEffect(() => {
    getAdminCollections().then(setCollections);
    getAdminCategories().then(setCategories);
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.stock || Number(form.stock) < 0) e.stock = 'Stock is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const variations = Object.keys(catVariations).length > 0 ? catVariations : null;

      // Derive sizes/colors from variations (source of truth)
      const sizes = catVariations.size || [];
      const colorNames = catVariations.color || [];
      const colorHexOverrides = (catVariations.color_hex || {}) as Record<string, string>;
      const colors = colorNames.map((name) => ({
        name,
        hex: colorHexOverrides[name] || COLOR_HEX_MAP[name] || '#808080',
      }));

      // Resolve category_id from subcategory name
      let resolvedCategoryId = form.category_id || null;
      if (!resolvedCategoryId && catCategory && catSubcategory) {
        const matched = categories.find(
          (c) => c.name === catSubcategory && c.parent_name === catCategory
        );
        resolvedCategoryId = matched?.id || null;
      }

      await createProduct({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock: Number(form.stock),
        sku: form.sku.trim(),
        category_id: resolvedCategoryId,
        category: catCategory || null,
        subcategory: catSubcategory || null,
        collection_id: form.collection_id || null,
        status: form.status,
        sizes,
        colors,
        images,
        thumbnail,
        is_new: form.is_new,
        is_best_seller: form.is_best_seller,
        is_trending: form.is_trending,
        collection: form.collection.trim() || null,
        variations,
      });

      router.push('/admin/products');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const { url } = await uploadProductImage(fd);
        setImages((prev) => {
          const next = [...prev, url];
          if (!thumbnail) setThumbnail(url);
          return next;
        });
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, images: err instanceof Error ? err.message : 'Upload failed' }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (thumbnail === prev[idx]) setThumbnail(next[0] || null);
      return next;
    });
  };

  const handleMediaSelect = (urls: string[]) => {
    setImages((prev) => {
      const next = [...prev, ...urls];
      if (!thumbnail && urls.length > 0) setThumbnail(urls[0]);
      return next;
    });
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase';
  const errorClass = 'text-xs text-red-500 mt-1';

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A0A0A] mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>

      <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Basic Information</h3>

          <div>
            <label className={labelClass}>Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
              placeholder="e.g. Silk Midi Slip Dress"
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => update('description', html)}
              placeholder="Write product description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Collection</label>
              <select
                value={form.collection_id}
                onChange={(e) => update('collection_id', e.target.value)}
                className={inputClass}
              >
                <option value="">No collection</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Pricing & Inventory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Price (Rs.) *</label>
              <input
                type="number"
                step="1"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className={inputClass}
                placeholder="e.g. 2500"
              />
              {errors.price && <p className={errorClass}>{errors.price}</p>}
            </div>
            <div>
              <label className={labelClass}>Sale Price (Rs.)</label>
              <input
                type="number"
                step="1"
                value={form.sale_price}
                onChange={(e) => update('sale_price', e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className={labelClass}>Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                className={inputClass}
                placeholder="0"
              />
              {errors.stock && <p className={errorClass}>{errors.stock}</p>}
            </div>
            <div>
              <label className={labelClass}>SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                className={inputClass}
                placeholder="e.g. SKU-001"
              />
              {errors.sku && <p className={errorClass}>{errors.sku}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputClass + ' w-auto'}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Category & Variations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
            Category & Variations
          </h3>
          <CategorySubcategoryVariations
            category={catCategory}
            subcategory={catSubcategory}
            variations={catVariations}
            onCategoryChange={setCatCategory}
            onSubcategoryChange={setCatSubcategory}
            onVariationsChange={setCatVariations}
          />
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product Images</h3>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Upload Images</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C9A84C] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Or Select from Library</label>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#C9A84C]/40 rounded-lg cursor-pointer hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-colors"
              >
                <ImageIcon className="size-8 text-[#C9A84C] mb-2" />
                <p className="text-sm font-medium text-[#C9A84C]">Browse Media Library</p>
                <p className="text-xs text-gray-400 mt-1">Pick from uploaded images</p>
              </button>
            </div>
          </div>
          {errors.images && <p className={errorClass}>{errors.images}</p>}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <Image
                    src={url}
                    alt={`Product image ${idx + 1}`}
                    fill
                    unoptimized
                    className={`w-full h-24 object-cover rounded-lg border-2 ${
                      thumbnail === url ? 'border-[#C9A84C]' : 'border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbnail(url)}
                    className={`absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded ${
                      thumbnail === url
                        ? 'bg-[#C9A84C] text-white'
                        : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                    } transition-opacity`}
                  >
                    {thumbnail === url ? 'Thumbnail' : 'Set thumbnail'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Visibility</h3>
          {[
            { key: 'is_new', label: 'New Arrival', desc: 'Show in "New Arrivals" section' },
            { key: 'is_best_seller', label: 'Best Seller', desc: 'Show in "Best Sellers" section' },
            { key: 'is_trending', label: 'Trending', desc: 'Show in "Trending" section' },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">{flag.label}</p>
                <p className="text-xs text-gray-500">{flag.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={form[flag.key as keyof typeof form] as boolean}
                onChange={(e) => update(flag.key, e.target.checked)}
                className="size-4 rounded border-gray-300 accent-[#C9A84C]"
              />
            </label>
          ))}
        </div>

        {/* Submit */}
        {errors.submit && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {errors.submit}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>

      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        multiple
        bucket="product-images"
      />
    </div>
  );
}
