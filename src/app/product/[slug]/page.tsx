import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { products as mockProducts } from "@/lib/mock-data";
import { ProductClient } from "./ProductClient";
import { RelatedProducts } from "./RelatedProducts";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumb";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | EVORA" };
  }

  return {
    title: `${product.name} | EVORA`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId, 4);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
  ];

  if (product.categorySlug) {
    breadcrumbItems.push({
      label: product.category,
      href: `/shop?categories=${product.categorySlug}`,
    });
  }

  if (product.subcategory) {
    breadcrumbItems.push({
      label: product.subcategory,
      href: `/shop?categories=${product.categorySlug}&subcategories=${encodeURIComponent(product.subcategory)}`,
    });
  }

  breadcrumbItems.push({ label: product.name });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mt-6">
        <ProductClient product={product} breadcrumbItems={breadcrumbItems} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
