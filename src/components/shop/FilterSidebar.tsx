"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/context/currency-context";
import { createClient } from "@/lib/supabase/client";

// ─── Category / Subcategory Data (fetched from DB) ──────────────────────────

type CategoryData = Record<string, Record<string, string>>;

const EMPTY_CATEGORY_DATA: CategoryData = {};

const PRICE_MIN = 0;

// ─── Props ───────────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  className?: string;
  activeCategories?: string[];
  activeSubcategories?: string[];
  activeMinPrice?: number;
  activeMaxPrice?: number;
  maxPriceDisplay?: number;
  onCategoriesChange?: (vals: string[]) => void;
  onSubcategoriesChange?: (vals: string[]) => void;
  onCategoriesAndSubsChange?: (categories: string[], subcategories: string[]) => void;
  onMinPriceChange?: (val: string | undefined) => void;
  onMaxPriceChange?: (val: string | undefined) => void;
  onClearAll?: () => void;
  hasActiveFilters?: boolean;
}

// ─── Price Range Slider ──────────────────────────────────────────────────────

function PriceRangeSlider({
  min,
  max,
  dynamicMax,
  onMinChange,
  onMaxChange,
  formatPrice,
}: {
  min: number;
  max: number;
  dynamicMax: number;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
  formatPrice: (val: number) => string;
}) {
  const [localMin, setLocalMin] = React.useState(min);
  const [localMax, setLocalMax] = React.useState(max);

  const maxBound = dynamicMax || 50000;
  const minPercent = ((localMin - PRICE_MIN) / (maxBound - PRICE_MIN)) * 100;
  const maxPercent = ((localMax - PRICE_MIN) / (maxBound - PRICE_MIN)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), localMax - 10);
    setLocalMin(val);
    onMinChange(val);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), localMin + 10);
    setLocalMax(val);
    onMaxChange(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-foreground">
        <span className="font-medium">{formatPrice(localMin)}</span>
        <span className="text-muted-foreground">–</span>
        <span className="font-medium">{formatPrice(localMax)}</span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gold rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range" min={PRICE_MIN} max={maxBound} step={10} value={localMin}
          onChange={handleMinChange}
          className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
        <input
          type="range" min={PRICE_MIN} max={maxBound} step={10} value={localMax}
          onChange={handleMaxChange}
          className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function FilterSidebar({
  className,
  activeCategories = [],
  activeSubcategories = [],
  activeMinPrice,
  activeMaxPrice,
  maxPriceDisplay = 50000,
  onCategoriesChange,
  onSubcategoriesChange,
  onCategoriesAndSubsChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
  hasActiveFilters,
}: FilterSidebarProps) {
  const { formatDisplayPrice } = useCurrency();

  // ── Dynamic categories from DB ──
  const [categoryData, setCategoryData] = React.useState<CategoryData>(EMPTY_CATEGORY_DATA);
  const [loadingCats, setLoadingCats] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("name")
      .then(({ data }) => {
        if (!data) return;
        const parents = data.filter((c) => !c.parent_id);
        const children = data.filter((c) => c.parent_id);
        const map: CategoryData = {};
        for (const p of parents) {
          map[p.name] = {};
          for (const ch of children) {
            if (ch.parent_id === p.id) {
              map[p.name][ch.name] = ch.slug;
            }
          }
        }
        setCategoryData(map);
        setLoadingCats(false);
      });
  }, []);

  // Toggle a category
  const toggleCategory = (catName: string) => {
    const nextCats = activeCategories.includes(catName)
      ? activeCategories.filter((c) => c !== catName)
      : [...activeCategories, catName];

    // When unchecking, also remove subcategories of this category
    if (activeCategories.includes(catName) && onCategoriesAndSubsChange) {
      const subcats = Object.keys(categoryData[catName] || {});
      const nextSubs = activeSubcategories.filter((s) => !subcats.includes(s));
      onCategoriesAndSubsChange(nextCats, nextSubs);
    } else {
      onCategoriesChange?.(nextCats);
    }
  };

  // Toggle a subcategory
  const toggleSubcategory = (subName: string) => {
    const next = activeSubcategories.includes(subName)
      ? activeSubcategories.filter((s) => s !== subName)
      : [...activeSubcategories, subName];
    onSubcategoriesChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Categories ─────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4">
          Categories
        </h3>
        {loadingCats ? (
          <div className="flex flex-col gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {Object.keys(categoryData).map((catName) => {
              const isCatActive = activeCategories.includes(catName);
              const subcats = Object.keys(categoryData[catName]);
              const hasAnySubActive = subcats.some((s) => activeSubcategories.includes(s));

              return (
                <div key={catName}>
                  {/* Parent category checkbox */}
                  <label
                    className={cn(
                      "flex items-center gap-3 text-sm cursor-pointer py-1 transition-colors",
                      isCatActive || hasAnySubActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isCatActive}
                      onChange={() => toggleCategory(catName)}
                      className="size-4 rounded border-border accent-[#C9A84C]"
                    />
                    {catName}
                  </label>

                  {/* Subcategories (indented) */}
                  {subcats.length > 0 && (
                    <div className="ml-6 flex flex-col gap-0.5">
                      {subcats.map((subName) => (
                        <label
                          key={subName}
                          className={cn(
                            "flex items-center gap-3 text-[13px] cursor-pointer py-0.5 transition-colors",
                            activeSubcategories.includes(subName)
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={activeSubcategories.includes(subName)}
                            onChange={() => toggleSubcategory(subName)}
                            className="size-3.5 rounded border-border accent-[#C9A84C]"
                          />
                          {subName}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Price Range ────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4">
          Price Range
        </h3>
        <PriceRangeSlider
          min={activeMinPrice ?? PRICE_MIN}
          max={activeMaxPrice ?? maxPriceDisplay}
          dynamicMax={maxPriceDisplay}
          onMinChange={(val) => onMinPriceChange?.(val <= PRICE_MIN ? undefined : String(val))}
          onMaxChange={(val) => onMaxPriceChange?.(val >= maxPriceDisplay ? undefined : String(val))}
          formatPrice={formatDisplayPrice}
        />
      </div>

      {/* ── Clear Filters ──────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
