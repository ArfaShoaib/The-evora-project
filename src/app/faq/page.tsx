import type { Metadata } from "next";
import { getPageContent } from "@/lib/queries";
import { FaqPageClient } from "./FaqPageClient";

export const metadata: Metadata = {
  title: "FAQ | EVORA",
  description: "Frequently asked questions about shopping with EVORA.",
};

const fallback = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about shopping with EVORA.",
  categories: [
    {
      title: "Orders",
      questions: [
        { q: "How do I place an order?", a: "Browse our shop, add items to your bag, and proceed to checkout. You can pay with credit card, PayPal, or Apple Pay." },
        { q: "Can I modify or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team." },
        { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard." },
      ],
    },
    {
      title: "Shipping",
      questions: [
        { q: "What are the shipping options?", a: "We offer Standard (5–7 days), Express (2–3 days), and Next Day delivery. Standard shipping is free on orders over $250." },
        { q: "Do you ship internationally?", a: "Yes! We ship to over 50 countries. International shipping rates are calculated at checkout." },
      ],
    },
    {
      title: "Returns",
      questions: [
        { q: "What is your return policy?", a: "We accept returns within 30 days of delivery. Items must be unworn, with tags attached, in original packaging." },
        { q: "How do I start a return?", a: "Log into your account, go to Orders, and select the items you'd like to return. You'll receive a prepaid shipping label." },
        { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days of receiving the returned items." },
      ],
    },
    {
      title: "Account",
      questions: [
        { q: "How do I create an account?", a: "Click 'Register' in the top navigation. You can also create an account during checkout." },
        { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the login page and follow the instructions sent to your email." },
      ],
    },
    {
      title: "Payments",
      questions: [
        { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay." },
        { q: "Is my payment information secure?", a: "Yes. All payments are processed through Stripe with industry-standard encryption. We never store your card details." },
      ],
    },
  ],
};

export default async function FaqPage() {
  const content = await getPageContent("page_faq");
  const data = {
    ...fallback,
    ...content,
    categories: Array.isArray(content?.categories) && content.categories.length > 0
      ? content.categories
      : fallback.categories,
  };

  return <FaqPageClient data={data} />;
}
