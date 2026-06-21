"use client";

import Link from "next/link";
import Image from "next/image";

interface AboutSectionProps {
  data?: Record<string, unknown> | null;
}

export function AboutSection({ data }: AboutSectionProps) {
  const title = (data?.title as string) || "The Art of\nEveryday Luxury";
  const description = (data?.description as string) || "EVORA was born from a belief that luxury should be accessible, not exclusive. We curate pieces that blend timeless elegance with modern sensibility \u2014 designed for those who appreciate quality without compromise.";
  const mission = (data?.mission as string) || "Every piece in our collection is thoughtfully selected for its craftsmanship, materials, and ability to transcend seasons. From silk dresses to leather goods, we celebrate the beauty of enduring style.";
  const imageUrl = (data?.image_url as string) || "";

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="About EVORA"
                fill
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src="/mockpic.webp"
                alt="About EVORA"
                fill
                unoptimized
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6">
            <div className="w-12 h-0.5 bg-gold" />
            <p className="text-xs tracking-[0.3em] uppercase text-gold">
              Our Story
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight whitespace-pre-line">
              {title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {mission}
            </p>
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-foreground hover:text-gold transition-colors"
              >
                Read Our Story
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
