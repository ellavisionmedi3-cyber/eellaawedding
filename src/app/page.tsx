import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturedGallery from "@/components/home/FeaturedGallery";
import ServicesSection from "@/components/home/ServicesSection";
import PricingTeaser from "@/components/home/PricingTeaser";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const metadata: Metadata = {
  title: "Ayla Media | Exclusive Female-Only Wedding Photography Saudi Arabia",
  description:
    "Exclusive female-only wedding photography for the modern Saudi bride. Capturing every whispered secret and luminous moment with cinematic precision.",
};

export const revalidate = 30;

import connectToDatabase, { GalleryItem } from "@/lib/db";

export default async function HomePage() {
  await connectToDatabase();
  const dbItems = await GalleryItem.find().sort({ featured: -1, created_at: -1 }).limit(6).lean();
  
  const items = dbItems.map(item => {
    const id = (item as any)._id.toString();
    delete (item as any)._id;
    delete (item as any).__v;
    return { ...item, id };
  });

  return (
    <div className="page-transition">
      <HeroSection />
      <FeaturedGallery items={items} />
      <ServicesSection />
      <PricingTeaser />
      <TestimonialsSection />
    </div>
  );
}
