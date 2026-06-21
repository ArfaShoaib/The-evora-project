'use client';

import * as React from 'react';
import Image from 'next/image';
import { Plus, Trash2, X } from 'lucide-react';

export interface VariantRow {
  id?: string;
  size: string;
  color: string;
  color_hex: string;
  material: string;
  volume: string;
  fit: string;
  neckline: string;
  pattern: string;
  embroidery: string;
  sleeve_length: string;
  dupatta: string;
  dial_color: string;
  movement: string;
  target: string;
  fragrance_notes: string;
  stock: number;
  price_modifier: number;
  sku: string;
  attributes: Record<string, string>;
  image_url: string;
}

interface VariantFieldConfig {
  key: string;
  label: string;
  type: 'select' | 'number' | 'text';
  options?: string[];
  placeholder?: string;
}

// ─── Category → Variant Field Definitions ──────────────────────────────────────

const CATEGORY_VARIANT_FIELDS: Record<string, VariantFieldConfig[]> = {
  // ── Apparel: Western Wear ──
  'western-wear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Black' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#000000' },
    { key: 'material', label: 'Material', type: 'select', options: ['Lawn', 'Cotton', 'Silk', 'Denim', 'Linen', 'Chiffon', 'Khaddar'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Slim Fit', 'Regular', 'Oversized', 'Relaxed'] },
    { key: 'neckline', label: 'Neckline', type: 'select', options: ['V-Neck', 'Crew Neck', 'Round', 'Collar', 'Henley', 'Boat Neck', 'Square'] },
    { key: 'pattern', label: 'Pattern', type: 'select', options: ['Solid', 'Printed', 'Striped', 'Plaid', 'Floral', 'Abstract', 'Polka Dot'] },
  ],

  // ── Apparel: Desi / Pakistani Wear ──
  'desi-pakistani-wear': [
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Emerald' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#046A38' },
    { key: 'material', label: 'Material', type: 'select', options: ['Lawn', 'Cotton', 'Silk', 'Denim', 'Linen', 'Chiffon', 'Khaddar', 'Organza', 'Velvet'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Slim Fit', 'Regular', 'Oversized', 'Straight Cut', 'A-Line'] },
    { key: 'embroidery', label: 'Embroidery', type: 'select', options: ['Hand Work', 'Machine Work', 'Chikankari', 'Zardozi', 'Thread Work', 'None'] },
    { key: 'sleeve_length', label: 'Sleeve Length', type: 'select', options: ['Short', 'Three-Quarter', 'Full', 'Sleeveless', 'Cap'] },
    { key: 'dupatta', label: 'Dupatta', type: 'select', options: ['Yes', 'No'] },
  ],

  // ── Accessories: Jewelry ──
  'jewelry': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Rose Gold' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#B76E79' },
    { key: 'material', label: 'Material', type: 'select', options: ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Brass', 'Stainless Steel', 'Pearl', 'Crystal', 'Beads', 'Gemstone/Stone'] },
  ],

  // ── Accessories: Watches ──
  'watches': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Silver' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#C0C0C0' },
    { key: 'material', label: 'Strap Material', type: 'select', options: ['Leather', 'Stainless Steel', 'Silicone', 'Fabric', 'Nylon', 'Ceramic'] },
    { key: 'dial_color', label: 'Dial Color', type: 'text', placeholder: 'e.g. Black' },
    { key: 'movement', label: 'Movement', type: 'select', options: ['Analog', 'Digital', 'Smart', 'Automatic', 'Quartz'] },
  ],

  // ── Accessories: Bags & Wallets ──
  'bags-wallets': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Tan' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#D2B48C' },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'Canvas', 'Suede', 'Nylon', 'PU Leather / Faux Leather', 'Denim'] },
    { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
  ],

  // ── Perfumes (all subcategories) ──
  'perfumes': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml (Tester)', '30ml', '50ml', '100ml', '200ml'] },
    { key: 'target', label: 'Target', type: 'select', options: ['Men', 'Women', 'Unisex'] },
    { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'select', options: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Musky', 'Aquatic', 'Oriental', 'Fresh', 'Sweet'] },
  ],
  'mens-perfumes': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml (Tester)', '30ml', '50ml', '100ml', '200ml'] },
    { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'select', options: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Musky', 'Aquatic', 'Oriental', 'Fresh', 'Sweet'] },
  ],
  'womens-perfumes': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml (Tester)', '30ml', '50ml', '100ml', '200ml'] },
    { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'select', options: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Musky', 'Aquatic', 'Oriental', 'Fresh', 'Sweet'] },
  ],
  'unisex-niche': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml (Tester)', '30ml', '50ml', '100ml', '200ml'] },
    { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'select', options: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Musky', 'Aquatic', 'Oriental', 'Fresh', 'Sweet'] },
  ],
  'attars-traditional-oils': [
    { key: 'volume', label: 'Volume', type: 'select', options: ['5ml (Tester)', '10ml', '12ml', '25ml'] },
    { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'select', options: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Musky', 'Aquatic', 'Oriental', 'Fresh', 'Sweet'] },
  ],

  // ── Accessories: Hair Accessories ──
  'hair-accessories': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Gold' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#D4AF37' },
    { key: 'material', label: 'Material', type: 'select', options: ['Satin', 'Velvet', 'Metal', 'Plastic/Acrylic', 'Pearl', 'Crystal/Rhinestone', 'Elastic'] },
  ],

  // ── Accessories: Belts ──
  'belts': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Brown' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#8B4513' },
    { key: 'material', label: 'Material', type: 'select', options: ['Leather', 'PU Leather (Faux Leather)', 'Canvas', 'Suede', 'Denim', 'Elastic', 'Chain/Metal'] },
  ],

  // ── Accessories: Sunglasses ──
  'sunglasses': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Black' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#000000' },
    { key: 'material', label: 'Material', type: 'select', options: ['Plastic/Acrylic', 'Metal', 'Acetate', 'Polycarbonate', 'Wood'] },
  ],

  // ── Accessories: Scarves & Stoles ──
  'scarves-stoles': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Ivory' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#FFFFF0' },
    { key: 'material', label: 'Material', type: 'select', options: ['Cotton', 'Silk', 'Chiffon', 'Linen', 'Velvet', 'Polyester', 'Lawn', 'Organza'] },
    { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Oversized'] },
  ],

  // ── Accessories: Other Essentials ──
  'other-essentials': [
    { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Black' },
    { key: 'color_hex', label: 'Hex', type: 'text', placeholder: '#000000' },
    { key: 'material', label: 'Material', type: 'select', options: ['Metal', 'Plastic', 'Fabric', 'Leather', 'Silk', 'Cotton'] },
  ],
};

function getFieldsForCategory(categorySlug: string): VariantFieldConfig[] {
  return CATEGORY_VARIANT_FIELDS[categorySlug] || [];
}

function createEmptyRow(): VariantRow {
  return {
    size: '',
    color: '',
    color_hex: '',
    material: '',
    volume: '',
    fit: '',
    neckline: '',
    pattern: '',
    embroidery: '',
    sleeve_length: '',
    dupatta: '',
    dial_color: '',
    movement: '',
    target: '',
    fragrance_notes: '',
    stock: 0,
    price_modifier: 0,
    sku: '',
    attributes: {},
    image_url: '',
  };
}

// ─── Custom Attributes Sub-Component ──────────────────────────────────────────

function CustomAttributesEditor({
  attributes,
  onChange,
}: {
  attributes: Record<string, string>;
  onChange: (attrs: Record<string, string>) => void;
}) {
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');
  const entries = Object.entries(attributes);

  const addAttribute = () => {
    const k = newKey.trim();
    const v = newValue.trim();
    if (!k) return;
    onChange({ ...attributes, [k]: v });
    setNewKey('');
    setNewValue('');
  };

  const removeAttribute = (key: string) => {
    const next = { ...attributes };
    delete next[key];
    onChange(next);
  };

  const inputClass =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';

  return (
    <div className="space-y-2">
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs"
            >
              <span className="font-medium text-gray-700">{k}:</span>
              <span className="text-gray-500">{v || '—'}</span>
              <button
                type="button"
                onClick={() => removeAttribute(k)}
                className="ml-0.5 text-gray-400 hover:text-red-500"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[10px] font-medium text-gray-500 mb-1 tracking-wider uppercase">Key</label>
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className={inputClass}
            placeholder="e.g. Occasion"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[10px] font-medium text-gray-500 mb-1 tracking-wider uppercase">Value</label>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className={inputClass}
            placeholder="e.g. Casual"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttribute(); } }}
          />
        </div>
        <button
          type="button"
          onClick={addAttribute}
          className="px-3 py-2 text-xs font-medium text-[#C9A84C] border border-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/5 transition-colors shrink-0"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProductVariantManagerProps {
  categorySlug: string;
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  productImages?: string[];
}

export function ProductVariantManager({
  categorySlug,
  variants,
  onChange,
  productImages = [],
}: ProductVariantManagerProps) {
  const fields = getFieldsForCategory(categorySlug);
  const [draft, setDraft] = React.useState<VariantRow>(() => createEmptyRow());
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);

  // Reset draft when category changes
  const prevCategory = React.useRef(categorySlug);
  React.useEffect(() => {
    if (prevCategory.current !== categorySlug) {
      prevCategory.current = categorySlug;
      setDraft(createEmptyRow());
      setEditingIdx(null);
    }
  }, [categorySlug]);

  if (fields.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        Select a category to configure product variants.
      </p>
    );
  }

  const updateDraft = (key: string, value: string | number) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const addVariant = () => {
    // Build a label from active fields for duplicate detection
    const label = fields.map((f) => draft[f.key as keyof VariantRow] || '').join('|');
    const isDuplicate = variants.some((v, i) => {
      if (editingIdx !== null && i === editingIdx) return false;
      const existing = fields.map((f) => v[f.key as keyof VariantRow] || '').join('|');
      return existing === label;
    });
    if (isDuplicate) return;

    if (editingIdx !== null) {
      const updated = [...variants];
      updated[editingIdx] = { ...draft };
      onChange(updated);
      setEditingIdx(null);
    } else {
      onChange([...variants, { ...draft }]);
    }
    setDraft(createEmptyRow());
  };

  const editVariant = (index: number) => {
    setDraft({ ...variants[index] });
    setEditingIdx(index);
  };

  const cancelEdit = () => {
    setDraft(createEmptyRow());
    setEditingIdx(null);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
    if (editingIdx === index) cancelEdit();
  };

  const updateVariantAttributes = (index: number, attrs: Record<string, string>) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], attributes: attrs };
    onChange(updated);
  };

  const updateVariantImage = (index: number, url: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], image_url: url };
    onChange(updated);
  };

  const inputClass =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';

  return (
    <div className="space-y-4">
      {/* Draft row */}
      <div className="flex flex-wrap items-end gap-3">
        {fields.map((field) => (
          <div key={field.key} className="flex-1 min-w-[120px]">
            <label className="block text-[11px] font-medium text-gray-500 mb-1 tracking-wider uppercase">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={(draft[field.key as keyof VariantRow] as string) || ''}
                onChange={(e) => updateDraft(field.key, e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={(draft[field.key as keyof VariantRow] as string | number) || ''}
                onChange={(e) => updateDraft(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                className={inputClass}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <div className="flex gap-1.5 shrink-0">
          {editingIdx !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-white text-xs font-semibold rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
          >
            <Plus className="size-3.5" />
            {editingIdx !== null ? 'Update' : 'Add'}
          </button>
        </div>
      </div>

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {fields.map((f) => (
                  <th key={f.key} className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Attrs</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">Image</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v, idx) => {
                const attrCount = Object.keys(v.attributes || {}).length;
                return (
                  <React.Fragment key={idx}>
                    <tr className={editingIdx === idx ? 'bg-[#C9A84C]/5' : 'hover:bg-gray-50/50'}>
                      {fields.map((f) => (
                        <td key={f.key} className="px-4 py-2.5 text-sm text-gray-700">
                          {f.key === 'color_hex' && v.color_hex ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-block size-3 rounded-full border" style={{ backgroundColor: v.color_hex }} />
                              {v.color_hex}
                            </span>
                          ) : (
                            (v[f.key as keyof VariantRow] as string) || '—'
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-sm text-gray-700">
                        {attrCount > 0 ? (
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-bold">
                            {attrCount}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-700">
                        {v.image_url ? (
                          <Image src={v.image_url} alt="" width={32} height={32} unoptimized className="size-8 rounded object-cover border" />
                        ) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => editVariant(idx)}
                            className="p-1 text-gray-400 hover:text-[#C9A84C] transition-colors text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row: Attributes + Image */}
                    {editingIdx === idx && (
                      <tr>
                        <td colSpan={fields.length + 3} className="px-4 py-4 bg-gray-50/80">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Custom Attributes */}
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-2 tracking-wider uppercase">
                                Custom Attributes
                              </label>
                              <CustomAttributesEditor
                                attributes={v.attributes || {}}
                                onChange={(attrs) => updateVariantAttributes(idx, attrs)}
                              />
                            </div>
                            {/* Image Mapping */}
                            {productImages.length > 0 && (
                              <div>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-2 tracking-wider uppercase">
                                  Variant Image
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateVariantImage(idx, '')}
                                    className={`size-12 rounded border-2 flex items-center justify-center text-[10px] text-gray-400 transition-colors ${
                                      !v.image_url ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    None
                                  </button>
                                  {productImages.map((url, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => updateVariantImage(idx, url)}
                                      className={`size-12 rounded border-2 overflow-hidden transition-colors ${
                                        v.image_url === url ? 'border-[#C9A84C]' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <Image src={url} alt="" width={48} height={48} unoptimized className="size-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
