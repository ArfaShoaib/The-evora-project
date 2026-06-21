import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EVORA",
  description: "EVORA's privacy policy and data protection practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
      <h1 className="font-serif text-4xl font-bold text-foreground mb-8 text-center">
        Privacy Policy
      </h1>
      <p className="text-xs text-muted-foreground mb-8 text-center">Last updated: December 2024</p>

      <div className="prose prose-sm max-w-none flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including your name, email address,
            shipping address, payment information, and any communications you send us.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
          <p>
            We use your information to process orders, send order updates, provide customer
            support, improve our services, and (with your consent) send marketing communications.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">3. Data Sharing</h2>
          <p>
            We share your information with trusted service providers who assist in operating
            our business (payment processing, shipping, analytics). We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise
            these rights, please contact us at privacy@evora.com.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
          <p>
            We use cookies to improve your browsing experience, analyze site traffic, and
            personalize content. You can control cookie settings through your browser.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">7. Contact</h2>
          <p>
            For questions about this policy, contact us at privacy@evora.com.
          </p>
        </section>
      </div>
    </div>
  );
}