import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { GalleryItem } from "@/lib/db";

export async function POST(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const data = await request.json();
    await connectToDatabase();
    
    const newItem = await GalleryItem.create({
      title: data.title || "Untitled",
      category: data.category || "Wedding",
      image_url: data.image_url || "",
      location: data.location || "",
      year: data.year || new Date().getFullYear(),
      featured: data.featured ? 1 : 0
    });

    return NextResponse.json({ success: true, id: newItem._id });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
