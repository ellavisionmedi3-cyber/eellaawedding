import { NextResponse } from "next/server";
import connectToDatabase, { Package } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();
    
    // features and features_ar are sent as JSON strings from frontend in SQLite version, 
    // but in MongoDB we stored them as Strings in the schema just to be compatible, 
    // or we can store them as strings. Let's keep them as strings.
    const updateData = {
      name: data.name,
      name_ar: data.name_ar,
      price: data.price,
      description: data.description,
      description_ar: data.description_ar,
      features: typeof data.features === 'string' ? data.features : JSON.stringify(data.features),
      features_ar: typeof data.features_ar === 'string' ? data.features_ar : JSON.stringify(data.features_ar),
    };

    await Package.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}
