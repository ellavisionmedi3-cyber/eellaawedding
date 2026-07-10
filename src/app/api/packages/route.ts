import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { Package } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    const packages = await Package.find({ active: 1 }).sort({ price: 1 }).lean();
    return NextResponse.json(packages.map(p => {
      const id = (p as any)._id.toString();
      delete (p as any)._id;
      delete (p as any).__v;
      return { ...p, id };
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const data = await request.json();
    await connectToDatabase();

    const tier = data.tier || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'custom';

    const newPackage = await Package.create({
      name: data.name,
      name_ar: data.name_ar,
      tier: tier,
      price: data.price,
      description: data.description,
      description_ar: data.description_ar,
      features: typeof data.features === 'string' ? data.features : JSON.stringify(data.features || []),
      features_ar: typeof data.features_ar === 'string' ? data.features_ar : JSON.stringify(data.features_ar || []),
      active: 1,
      featured: 0
    });

    return NextResponse.json({ success: true, id: newPackage._id.toString() });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

