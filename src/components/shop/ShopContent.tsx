"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { SortSelect } from "@/components/shop/SortSelect";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { useCurrency } from "@/lib/context/currency-context";
import type { Product, Category } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 12;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ShopContentProps {
  products: Product[];
  initialPage?: number;
  initialFilters?: {
    categories?: string[];
    subcategories?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
  };
  maxPricePKR?: number;
  activeCategorySlug?: string;
  activeCategoryName?: string;
  activeSubcategoryName?: string;
  subcategories?: Category[];
}

export function ShopContent({
  products,
  initialPage = 1,
  initialFilters = {},
  maxPricePKR = 50000,
  activeCategorySlug,
  activeCategoryName,
  activeSubcategoryName,
  subcategories = [],
}: ShopContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { convert, revert, currency } = useCurrency();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const currentPage = initialPage;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isCategoryPage = !!activeCategorySlug;

  // Lookup subcategory slug from name using the subcategories prop
  const getSubSlug = React.useCallback(
    (subName: string) => {
      const found = subcategories.find((s) => s.name === subName);
      return found?.slug || slugify(subName);
    },
    [subcategories]
  );

  // Lookup category slug from name (for base /shop page filter sidebar)
  const getCatSlug = React.useCallback(
    (catName: string) => slugify(catName),
    []
  );

  const updateParam = React.useCallback(
    (key: string, value: string | undefined) => {
      const basePath = isCategoryPage
        ? `/shop/${activeCategorySlug}${activeSubcategoryName ? `/${getSubSlug(activeSubcategoryName)}` : ""}`
        : "/shop";
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, searchParams, isCategoryPage, activeCategorySlug, activeSubcategoryName, getSubSlug]
  );

  const updatePrice = React.useCallback(
    (minVal: string | undefined, maxVal: string | undefined) => {
      const basePath = isCategoryPage
        ? `/shop/${activeCategorySlug}${activeSubcategoryName ? `/${getSubSlug(activeSubcategoryName)}` : ""}`
        : "/shop";
      const params = new URLSearchParams(searchParams.toString());
      if (minVal) params.set("min", minVal);
      else params.delete("min");
      if (maxVal) params.set("max", maxVal);
      else params.delete("max");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, searchParams, isCategoryPage, activeCategorySlug, activeSubcategoryName, getSubSlug]
  );

  const clearFilters = React.useCallback(() => {
    const basePath = isCategoryPage
      ? `/shop/${activeCategorySlug}${activeSubcategoryName ? `/${getSubSlug(activeSubcategoryName)}` : ""}`
      : "/shop";
    router.push(basePath, { scroll: false });
  }, [router, isCategoryPage, activeCategorySlug, activeSubcategoryName, getSubSlug]);

  const hasActiveFilters = searchParams.toString().length > 0;

  const filterKey = [
    currency,
    (initialFilters.categories || []).join("-"),
    (initialFilters.subcategories || []).join("-"),
    initialFilters.minPrice,
    initialFilters.maxPrice,
    activeCategorySlug,
    activeSubcategoryName,
  ].join("|");

  const getPageTitle = () => {
    if (initialFilters.search) return `Search: "${initialFilters.search}"`;
    if (activeSubcategoryName) return activeSubcategoryName;
    if (activeCategoryName) return activeCategoryName;
    return "Shop All";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-4 mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {isCategoryPage && (
              <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <button onClick={() => router.push("/shop")} className="hover:text-foreground transition-colors">
                  Shop
                </button>
                <span>/</span>
                <button
                  onClick={() => router.push(`/shop/${activeCategorySlug}`)}
                  className={`hover:text-foreground transition-colors ${activeSubcategoryName ? "" : "text-foreground font-medium"}`}
                >
                  {activeCategoryName}
                </button>
                {activeSubcategoryName && (
                  <>
                    <span>/</span>
                    <span className="text-foreground font-medium">{activeSubcategoryName}</span>
                  </>
                )}
              </nav>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">{getPageTitle()}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
              {initialFilters.search && (
                <button onClick={() => updateParam("search", undefined)} className="ml-3 text-[#D4AF37] hover:underline text-xs">
                  Clear search
                </button>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-medium text-foreground hover:border-gold transition-colors"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <SortSelect
              value={initialFilters.sort || "newest"}
              onChange={(val) => updateParam("sort", val === "newest" ? undefined : val)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        <aside className="hidden lg:block w-full lg:w-60 lg:shrink-0">
          <FilterSidebar
            key={filterKey}
            activeCategories={initialFilters.categories}
            activeSubcategories={initialFilters.subcategories}
            activeMinPrice={convert(initialFilters.minPrice ?? 0)}
            activeMaxPrice={convert(initialFilters.maxPrice ?? maxPricePKR)}
            maxPriceDisplay={convert(maxPricePKR)}
            onCategoriesChange={(vals) => {
              if (isCategoryPage) {
                if (vals.length > 0) router.push(`/shop/${getCatSlug(vals[0])}`, { scroll: false });
                else router.push("/shop", { scroll: false });
              } else {
                const params = new URLSearchParams(searchParams.toString());
                if (vals.length > 0) params.set("categories", vals.join(","));
                else params.delete("categories");
                params.delete("page");
                const qs = params.toString();
                router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
              }
            }}
            onSubcategoriesChange={(vals) => {
              if (isCategoryPage && activeCategorySlug) {
                if (vals.length > 0) router.push(`/shop/${activeCategorySlug}/${getSubSlug(vals[0])}`, { scroll: false });
                else router.push(`/shop/${activeCategorySlug}`, { scroll: false });
              } else {
                const params = new URLSearchParams(searchParams.toString());
                if (vals.length > 0) params.set("subcategories", vals.join(","));
                else params.delete("subcategories");
                params.delete("page");
                const qs = params.toString();
                router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
              }
            }}
            onCategoriesAndSubsChange={(cats, subs) => {
              if (isCategoryPage) {
                if (cats.length > 0) router.push(`/shop/${getCatSlug(cats[0])}`, { scroll: false });
                else router.push("/shop", { scroll: false });
              } else {
                const params = new URLSearchParams(searchParams.toString());
                if (cats.length > 0) params.set("categories", cats.join(","));
                else params.delete("categories");
                if (subs && subs.length > 0) params.set("subcategories", subs.join(","));
                else params.delete("subcategories");
                params.delete("page");
                const qs = params.toString();
                router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
              }
            }}
            onMinPriceChange={(val) => updatePrice(val, searchParams.get("max") || undefined)}
            onMaxPriceChange={(val) => updatePrice(searchParams.get("min") || undefined, val)}
            onClearAll={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {subcategories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">Subcategories</h3>
              <div className="flex flex-col gap-1">
                {subcategories.map((sub) => {
                  const isActive = activeSubcategoryName === sub.name;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => router.push(`/shop/${activeCategorySlug}/${sub.slug}`, { scroll: false })}
                      className={`text-left text-sm py-1 px-2 rounded transition-colors ${
                        isActive ? "text-[#D4AF37] font-medium bg-[#D4AF37]/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <main className="w-full lg:flex-1 lg:min-w-0">
          <ProductGrid products={currentProducts} />
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                const basePath = isCategoryPage
                  ? `/shop/${activeCategorySlug}${activeSubcategoryName ? `/${getSubSlug(activeSubcategoryName)}` : ""}`
                  : "/shop";
                const params = new URLSearchParams(searchParams.toString());
                if (page > 1) params.set("page", String(page));
                else params.delete("page");
                const qs = params.toString();
                router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
              }}
            />
          </div>
        </main>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-xl font-semibold text-foreground">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close filters">
                <X className="size-5" />
              </button>
            </div>
            <FilterSidebar
              key={filterKey}
              activeCategories={initialFilters.categories}
              activeSubcategories={initialFilters.subcategories}
              activeMinPrice={convert(initialFilters.minPrice ?? 0)}
              activeMaxPrice={convert(initialFilters.maxPrice ?? maxPricePKR)}
              maxPriceDisplay={convert(maxPricePKR)}
              onCategoriesChange={(vals) => {
                if (isCategoryPage) {
                  if (vals.length > 0) router.push(`/shop/${getCatSlug(vals[0])}`, { scroll: false });
                  else router.push("/shop", { scroll: false });
                } else {
                  const params = new URLSearchParams(searchParams.toString());
                  if (vals.length > 0) params.set("categories", vals.join(","));
                  else params.delete("categories");
                  params.delete("page");
                  const qs = params.toString();
                  router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
                }
                setIsFilterOpen(false);
              }}
              onSubcategoriesChange={(vals) => {
                if (isCategoryPage && activeCategorySlug) {
                  if (vals.length > 0) router.push(`/shop/${activeCategorySlug}/${getSubSlug(vals[0])}`, { scroll: false });
                  else router.push(`/shop/${activeCategorySlug}`, { scroll: false });
                } else {
                  const params = new URLSearchParams(searchParams.toString());
                  if (vals.length > 0) params.set("subcategories", vals.join(","));
                  else params.delete("subcategories");
                  params.delete("page");
                  const qs = params.toString();
                  router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
                }
                setIsFilterOpen(false);
              }}
              onCategoriesAndSubsChange={(cats, subs) => {
                if (isCategoryPage) {
                  if (cats.length > 0) router.push(`/shop/${getCatSlug(cats[0])}`, { scroll: false });
                  else router.push("/shop", { scroll: false });
                } else {
                  const params = new URLSearchParams(searchParams.toString());
                  if (cats.length > 0) params.set("categories", cats.join(","));
                  else params.delete("categories");
                  if (subs && subs.length > 0) params.set("subcategories", subs.join(","));
                  else params.delete("subcategories");
                  params.delete("page");
                  const qs = params.toString();
                  router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
                }
                setIsFilterOpen(false);
              }}
              onMinPriceChange={(val) => updatePrice(val, searchParams.get("max") || undefined)}
              onMaxPriceChange={(val) => updatePrice(searchParams.get("min") || undefined, val)}
              onClearAll={() => { clearFilters(); setIsFilterOpen(false); }}
              hasActiveFilters={hasActiveFilters}
            />

            {subcategories.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-3">Subcategories</h3>
                <div className="flex flex-col gap-1">
                  {subcategories.map((sub) => {
                    const isActive = activeSubcategoryName === sub.name;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => { router.push(`/shop/${activeCategorySlug}/${sub.slug}`, { scroll: false }); setIsFilterOpen(false); }}
                        className={`text-left text-sm py-1 px-2 rounded transition-colors ${
                          isActive ? "text-[#D4AF37] font-medium bg-[#D4AF37]/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
