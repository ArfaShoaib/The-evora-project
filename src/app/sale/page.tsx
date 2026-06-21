import type { Metadata } from "next";
import { getSaleProducts } from "@/lib/queries";
import { SalePageContent } from "./SalePageContent";

export const metadata: Metadata = {
  title: "Sale | EVORA",
  description: "Exclusive offers on luxury fashion pieces — limited time only.",
};

export default async function SalePage() {
  const saleProducts = await getSaleProducts();

  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <div className="w-16 h-0.5 bg-gold mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Sale
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Limited time offers on select styles
          </p>
        </div>

        <SalePageContent products={saleProducts} />
      </div>
    </section>
  );
}
