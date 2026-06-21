'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroBanner } from '@/lib/queries';

interface HeroBannerCarouselProps {
  banners: HeroBanner[];
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const goTo = React.useCallback(
    (idx: number) => setCurrent((idx + banners.length) % banners.length),
    [banners.length],
  );

  const startTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
  }, [banners.length]);

  React.useEffect(() => {
    if (banners.length <= 1 || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, banners.length, startTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) goTo(current + 1);
    else if (diff < -threshold) goTo(current - 1);
  };

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section
      className="relative w-full h-[60vh] min-h-[380px] sm:h-[70vh] sm:min-h-[440px] md:h-[80vh] md:min-h-[500px] lg:h-[85vh] xl:h-[90vh] flex items-end sm:items-center bg-[#0A0A0A]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        startTimer();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={banner.image_url}
            alt={banner.heading}
            fill
            sizes="100vw"
            unoptimized
            className="object-cover object-center sm:object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 sm:bg-gradient-to-r sm:from-black/70 sm:via-black/30 sm:to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content — wrapped in a container that sits above the dots */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-16 sm:pb-24 md:pb-28 pt-8 sm:py-16 lg:py-24 w-full">
        <Link
          href={`/collections/${banner.collection_slug}`}
          className="block"
          aria-label={`Go to ${banner.heading} collection`}
        >
          <div className="flex flex-col items-start justify-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            {/* Gold divider */}
            <motion.div
              key={`divider-${banner.id}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="w-10 sm:w-14 md:w-16 h-0.5 bg-[#C9A84C] mb-3 sm:mb-6 md:mb-8 origin-left"
            />

            {/* Heading */}
            <motion.h1
              key={`heading-${banner.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight"
            >
              {banner.heading}
            </motion.h1>

            {/* Subheading */}
            {banner.subheading && (
              <motion.p
                key={`sub-${banner.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
                className="text-xs sm:text-sm md:text-base lg:text-base font-serif italic text-[#C9A84C] mt-2 sm:mt-4 md:mt-5"
              >
                {banner.subheading}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              key={`cta-${banner.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
              className="mt-3 sm:mt-6 md:mt-8 w-auto"
            >
              <span className="inline-flex items-center justify-center px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 md:py-3 bg-[#C9A84C] text-white font-medium text-[10px] sm:text-xs tracking-widest uppercase rounded-full hover:bg-[#C9A84C]/90 transition-colors duration-300">
                {banner.cta_text}
              </span>
            </motion.div>
          </div>
        </Link>
      </div>

      {/* Dot indicators — separated from the Link to avoid click conflicts */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            startTimer();
          }}
        >
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-[#C9A84C] w-5 sm:w-6 md:w-8'
                  : 'bg-white/40 hover:bg-white/60 w-1.5 sm:w-2'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
    </section>
  );
}
