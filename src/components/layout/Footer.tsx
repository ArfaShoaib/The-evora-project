"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";
import { subscribeToNewsletter } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  pinterest: string;
}

const FOOTER_LINKS = {
  shop: [
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "All Products", href: "/shop" },
    { name: "Trending Now", href: "/trending" },
    { name: "Seasonal Campaign", href: "/collections" },
  ],
  customerCare: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs & Support", href: "/faq" },
    { name: "Shipping & Delivery", href: "/shipping-policy" },
    { name: "Returns & Exchanges", href: "/returns" },
    { name: "Order Tracking", href: "/track-order" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Store Directory", href: "/stores" },
    { name: "Corporate Info", href: "/about" },
  ],
};

export function Footer() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");
  const [subscribing, setSubscribing] = React.useState(false);
  const [socialLinks, setSocialLinks] = React.useState<SocialLinks>({
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    pinterest: "",
  });

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single()
      .then(({ data }) => {
        const val = (data as { value: SocialLinks } | null)?.value;
        if (val) {
          setSocialLinks(val);
        }
      });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const handleSubscribe = async (data: NewsletterInput) => {
    setSubscribing(true);
    setError("");
    const result = await subscribeToNewsletter(data.email);
    setSubscribing(false);
    if (result.success) {
      setIsSubmitted(true);
      reset();
    } else {
      setError(result.error || "Failed to subscribe");
    }
  };

  return (
    <footer className="bg-[#111111] text-zinc-300 border-t border-gold/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        
        {/* Top Grid section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand Presentation */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="select-none transition-opacity hover:opacity-90 flex flex-col items-start">
              <span className="font-serif font-bold text-2xl sm:text-3xl tracking-[0.2em] text-[#D4AF37]">
                EVORA
              </span>
              <div className="w-12 h-px bg-[#D4AF37] my-2" />
              <span className="font-serif italic text-xs tracking-wider text-[#D4AF37]/70">
                The Art of Everyday Luxury
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              EVORA offers premium fashion and lifestyle garments, blending modern, minimalist silhouettes with luxury materials. Guided by standards of high-end tailoring, we curate pieces made to endure.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="Instagram link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="Facebook link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="Twitter link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="TikTok link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="YouTube link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              )}
              {socialLinks.pinterest && (
                <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-zinc-700 hover:border-gold hover:text-white transition-colors" aria-label="Pinterest link">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 12a4 4 0 1 1 8 0c0 4-3 6-3 6" />
                    <path d="M9 18l1.5-6" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Directory Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-6 font-serif">
                Shop
              </h3>
              <ul className="flex flex-col gap-4 text-sm">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-6 font-serif">
                Support
              </h3>
              <ul className="flex flex-col gap-4 text-sm">
                {FOOTER_LINKS.customerCare.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase mb-6 font-serif">
                About
              </h3>
              <ul className="flex flex-col gap-4 text-sm">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Panel */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <h3 className="text-xs tracking-[0.2em] font-semibold text-white uppercase font-serif">
              Newsletter
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Subscribe to unlock early collections access, limited promotions, and seasonal campaign launches.
            </p>
            {isSubmitted ? (
              <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-gold/30 text-gold text-xs uppercase tracking-widest font-medium">
                <ShieldCheck className="h-5 w-5" />
                <span>Thank you for subscribing.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleSubscribe)} className="flex flex-col gap-3">
                <div className="relative border-b border-zinc-700 focus-within:border-gold transition-colors duration-300 py-1 flex items-center">
                  <Mail className="h-4 w-4 text-zinc-500 mr-2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full bg-black text-white hover:bg-gold hover:text-black py-3 px-4 text-xs tracking-[0.2em] font-medium uppercase transition-all duration-300 border border-zinc-700 hover:border-gold rounded-none disabled:opacity-50"
                >
                  {subscribing ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom copyright section */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} EVORA. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
            <Link href="/shipping-policy" className="hover:text-zinc-300">Shipping</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
