import type { Metadata } from "next";
import { getTrendingProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Trending Now | EVORA",
  description: "What's hot right now in the EVORA collection.",
};

export default async function TrendingPage() {
  const trending = await getTrendingProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <div className="w-16 h-0.5 bg-gold mb-6" />
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Trending Now
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {trending.length} products
        </p>
      </div>
      <ProductGrid products={trending} />
    </div>
  );
}
