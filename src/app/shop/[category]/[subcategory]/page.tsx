import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getFilteredProducts, getMaxPrice, getCategoryBySlug, getSubcategoriesByParentSlug } from "@/lib/queries";
import { ShopContent } from "@/components/shop/ShopContent";

export const dynamic = "force-dynamic";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { category: catSlug, subcategory: subSlug } = await params;
  const category = await getCategoryBySlug(catSlug);
  if (!category) return { title: "Shop | EVORA" };
  const subcategories = await getSubcategoriesByParentSlug(catSlug);
  const sub = subcategories.find((s) => s.slug === subSlug);
  const subName = sub?.name || subSlug.replace(/-/g, " ");
  return {
    title: `${subName} | ${category.name} | EVORA`,
    description: `Shop ${subName} in ${category.name} at EVORA.`,
  };
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { category: catSlug, subcategory: subSlug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(catSlug);
  if (!category) notFound();

  const subcategories = await getSubcategoriesByParentSlug(catSlug);
  const sub = subcategories.find((s) => s.slug === subSlug);
  if (!sub) notFound();

  const filters = {
    categories: [category.name],
    subcategories: [sub.name],
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    sort: sp.sort,
    search: sp.search,
  };

  const [products, maxPricePKR] = await Promise.all([
    getFilteredProducts(filters),
    getMaxPrice(),
  ]);

  const page = sp.page ? Number(sp.page) : 1;

  return (
    <Suspense>
      <ShopContent
        products={products}
        initialPage={page}
        initialFilters={filters}
        maxPricePKR={maxPricePKR}
        activeCategorySlug={catSlug}
        activeCategoryName={category.name}
        activeSubcategoryName={sub.name}
      />
    </Suspense>
  );
}
