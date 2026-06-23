import type { Metadata } from "next";
import { getPageContent } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Returns & Exchanges | EVORA",
  description: "EVORA's return policy and exchange process.",
};

const fallback = {
  title: "Returns & Exchanges",
  last_updated: "December 2024",
  sections: [
    {
      title: "Return Policy",
      content: "We accept returns within 30 days of delivery. Items must be unworn, unwashed, with all original tags attached, and in their original packaging.",
    },
    {
      title: "How to Return",
      content: "1. Log into your account and go to your order history.\n2. Select the items you'd like to return and provide a reason.\n3. Download and print your prepaid return shipping label.\n4. Pack the items securely and drop off at your nearest carrier location.",
    },
    {
      title: "Refunds",
      content: "Refunds are processed within 5–7 business days of receiving your return. The refund will be credited to your original payment method.",
    },
    {
      title: "Exchanges",
      content: "For exchanges, please return the original item and place a new order for the desired item. This ensures you receive your replacement as quickly as possible.",
    },
    {
      title: "Non-Returnable Items",
      content: "Final sale items, swimwear with hygiene liners, and personalized products cannot be returned or exchanged.",
    },
    {
      title: "Questions?",
      content: "Contact our support team at support@evora.com for any return inquiries.",
    },
  ],
};

export default async function ReturnsPage() {
  const content = await getPageContent("page_returns");
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
