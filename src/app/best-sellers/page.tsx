import type { Metadata } from "next";
import { getBestSellers } from "@/lib/queries";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata: Metadata = {
  title: "Best Sellers | EVORA",
  description: "Our most loved pieces, chosen by the EVORA community.",
};

export default async function BestSellersPage() {
  const bestSellers = await getBestSellers();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <div className="w-16 h-0.5 bg-gold mb-6" />
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Best Sellers
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {bestSellers.length} products
        </p>
      </div>
      <ProductGrid products={bestSellers} />
    </div>
  );
}
