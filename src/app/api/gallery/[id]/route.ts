import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { GalleryItem } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectToDatabase();
    await GalleryItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
