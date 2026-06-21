import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getFilteredProducts, getMaxPrice, getCategoryBySlug, getSubcategoriesByParentSlug } from "@/lib/queries";
import { ShopContent } from "@/components/shop/ShopContent";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Shop | EVORA" };
  return {
    title: `${category.name} | EVORA`,
    description: category.description || `Shop ${category.name} collection at EVORA.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const subcategories = await getSubcategoriesByParentSlug(slug);

  const filters = {
    categories: [category.name],
    subcategories: undefined,
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
        activeCategorySlug={slug}
        activeCategoryName={category.name}
        subcategories={subcategories}
      />
    </Suspense>
  );
}
