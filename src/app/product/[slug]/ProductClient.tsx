"use client";

import * as React from "react";
import { ImageGallery } from "@/components/product/ImageGallery";
import { SizeSelector } from "@/components/product/SizeSelector";
import { ColorSelector } from "@/components/product/ColorSelector";
import { MaterialSelector } from "@/components/product/MaterialSelector";
import { StockStatus } from "@/components/product/StockStatus";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ReviewSection } from "@/components/product/ReviewSection";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumb";
import type { Product } from "@/lib/mock-data";

interface ProductClientProps {
  product: Product;
  breadcrumbItems: BreadcrumbItem[];
}

export function ProductClient({ product, breadcrumbItems }: ProductClientProps) {
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>();
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    product.colors[0]?.name
  );
  const [selectedMaterial, setSelectedMaterial] = React.useState<string | undefined>(
    product.materials[0]
  );
  const [selectedVolume, setSelectedVolume] = React.useState<string | undefined>(
    product.volumes[0]
  );
  const [selectedScent, setSelectedScent] = React.useState<string | undefined>(
    product.scentFamilies[0]
  );
  const [dynamicRating, setDynamicRating] = React.useState(product.rating);
  const [dynamicReviewCount, setDynamicReviewCount] = React.useState(product.reviewCount);

  const handleReviewsLoaded = React.useCallback((rating: number, count: number) => {
    setDynamicRating(rating);
    setDynamicReviewCount(count);
  }, []);

  const hasVariants = product.variants.length > 0;

  const availableSizes = React.useMemo(() => {
    if (!hasVariants) return product.sizes;
    const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
    return sizes.length > 0 ? sizes : product.sizes;
  }, [hasVariants, product.variants, product.sizes]);

  const availableColors = React.useMemo(() => {
    if (!hasVariants) return product.colors;
    const colorMap = new Map<string, { name: string; hex: string }>();
    product.variants.forEach((v) => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, { name: v.color, hex: v.color_hex || '#000000' });
      }
    });
    const colors = [...colorMap.values()];
    return colors.length > 0 ? colors : product.colors;
  }, [hasVariants, product.variants, product.colors]);

  const variantStock = React.useMemo(() => {
    if (!hasVariants) return product.stock;
    const matched = product.variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    );
    return matched ? matched.stock : product.stock;
  }, [hasVariants, product.variants, selectedSize, selectedColor, product.stock]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Gallery */}
      <ImageGallery images={product.images} />

      {/* Product Info - Enhanced with better layout */}
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Name */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          {product.name}
        </h1>

        {/* Price & Rating - Enhanced with better hierarchy */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PriceDisplay price={product.price} salePrice={product.salePrice} className="text-lg" />
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`size-4 ${i < Math.round(dynamicRating) ? "text-gold" : "text-muted"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {dynamicRating > 0 ? dynamicRating.toFixed(1) : "0"} ({dynamicReviewCount} {dynamicReviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Breadcrumbs - Enhanced with better accessibility */}
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              
              return (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.707 7.293a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414l4 4a1 1 0 001.414-1.414L4.414 12H17a1 1 0 100 0H4.414l4.293-4.293a1 1 0 000-1.414z" />
                    </svg>
                  )}
                  {isLast || !item.href ? (
                    <span className="text-gray-500 font-medium">{item.label}</span>
                  ) : (
                    <a
                      href={item.href}
                      className="text-gray-600 hover:text-gold transition-colors duration-200 font-medium"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Category Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {product.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-200 cursor-pointer">
              {product.category}
            </span>
          )}
          {product.subcategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/30 text-muted-foreground border border-border/30 hover:bg-gold/10 hover:text-gold hover:border-gold/30 transition-all duration-200 cursor-pointer">
              {product.subcategory}
            </span>
          )}
        </div>

        {/* Description */}
        <ProductDescription html={product.description} />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Color Selector — only show if colors exist */}
        {availableColors.length > 0 && (
          <ColorSelector
            colors={availableColors}
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />
        )}

        {/* Size Selector — only show if sizes exist */}
        {availableSizes.length > 0 && (
          <SizeSelector
            sizes={availableSizes}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />
        )}

        {/* Material Selector — only show if materials exist */}
        {product.materials.length > 0 && (
          <MaterialSelector
            materials={product.materials}
            selectedMaterial={selectedMaterial}
            onSelect={setSelectedMaterial}
          />
        )}

        {/* Volume Selector — only show if volumes exist (perfumes) */}
        {product.volumes.length > 0 && (
          <MaterialSelector
            materials={product.volumes}
            selectedMaterial={selectedVolume}
            onSelect={setSelectedVolume}
            label="Volume"
          />
        )}

        {/* Scent Family Selector — only show if scent families exist (perfumes) */}
        {product.scentFamilies.length > 0 && (
          <MaterialSelector
            materials={product.scentFamilies}
            selectedMaterial={selectedScent}
            onSelect={setSelectedScent}
            label="Scent Family"
          />
        )}

        {/* Stock Status */}
        <StockStatus stock={variantStock} />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Add to Cart */}
        <AddToCart
          productId={product.id}
          stock={variantStock}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          sizes={availableSizes}
          colors={availableColors}
        />
      </div>

      {/* Reviews */}
      <div className="col-span-full">
        <ReviewSection productId={product.id} onReviewsLoaded={handleReviewsLoaded} />
      </div>
    </div>
  );
}