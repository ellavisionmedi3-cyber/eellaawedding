import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { Service } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find().sort({ order: 1 });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectToDatabase();
    const service = await Service.create(body);
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
