import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getProductsByCollectionSlug } from "@/lib/queries";
import { ProductCard } from "@/components/ui/ProductCard";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection Not Found | EVORA" };
  return {
    title: `${collection.name} | EVORA`,
    description: collection.description || `Shop the ${collection.name} collection at EVORA.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getProductsByCollectionSlug(slug);

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 md:mb-16">
          <div className="w-16 h-0.5 bg-gold mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              {collection.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="size-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No products in this collection yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Check back soon — new styles are always on the way.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
