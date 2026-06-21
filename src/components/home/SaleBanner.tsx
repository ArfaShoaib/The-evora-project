import Link from "next/link";

interface SaleBannerProps {
  data?: Record<string, unknown> | null;
}

export function SaleBanner({ data }: SaleBannerProps) {
  const active = (data?.active as boolean) ?? true;
  if (!active) return null;

  const subtitle = (data?.subtitle as string) || "Limited Time Only";
  const title = (data?.title as string) || "Up to 50% Off";
  const description = (data?.description as string) || "Don\u2019t miss our seasonal sale. Luxury pieces at irresistible prices.";
  const ctaText = (data?.cta_text as string) || "Shop the Sale";
  const ctaLink = (data?.cta_link as string) || "/sale";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-foreground/60 mb-4">
          {subtitle}
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
          {description}
        </p>
        <Link
          href={ctaLink}
          className="inline-flex items-center justify-center px-8 py-4 bg-foreground text-background font-medium text-sm tracking-widest uppercase hover:bg-dark-surface transition-colors duration-300"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
