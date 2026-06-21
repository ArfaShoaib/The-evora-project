import type { Metadata } from "next";
import { getNewArrivals } from "@/lib/queries";
import { NewArrivalsGrid } from "./NewArrivalsGrid";

export const metadata: Metadata = {
  title: "New Arrivals | EVORA",
  description: "Discover the latest additions to our curated collection.",
};

export default async function NewArrivalsPage() {
  const newProducts = await getNewArrivals();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <div className="w-16 h-0.5 bg-gold mb-6" />
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          New Arrivals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {newProducts.length} products
        </p>
      </div>
      <NewArrivalsGrid products={newProducts} />
    </div>
  );
}
