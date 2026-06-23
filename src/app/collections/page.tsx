import type { Metadata } from "next";
import { getActiveCollections } from "@/lib/queries";
import { CollectionsGrid } from "@/components/collections/CollectionsGrid";

export const metadata: Metadata = {
  title: "Collections | EVORA",
  description: "Explore our curated collections — thoughtfully styled edits for every occasion.",
};

export default async function CollectionsPage() {
  const collections = await getActiveCollections();

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 md:mb-16">
          <div className="w-16 h-0.5 bg-gold mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Collections
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {collections.length} curated edits
          </p>
        </div>
        <CollectionsGrid collections={collections} />
      </div>
    </section>
  );
}
