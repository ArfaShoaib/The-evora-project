"use client";

import Link from "next/link";
import Image from "next/image";

interface SeasonalCollectionProps {
  data?: Record<string, unknown> | null;
}

export function SeasonalCollection({ data }: SeasonalCollectionProps) {
  const subtitle = (data?.subtitle as string) || "Limited Edition";
  const title = (data?.title as string) || "The Summer\nCollection";
  const description = (data?.description as string) || "Embrace the season with our curated selection of lightweight fabrics, sun-kissed hues, and effortless silhouettes.";
  const ctaPrimaryText = (data?.cta_primary_text as string) || "Shop Summer";
  const ctaPrimaryLink = (data?.cta_primary_link as string) || "/collections/summer-edit";
  const ctaSecondaryText = (data?.cta_secondary_text as string) || "View All Collections";
  const ctaSecondaryLink = (data?.cta_secondary_link as string) || "/collections";
  const imageUrl = (data?.image_url as string) || "";

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-dark-surface">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 size-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 size-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <p className="text-xs tracking-[0.3em] uppercase text-gold">
              {subtitle}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-background leading-tight whitespace-pre-line">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={ctaPrimaryLink}
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-foreground font-medium text-sm tracking-widest uppercase hover:bg-gold/90 transition-colors duration-300"
              >
                {ctaPrimaryText}
              </Link>
              <Link
                href={ctaSecondaryLink}
                className="inline-flex items-center justify-center px-8 py-4 border border-background/30 text-background font-medium text-sm tracking-widest uppercase hover:bg-background hover:text-foreground transition-all duration-300"
              >
                {ctaSecondaryText}
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-[4/5] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                unoptimized
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-zinc-600">
                  <div className="size-20 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                    <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Collection Image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
