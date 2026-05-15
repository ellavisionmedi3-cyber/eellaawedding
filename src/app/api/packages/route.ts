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
