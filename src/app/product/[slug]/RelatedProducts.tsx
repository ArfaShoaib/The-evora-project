import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Product } from "@/lib/mock-data";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div>
      <SectionHeader
        title="You May Also Like"
        subtitle="Complete your look"
      />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 justify-items-center">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}