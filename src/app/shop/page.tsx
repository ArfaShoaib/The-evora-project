import type { Metadata } from "next";
import { Suspense } from "react";
import { getFilteredProducts, getMaxPrice } from "@/lib/queries";
import { ShopContent } from "@/components/shop/ShopContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All | EVORA",
  description: "Discover our curated collection of premium fashion pieces.",
};

interface ShopPageProps {
  searchParams: Promise<{
    categories?: string;
    subcategories?: string;
    min?: string;
    max?: string;
    sort?: string;
    collection?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const parseMulti = (val?: string): string[] | undefined => {
    if (!val) return undefined;
    const arr = val.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  };

  const filters = {
    categories: parseMulti(params.categories),
    subcategories: parseMulti(params.subcategories),
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    sort: params.sort,
    collection: params.collection,
    search: params.search,
  };

  const [products, maxPricePKR] = await Promise.all([
    getFilteredProducts(filters),
    getMaxPrice(),
  ]);
  const page = params.page ? Number(params.page) : 1;

  return (
    <Suspense>
      <ShopContent
        products={products}
        initialPage={page}
        initialFilters={filters}
        maxPricePKR={maxPricePKR}
      />
    </Suspense>
  );
}
