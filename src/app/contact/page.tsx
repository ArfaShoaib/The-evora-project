import type { Metadata } from "next";
import { getPageContent } from "@/lib/queries";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | EVORA",
  description: "Get in touch with EVORA. We'd love to hear from you.",
};

const fallback = {
  title: "Get in Touch",
  subtitle: "We'd love to hear from you. Reach out with any questions or feedback.",
  email: "hello@evora.com",
  phone: "+1 (555) 123-4567",
  address: "123 Fashion Ave, New York, NY 10001",
};

export default async function ContactPage() {
  const content = await getPageContent("page_contact");
  const data = { ...fallback, ...content };

  return <ContactPageClient data={data} />;
}
