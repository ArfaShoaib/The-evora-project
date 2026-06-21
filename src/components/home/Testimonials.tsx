"use client";

import * as React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

interface TestimonialsProps {
  data?: Record<string, unknown> | null;
}

export function Testimonials({ data }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const items = (data?.items as Testimonial[]) || [];

  React.useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="What Our Customers Say"
          subtitle="Real stories from the EVORA community"
        />

        <div className="mt-12 relative max-w-3xl mx-auto">
          {/* Quote icon */}
          <div className="absolute -top-6 left-0 text-gold/20">
            <svg className="size-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Testimonial cards */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {items.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 px-8 py-12 text-center"
                >
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          "size-5",
                          i < testimonial.rating ? "text-gold" : "text-muted"
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="font-serif text-xl sm:text-2xl text-foreground leading-relaxed mb-8">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>

                  <div className="flex flex-col items-center gap-2">
                    <div className="size-12 rounded-full bg-gradient-to-br from-muted to-border" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {testimonial.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "size-2 rounded-full transition-all duration-300",
                  index === activeIndex ? "bg-gold w-6" : "bg-muted hover:bg-muted-foreground"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
