"use client";

import Link from "next/link";
import Image from "next/image";

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface FeaturedCollectionsProps {
  collections?: CollectionItem[];
  data?: Record<string, unknown> | null;
}

export function FeaturedCollections({ collections, data }: FeaturedCollectionsProps) {
  let items: CollectionItem[] = [];

  if (collections && collections.length > 0) {
    items = collections;
  } else if (data?.items) {
    items = (data.items as Array<{ name: string; slug: string; description: string; image_url: string }>).map(
      (item, i) => ({ ...item, id: `legacy-${i}`, description: item.description || null, image_url: item.image_url || null })
    );
  }

  if (items.length === 0) return null;

  const displayItems = items.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Featured Collections
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Curated edits for every occasion
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {displayItems.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-muted"
            >
              {collection.image_url ? (
                <Image
                  src={collection.image_url}
                  alt={collection.name}
                  fill
                  unoptimized
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Image
                  src="/mockpic.webp"
                  alt={collection.name}
                  fill
                  unoptimized
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                <h3 className="font-serif text-base sm:text-xl font-semibold text-background mb-1 sm:mb-2">
                  {collection.name}
                </h3>
                <p className="text-xs sm:text-sm text-background/80 line-clamp-2">
                  {collection.description}
                </p>
                <div className="mt-2 sm:mt-4 inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-background group-hover:text-gold transition-colors">
                  Shop Now
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 border border-foreground text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
