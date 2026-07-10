import type { Metadata } from "next";
import connectToDatabase, { GalleryItem } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Exclusive Wedding Photography Portfolio",
  description:
    "Explore our curated selection of weddings across Saudi Arabia. Each frame is a masterpiece of light, emotion, and exclusivity, tailored for the modern bride.",
};

export const revalidate = 30;

export default async function GalleryPage() {
  await connectToDatabase();
  const dbItems = await GalleryItem.find().sort({ featured: -1, created_at: -1 }).lean();
  
  const items = dbItems.map(item => {
    const id = (item as any)._id.toString();
    delete (item as any)._id;
    delete (item as any).__v;
    return { ...item, id };
  });

  const categories = ["All Collections", ...Array.from(new Set(items.map((i: any) => i.category)))];

  return <GalleryClient items={items} categories={categories} />;
}
