"use client";

import * as React from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";

export function Newsletter() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = (_data: NewsletterInput) => {
    setIsSubmitted(true);
    reset();
  };

  return (
    <section className="py-16 lg:py-24 bg-dark-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="size-12 h-0.5 bg-gold mx-auto mb-6" />

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-background mb-4">
            Stay in the Know
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe for early access to new collections, exclusive offers, and style inspiration.
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-background/5 border border-gold/20 text-gold">
              <ShieldCheck className="size-5" />
              <span className="text-sm tracking-wider uppercase font-medium">
                Thank you for subscribing
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3.5 bg-background/5 border border-background/10 text-background placeholder-muted-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gold text-foreground text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          )}
          {errors.email && (
            <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
