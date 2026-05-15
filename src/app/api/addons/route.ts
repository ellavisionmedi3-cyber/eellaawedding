import { NextResponse } from "next/server";
import connectToDatabase, { Addon } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    const addons = await Addon.find({ active: 1 });
    return NextResponse.json(addons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const addon = await Addon.create(body);
    return NextResponse.json(addon);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create addon" }, { status: 500 });
  }
}
