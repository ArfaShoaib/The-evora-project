import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | EVORA",
  description: "EVORA's terms and conditions of service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
        Terms & Conditions
      </h1>
      <p className="text-xs text-muted-foreground mb-8 text-center">Last updated: December 2024</p>

      <div className="prose prose-sm max-w-none flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">1. Acceptance</h2>
          <p>
            By accessing or using the EVORA website, you agree to be bound by these Terms
            and Conditions. If you do not agree, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">2. Products & Pricing</h2>
          <p>
            All product descriptions, images, and prices are subject to change without notice.
            We reserve the right to modify or discontinue products at any time.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">3. Orders</h2>
          <p>
            By placing an order, you are making an offer to purchase. We reserve the right
            to accept or decline any order at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">4. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and images, is
            the property of EVORA and protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
          <p>
            EVORA shall not be liable for any indirect, incidental, or consequential damages
            arising from the use of our products or website.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">6. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of New York, United States.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">7. Contact</h2>
          <p>
            For questions about these Terms, contact us at legal@evora.com.
          </p>
        </section>
      </div>
    </div>
  );
}