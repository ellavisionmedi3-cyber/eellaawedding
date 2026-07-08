import { NextResponse } from "next/server";
import connectToDatabase, { BlogPost } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectToDatabase();
    
    // In MongoDB we can find by slug
    const post = await BlogPost.findOne({ slug, published: 1 }).lean();
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    const id = (post as any)._id.toString();
    delete (post as any)._id;
    delete (post as any).__v;
    
    return NextResponse.json({ ...post, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await request.json();
    await connectToDatabase();
    
    const updateData = {
      title: data.title,
      title_ar: data.title_ar,
      excerpt: data.excerpt,
      excerpt_ar: data.excerpt_ar,
      content: data.content,
      content_ar: data.content_ar,
      image_url: data.image_url,
      category: data.category,
      category_ar: data.category_ar,
      author: data.author,
      read_time: data.read_time,
      read_time_ar: data.read_time_ar,
      published: data.published ? 1 : 0
    };

    // The frontend passes the ID in params.slug for PATCH
    await BlogPost.findByIdAndUpdate(slug, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectToDatabase();
    // The frontend passes the ID in params.slug for DELETE
    await BlogPost.findByIdAndDelete(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
