import { NextResponse } from "next/server";
import connectToDatabase, { Review } from "@/lib/db";
import { checkApiAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    
    await connectToDatabase();
    const query = all ? {} : { approved: 1 };
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(reviews.map(r => ({
      ...r,
      id: (r as any)._id.toString()
    })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    const newReview = await Review.create({
      client_name: data.client_name,
      client_name_ar: data.client_name_ar || data.client_name,
      comment: data.comment,
      comment_ar: data.comment_ar || data.comment,
      rating: data.rating || 5,
      approved: 0 // Default to unapproved for safety
    });

    return NextResponse.json({ success: true, id: newReview._id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const data = await request.json();
    await connectToDatabase();
    
    if (!data.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await Review.findByIdAndUpdate(data.id, data, { new: true });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await connectToDatabase();
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
