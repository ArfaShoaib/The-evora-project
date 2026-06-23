'use client';

import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { ColorTagInput, type ColorEntry } from './ColorTagInput';
import { createClient } from '@/lib/supabase/client';

// ─── Data Structure ──────────────────────────────────────────────────────────

interface ParentCategory {
  id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  variation_fields: string[] | null;
}

type VariationField = string;

const PREDEFINED = {
  size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  color: ['Black', 'White', 'Red', 'Navy', 'Beige', 'Pink', 'Gold', 'Brown', 'Grey'],
  material: ['Cotton', 'Silk', 'Chiffon', 'Linen', 'Velvet', 'Polyester', 'Lawn', 'Organza', 'Leather', 'Denim'],
  'material:jewelry': ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Brass', 'Stainless Steel', 'Pearl', 'Crystal', 'Beads', 'Gemstone/Stone'],
  'material:bags-wallets': ['Leather', 'Canvas', 'Suede', 'Nylon', 'PU Leather / Faux Leather', 'Denim'],
  'material:hair-accessories': ['Satin', 'Velvet', 'Metal', 'Plastic/Acrylic', 'Pearl', 'Crystal/Rhinestone', 'Elastic'],
  'material:scarves-stoles': ['Cotton', 'Silk', 'Chiffon', 'Linen', 'Velvet', 'Polyester', 'Lawn', 'Organza'],
  'material:belts': ['Leather', 'PU Leather (Faux Leather)', 'Canvas', 'Suede', 'Denim', 'Elastic', 'Chain/Metal'],
  'material:sunglasses': ['Plastic/Acrylic', 'Metal', 'Acetate', 'Polycarbonate', 'Wood'],
  'strap material': ['Leather', 'Metal', 'Silicone', 'Fabric'],
  'volume (ml)': {
    regular: ['30ml', '50ml', '75ml', '100ml'],
    attar: ['3ml', '6ml', '12ml', '20ml'],
  },
  'scent family': ['Floral', 'Woody', 'Spicy', 'Citrus', 'Musky', 'Fruity', 'Oriental', 'Fresh'],
};

export const COLOR_HEX_MAP: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Red': '#FF0000',
  'Navy': '#000080',
  'Beige': '#F5F5DC',
  'Pink': '#FFC0CB',
  'Gold': '#D4AF37',
  'Brown': '#8B4513',
  'Grey': '#808080',
  'Green': '#008000',
  'Blue': '#0000FF',
  'Yellow': '#FFFF00',
  'Orange': '#FFA500',
  'Purple': '#800080',
  'Ivory': '#FFFFF0',
  'Cream': '#FFFDD0',
  'Tan': '#D2B48C',
  'Burgundy': '#800020',
  'Maroon': '#800000',
  'Charcoal': '#36454F',
  'Silver': '#C0C0C0',
  'Rose Gold': '#B76E79',
  'Champagne': '#F7E7CE',
  'Camel': '#C19A6B',
  'Cognac': '#834A25',
  'Emerald': '#2E8B57',
  'Rust': '#B7410E',
  'Olive': '#808000',
  'Teal': '#008080',
  'Coral': '#FF7F50',
  'Mauve': '#E0B0FF',
  'Lavender': '#E6E6FA',
  'Peach': '#FFE5B4',
  'Turquoise': '#40E0D0',
  'Mustard': '#FFDB58',
  'Wine': '#722F37',
  'Chocolate': '#D2691E',
};

function getMaterialOptions(categoryName: string, subcategoryName: string): readonly string[] {
  if (categoryName === 'Accessories' && subcategoryName === 'Jewelry (Zewar)') {
    return PREDEFINED['material:jewelry'];
  }
  if (categoryName === 'Accessories' && subcategoryName === 'Bags & Wallets') {
    return PREDEFINED['material:bags-wallets'];
  }
  if (categoryName === 'Accessories' && subcategoryName === 'Hair Accessories') {
    return PREDEFINED['material:hair-accessories'];
  }
  if (categoryName === 'Accessories' && subcategoryName === 'Scarves & Stoles') {
    return PREDEFINED['material:scarves-stoles'];
  }
  if (categoryName === 'Accessories' && subcategoryName === 'Belts') {
    return PREDEFINED['material:belts'];
  }
  if (categoryName === 'Accessories' && subcategoryName === 'Sunglasses') {
    return PREDEFINED['material:sunglasses'];
  }
  return PREDEFINED.material;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VariationsData {
  size?: string[];
  color?: string[];
  color_hex?: Record<string, string>;
  material?: string[];
  'strap material'?: string[];
  'volume (ml)'?: string[];
  'scent family'?: string[];
  [key: string]: string[] | Record<string, string> | undefined;
}

interface CategorySubcategoryVariationsProps {
  category: string;
  subcategory: string;
  variations: VariationsData;
  onCategoryChange: (val: string) => void;
  onSubcategoryChange: (val: string) => void;
  onVariationsChange: (val: VariationsData) => void;
  hideVariationFields?: boolean;
}

// ─── Tag Input Sub-component ─────────────────────────────────────────────────

function TagInput({
  label,
  options,
  selected,
  onChange,
  isAttar = false,
}: {
  label: string;
  options: readonly string[] | { regular: readonly string[]; attar: readonly string[] };
  selected: string[];
  onChange: (val: string[]) => void;
  isAttar?: boolean;
}) {
  const [customInput, setCustomInput] = React.useState('');
  const [showCustom, setShowCustom] = React.useState(false);

  const effectiveOptions = isAttar
    ? (options as { regular: readonly string[]; attar: readonly string[] })[selected.length > 0 && selected.some((s) => ['3ml', '6ml', '12ml', '20ml'].includes(s)) ? 'attar' : 'regular']
    : (options as readonly string[]);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      onChange([...selected, `Custom: ${val}`]);
      setCustomInput('');
      setShowCustom(false);
    }
  };

  const remove = (val: string) => {
    onChange(selected.filter((s) => s !== val));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2 tracking-wider uppercase">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {effectiveOptions.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${
                isSelected
                  ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#0A0A0A]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {opt}
            </button>
          );
        })}

        {selected
          .filter((s) => s.startsWith('Custom: '))
          .map((custom) => (
            <span
              key={custom}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#C9A84C] bg-[#C9A84C]/10 text-[#0A0A0A] rounded-md"
            >
              {custom.replace('Custom: ', '')}
              <span className="text-[9px] text-[#C9A84C] font-semibold">(custom)</span>
              <button
                type="button"
                onClick={() => remove(custom)}
                className="ml-0.5 text-gray-400 hover:text-red-500"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

        {showCustom ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Type..."
              className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#C9A84C]"
              autoFocus
            />
            <button
              type="button"
              onClick={addCustom}
              className="text-[#C9A84C] hover:text-[#C9A84C]/80"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                setCustomInput('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-md transition-colors"
          >
            <Plus className="size-3" />
            Add custom
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CategorySubcategoryVariations({
  category,
  subcategory,
  variations,
  onCategoryChange,
  onSubcategoryChange,
  onVariationsChange,
  hideVariationFields = false,
}: CategorySubcategoryVariationsProps) {
  const [parentCategories, setParentCategories] = React.useState<ParentCategory[]>([]);
  const [subcategories, setSubcategories] = React.useState<SubCategory[]>([]);
  const [loadingCats, setLoadingCats] = React.useState(true);
  const [loadingSubs, setLoadingSubs] = React.useState(false);

  // Fetch parent categories on mount
  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from('categories')
      .select('id, name, slug')
      .is('parent_id', null)
      .order('name')
      .then(({ data }) => {
        if (data) setParentCategories(data);
        setLoadingCats(false);
      });
  }, []);

  // Fetch subcategories when parent category changes
  React.useEffect(() => {
    if (!category) return;
    const parent = parentCategories.find((c) => c.name === category);
    if (!parent) return;

    let cancelled = false;
    const supabase = createClient();

    (async () => {
      setLoadingSubs(true);
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, variation_fields')
        .eq('parent_id', parent.id)
        .order('name');
      if (!cancelled) {
        if (data) setSubcategories(data as SubCategory[]);
        setLoadingSubs(false);
      }
    })();

    return () => { cancelled = true; };
  }, [category, parentCategories]);

  // Find current subcategory's variation fields
  const effectiveSubcategories = category ? subcategories : [];
  const currentSub = effectiveSubcategories.find((s) => s.name === subcategory);
  const variationFields: VariationField[] = currentSub?.variation_fields
    ? (currentSub.variation_fields as string[])
    : [];

  const handleCategoryChange = (val: string) => {
    onCategoryChange(val);
    onSubcategoryChange('');
    onVariationsChange({});
  };

  const handleSubcategoryChange = (val: string) => {
    onSubcategoryChange(val);
    onVariationsChange({});
  };

  const handleVariationChange = (field: string, values: string[]) => {
    onVariationsChange({
      ...variations,
      [field]: values.length > 0 ? values : undefined,
    });
  };

  const handleColorChange = (colors: ColorEntry[]) => {
    const colorNames = colors.map((c) => c.name);
    const colorHexMap: Record<string, string> = {};
    colors.forEach((c) => {
      if (c.hex) colorHexMap[c.name] = c.hex;
    });
    onVariationsChange({
      ...variations,
      color: colorNames.length > 0 ? colorNames : undefined,
      color_hex: Object.keys(colorHexMap).length > 0 ? colorHexMap : undefined,
    });
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5 tracking-wider uppercase';

  return (
    <div className="space-y-5">
      {/* Category & Subcategory Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={inputClass}
            disabled={loadingCats}
          >
            <option value="">{loadingCats ? 'Loading...' : 'Select category'}</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Subcategory</label>
          <select
            value={subcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className={inputClass}
            disabled={!category || loadingSubs}
          >
            <option value="">{loadingSubs ? 'Loading...' : category ? 'Select subcategory' : 'Select category first'}</option>
            {effectiveSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Variation Fields */}
      {!hideVariationFields && subcategory && variationFields.length > 0 && (
        <div className="space-y-5 pt-2">
          <div className="h-px bg-gray-100" />

          {variationFields.map((field) => {
            const fieldLower = field.toLowerCase();

            if (fieldLower === 'size') {
              return (
                <TagInput
                  key={field}
                  label="Size"
                  options={PREDEFINED.size}
                  selected={variations.size || []}
                  onChange={(vals) => handleVariationChange('size', vals)}
                />
              );
            }

            if (fieldLower === 'color') {
              const colorNames = variations.color || [];
              const colorHexMap = (variations.color_hex || {}) as Record<string, string>;
              const selectedColors: ColorEntry[] = colorNames.map((name) => ({
                name,
                hex: colorHexMap[name] || COLOR_HEX_MAP[name] || '',
              }));
              return (
                <ColorTagInput
                  key={field}
                  label="Color"
                  selected={selectedColors}
                  onChange={handleColorChange}
                  predefinedNames={PREDEFINED.color}
                />
              );
            }

            if (fieldLower === 'material') {
              return (
                <TagInput
                  key={field}
                  label="Material"
                  options={getMaterialOptions(category, subcategory)}
                  selected={variations.material || []}
                  onChange={(vals) => handleVariationChange('material', vals)}
                />
              );
            }

            if (fieldLower === 'strap material') {
              return (
                <TagInput
                  key={field}
                  label="Strap Material"
                  options={PREDEFINED['strap material']}
                  selected={variations['strap material'] || []}
                  onChange={(vals) => handleVariationChange('strap material', vals)}
                />
              );
            }

            if (fieldLower === 'volume (ml)') {
              return (
                <TagInput
                  key={field}
                  label="Volume (ml)"
                  options={PREDEFINED['volume (ml)']}
                  selected={variations['volume (ml)'] || []}
                  onChange={(vals) => handleVariationChange('volume (ml)', vals)}
                  isAttar
                />
              );
            }

            if (fieldLower === 'scent family') {
              return (
                <TagInput
                  key={field}
                  label="Scent Family"
                  options={PREDEFINED['scent family']}
                  selected={variations['scent family'] || []}
                  onChange={(vals) => handleVariationChange('scent family', vals)}
                />
              );
            }

            return null;
          })}
        </div>
      )}

      {/* No selection message */}
      {!category && (
        <p className="text-xs text-gray-400 italic">
          Select a category to configure subcategory and variations.
        </p>
      )}
    </div>
  );
}
