"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count?: number;
}

interface CollectionsGridProps {
  collections: CollectionItem[];
}

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.slug}`}
          className="group relative aspect-[3/4] rounded-lg overflow-hidden"
        >
          <Image
            src={collection.image_url || "/mockpic.webp"}
            alt={collection.name}
            fill
            unoptimized
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-colors duration-300 group-hover:from-black/70" />

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
            <h2 className="font-serif text-base sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
              {collection.name}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-4 line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-gold">
              Shop Now
              <ArrowRight className="size-3 sm:size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
