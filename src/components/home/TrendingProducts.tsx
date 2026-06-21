import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Product } from "@/lib/mock-data";

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Trending Now"
          subtitle="What everyone is wearing this season"
        />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/trending"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 border border-foreground text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
          >
            View All Trending
          </Link>
        </div>
      </div>
    </section>
  );
}
