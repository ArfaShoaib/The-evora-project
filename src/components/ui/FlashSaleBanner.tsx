'use client';

import * as React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface FlashSaleBannerProps {
  data: Record<string, unknown> | null;
}

export function FlashSaleBanner({ data }: FlashSaleBannerProps) {
  const active = (data?.active as boolean) ?? false;
  const title = (data?.title as string) || 'FLASH SALE';
  const subtitle = (data?.subtitle as string) || 'Up to 50% Off';
  const ctaText = (data?.cta_text as string) || 'Shop Now';
  const ctaLink = (data?.cta_link as string) || '/sale';

  if (!active) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-gold overflow-hidden border-b border-gold/30">
      <Link href={ctaLink} className="block group">
        <div className="flex items-center h-9 overflow-hidden">
          {/* Marquee track */}
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 mx-6 flex-shrink-0">
                <Zap className="size-3 text-black fill-black" />
                <span className="text-[11px] font-bold text-black tracking-[0.15em] uppercase">
                  {title}
                </span>
                <span className="text-[11px] text-black/60">—</span>
                <span className="text-[11px] font-semibold text-black/80 tracking-wider">
                  {subtitle}
                </span>
                <span className="text-[11px] text-black/60">—</span>
                <span className="text-[10px] font-bold text-black tracking-[0.2em] uppercase border border-black/20 px-2 py-0.5 group-hover:bg-black group-hover:text-gold transition-colors">
                  {ctaText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Link>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
