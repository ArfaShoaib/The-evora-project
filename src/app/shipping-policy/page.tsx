import type { Metadata } from "next";
import { getPageContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Shipping Policy | EVORA",
  description: "EVORA's shipping options, timelines, and international delivery info.",
};

const fallback = {
  title: "Shipping & Delivery",
  last_updated: "December 2024",
  sections: [
    {
      title: "Shipping Options",
      content: "Standard Shipping (5–7 business days) — Free over $250\nExpress Shipping (2–3 business days) — $15\nNext Day Delivery (Next business day) — $25",
    },
    {
      title: "International Shipping",
      content: "We ship to over 50 countries worldwide. International shipping rates are calculated at checkout based on destination and weight. Please note that customs duties and taxes may apply.",
    },
    {
      title: "Order Processing",
      content: "Orders are processed within 1–2 business days. You will receive a confirmation email with tracking information once your order ships.",
    },
    {
      title: "Questions?",
      content: "Contact our support team at support@evora.com for any shipping inquiries.",
    },
  ],
};

export default async function ShippingPolicyPage() {
  const content = await getPageContent("page_shipping");
  const data = {
    title: (content?.title as string) || fallback.title,
    last_updated: (content?.last_updated as string) || fallback.last_updated,
    sections: (content?.sections as Array<{ title: string; content: string }>) || fallback.sections,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
        {data.title}
      </h1>
      <p className="text-xs text-muted-foreground mb-8 text-center">Last updated: {data.last_updated}</p>

      <div className="prose prose-sm max-w-none flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        {data.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3">{section.title}</h2>
            {section.content.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
