import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/lib/mock-data';

let _subcategoryCategoryMapCache: Map<string, { name: string; slug: string }> | null = null;

async function getSubcategoryCategoryMap(): Promise<Map<string, { name: string; slug: string }>> {
  if (_subcategoryCategoryMapCache) return _subcategoryCategoryMapCache;
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('id, name, slug, parent_id');
  _subcategoryCategoryMapCache = buildSubcategoryCategoryMap(data || []);
  return _subcategoryCategoryMapCache;
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    image: (row.image_url as string) || '/categories/placeholder.jpg',
    description: (row.description as string) || '',
  };
}

import { COLOR_HEX_MAP } from '@/components/admin/CategorySubcategoryVariations';

function buildSubcategoryCategoryMap(
  allCats: { id: string; name: string; slug: string; parent_id: string | null }[],
): Map<string, { name: string; slug: string }> {
  const map = new Map<string, { name: string; slug: string }>();
  for (const c of allCats) {
    if (c.parent_id) {
      const parent = allCats.find((p) => p.id === c.parent_id);
      if (parent) {
        map.set(c.name, { name: parent.name, slug: parent.slug });
      }
    }
  }
  return map;
}

function mapProduct(
  row: Record<string, unknown>,
  categoryName?: string,
  categorySlug?: string,
  subcategoryCategoryMap?: Map<string, { name: string; slug: string }>,
): Product {
  const cat = row.categories as Record<string, unknown> | null;
  const variations = (row.variations as Record<string, string[] | Record<string, string> | undefined>) || {};
  const dbColors = (row.colors as { name: string; hex: string }[]) || [];

  // Read from variations (source of truth), fallback to legacy columns
  const sizes = (variations.size || (row.sizes as string[]) || []) as string[];
  const materials = (variations.material || []) as string[];
  const volumes = (variations['volume (ml)'] || []) as string[];
  const scentFamilies = (variations['scent family'] || []) as string[];

  // Colors: names from variations, hex from color_hex overrides → DB colors → COLOR_HEX_MAP → grey
  const colorNames = (variations.color || []) as string[];
  const colorHexOverrides = (variations.color_hex || {}) as Record<string, string>;
  let colors: { name: string; hex: string }[];
  if (colorNames.length > 0) {
    const dbHexMap = new Map(dbColors.map((c) => [c.name, c.hex]));
    colors = colorNames.map((name) => ({
      name,
      hex: colorHexOverrides[name] || dbHexMap.get(name) || COLOR_HEX_MAP[name] || '#808080',
    }));
  } else {
    colors = dbColors.map((c) => ({
      name: c.name,
      hex: c.hex || COLOR_HEX_MAP[c.name] || '#808080',
    }));
  }

  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : null,
    images: (row.images as string[]) || [],
    category: categoryName || (cat?.name as string) || (subcategoryCategoryMap || _subcategoryCategoryMapCache)?.get((row.subcategory as string) || '')?.name || 'Uncategorized',
    categoryId: (row.category_id as string) || '',
    categorySlug: categorySlug || (cat?.slug as string) || (subcategoryCategoryMap || _subcategoryCategoryMapCache)?.get((row.subcategory as string) || '')?.slug || '',
    subcategory: (row.subcategory as string) || null,
    sizes,
    colors,
    materials,
    volumes,
    scentFamilies,
    variants: [],
    stock: (row.stock as number) ?? 0,
    rating: row.rating ? Number(row.rating) : 0,
    reviewCount: (row.review_count as number) ?? 0,
    description: (row.description as string) || '',
    isNew: (row.is_new as boolean) ?? false,
    isBestSeller: (row.is_best_seller as boolean) ?? false,
    isTrending: (row.is_trending as boolean) ?? false,
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  const subMap = await getSubcategoryCategoryMap();
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getMaxPrice(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('price, sale_price')
    .eq('status', 'published');

  if (error || !data || data.length === 0) return 50000;
  let max = 0;
  for (const row of data) {
    const effective = row.sale_price && row.sale_price > 0 ? row.sale_price : row.price;
    if (effective > max) max = effective;
  }
  return max || 50000;
}

export interface ProductFilters {
  categories?: string[];
  subcategories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  collection?: string;
  search?: string;
}

export async function getFilteredProducts(filters: ProductFilters): Promise<Product[]> {
  const supabase = await createClient();

  // Resolve category names → subcategory names (products store subcategory as text, category_id is often null)
  let resolvedSubcategoryNames: string[] | undefined;
  let subMap: Map<string, { name: string; slug: string }> | undefined;

  if (filters.categories && filters.categories.length > 0) {
    const { data: allCats } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id');

    if (allCats && allCats.length > 0) {
      const selectedNames = filters.categories.map((c) => c.toLowerCase().trim());

      // Find matching category records (by name or slug)
      const matched = allCats.filter((c) =>
        selectedNames.includes(c.name.toLowerCase().trim()) ||
        selectedNames.includes(c.slug.toLowerCase().trim())
      );

      // Find parent IDs among matches, then get all children
      const parentIds = matched.filter((c) => !c.parent_id).map((c) => c.id);
      const childNames = allCats
        .filter((c) => c.parent_id && parentIds.includes(c.parent_id))
        .map((c) => c.name);

      // Also include the matched category names themselves (in case they are subcategories)
      const directNames = matched.map((c) => c.name);

      resolvedSubcategoryNames = [...new Set([...childNames, ...directNames])];
      subMap = buildSubcategoryCategoryMap(allCats);
    }
  }

  // If both category and subcategory filters, narrow to specific subcategories
  let finalSubNames = resolvedSubcategoryNames;
  if (filters.subcategories && filters.subcategories.length > 0) {
    // Use subcategory names directly — they're stored as text in the product
    finalSubNames = filters.subcategories;
  }

  // Build query
  let query = supabase
    .from('products')
    .select('*, categories(name, slug, parent_id)')
    .eq('status', 'published');

  if (finalSubNames && finalSubNames.length > 0) {
    query = query.in('subcategory', finalSubNames);
  }

  if (filters.collection) {
    query = query.eq('collection', filters.collection);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  let products = data.map((row) => mapProduct(row, undefined, undefined, subMap));

  // Price range filter
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => (p.salePrice ?? p.price) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => (p.salePrice ?? p.price) <= filters.maxPrice!);
  }

  // Sort
  switch (filters.sort) {
    case 'price-asc':
      products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      break;
    case 'price-desc':
      products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? b.price));
      break;
    case 'bestselling':
      products.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'newest':
    default:
      products.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
      break;
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return mapProduct(data, undefined, undefined, subMap);
}

export async function getNewArrivals(): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('is_new', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getBestSellers(): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('is_best_seller', true)
    .order('review_count', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getTrendingProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('is_trending', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getSaleProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .not('sale_price', 'is', null)
    .order('sale_price', { ascending: true });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!cat) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .in('id', ids)
    .eq('status', 'published');

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error || !data) return [];
  return data.map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  // Try exact match
  let { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  // Fallback: case-insensitive
  if (error || !data) {
    const result = await supabase
      .from('categories')
      .select('*')
      .ilike('slug', slug)
      .single();
    data = result.data;
    error = result.error;
  }

  // Fallback: match by name (slugified)
  if (error || !data) {
    const nameFromSlug = slug.replace(/-/g, ' ');
    const result = await supabase
      .from('categories')
      .select('*')
      .ilike('name', nameFromSlug)
      .single();
    data = result.data;
    error = result.error;
  }

  if (error || !data) return null;
  return mapCategory(data);
}

export async function getSubcategoriesByParentSlug(parentSlug: string): Promise<Category[]> {
  const supabase = await createClient();

  // First get the parent category ID (try exact, then case-insensitive, then by name)
  let parent = null;

  const exact = await supabase
    .from('categories')
    .select('id')
    .eq('slug', parentSlug)
    .single();
  parent = exact.data;

  if (!parent) {
    const ilike = await supabase
      .from('categories')
      .select('id')
      .ilike('slug', parentSlug)
      .single();
    parent = ilike.data;
  }

  if (!parent) {
    const nameFromSlug = parentSlug.replace(/-/g, ' ');
    const byName = await supabase
      .from('categories')
      .select('id')
      .ilike('name', nameFromSlug)
      .single();
    parent = byName.data;
  }

  if (!parent) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parent.id)
    .order('name');

  if (error || !data) return [];
  return data.map(mapCategory);
}

export async function getSubcategoryByName(name: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', name)
    .single();

  if (error || !data) return null;
  return mapCategory(data);
}

export async function getSiteSectionContent(sectionKey: string): Promise<Record<string, unknown> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('section_key', sectionKey)
    .single();

  if (error || !data) return null;
  return (data.content as Record<string, unknown>) || null;
}

// ─── Collections ────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

function mapCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) || null,
    image_url: (row.image_url as string) || null,
    sort_order: (row.sort_order as number) ?? 0,
    is_active: (row.is_active as boolean) ?? true,
    product_count: (row.product_count as number) ?? undefined,
  };
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*, products!collection_id(count)')
    .order('sort_order');

  if (error || !data) return [];
  return data.map((row) => {
    const products = row.products as { count: number }[] | null;
    return mapCollection({ ...row, product_count: products?.[0]?.count ?? 0 });
  });
}

export async function getActiveCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*, products!collection_id(count)')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data) return [];
  return data.map((row) => {
    const products = row.products as { count: number }[] | null;
    return mapCollection({ ...row, product_count: products?.[0]?.count ?? 0 });
  });
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*, products!collection_id(count)')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  const products = data.products as { count: number }[] | null;
  return mapCollection({ ...data, product_count: products?.[0]?.count ?? 0 });
}

export async function getProductsByCollectionSlug(slug: string): Promise<Product[]> {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return [];

  const supabase = await createClient();
  const subMap = await getSubcategoryCategoryMap();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('collection_id', collection.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapProduct(row, undefined, undefined, subMap));
}

// ─── Page Content (for dynamic CMS pages) ──────────────────────────────────

export async function getPageContent(sectionKey: string): Promise<Record<string, unknown> | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content')
    .eq('section_key', sectionKey)
    .maybeSingle();

  return (data?.content as Record<string, unknown>) || null;
}

// ─── Hero Banners ──────────────────────────────────────────────────────────

export interface HeroBanner {
  id: string;
  image_url: string;
  heading: string;
  subheading: string | null;
  cta_text: string;
  collection_slug: string;
  display_order: number;
}

export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hero_banners')
    .select('id, image_url, heading, subheading, cta_text, display_order, collections!hero_banners_collection_id_fkey(slug)')
    .eq('is_active', true)
    .order('display_order');

  if (error || !data) return [];
  return data.map((row) => {
    const col = row.collections as { slug: string } | null;
    return {
      id: row.id,
      image_url: row.image_url,
      heading: row.heading,
      subheading: row.subheading,
      cta_text: row.cta_text,
      collection_slug: col?.slug || 'shop',
      display_order: row.display_order,
    };
  });
}
