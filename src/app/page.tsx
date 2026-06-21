export const dynamic = 'force-dynamic';

import { HeroSection } from "@/components/home/HeroSection";
import { HeroBannerCarousel } from "@/components/home/HeroBannerCarousel";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { BestSellers } from "@/components/home/BestSellers";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { SeasonalCollection } from "@/components/home/SeasonalCollection";
import { SaleBanner } from "@/components/home/SaleBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { getNewArrivals, getBestSellers, getTrendingProducts, getSiteSectionContent, getActiveCollections, getActiveHeroBanners } from "@/lib/queries";

export default async function Home() {
  const [newArrivals, bestSellers, trending, saleBanner, seasonal, featuredCollections, testimonials, instagramGallery, collections, heroBanners] = await Promise.all([
    getNewArrivals(),
    getBestSellers(),
    getTrendingProducts(),
    getSiteSectionContent('sale_banner'),
    getSiteSectionContent('seasonal'),
    getSiteSectionContent('featured_collections'),
    getSiteSectionContent('testimonials'),
    getSiteSectionContent('instagram_gallery'),
    getActiveCollections(),
    getActiveHeroBanners(),
  ]);

  return (
    <>
      {heroBanners.length > 0 ? (
        <HeroBannerCarousel banners={heroBanners} />
      ) : (
        <HeroSection />
      )}

      {/* Page Sections */}
      <NewArrivals products={newArrivals.slice(0, 4)} />
      <FeaturedCollections collections={collections.slice(0, 4)} data={featuredCollections} />
      <BestSellers products={bestSellers.slice(0, 4)} />
      <TrendingProducts products={trending.slice(0, 4)} />
      <SeasonalCollection data={seasonal} />
      <SaleBanner data={saleBanner} />
      <Testimonials data={testimonials} />
      <InstagramGallery data={instagramGallery} />
    </>
  );
}
