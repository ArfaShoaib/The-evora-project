"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  const safeImages = images?.length ? images : ["/mockpic.webp"];
  const displayImages = safeImages.length > 0 ? safeImages : ["/mockpic.webp"];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px]">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "flex-shrink-0 size-16 sm:w-20 sm:h-24 border-2 transition-colors",
              selectedIndex === index
                ? "border-gold"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <Image
              src={image || "/mockpic.webp"}
              alt={`Thumbnail ${index + 1}`}
              width={80}
              height={96}
              unoptimized
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="relative flex-1 aspect-[3/4] overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={displayImages[selectedIndex] || "/mockpic.webp"}
          alt="Product"
          fill
          unoptimized
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-transform duration-300",
            isZoomed && "scale-110"
          )}
        />
      </div>
    </div>
  );
}