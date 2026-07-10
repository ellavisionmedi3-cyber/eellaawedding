import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { TeamMember } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    const team = await TeamMember.find().sort({ order: 1 });
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    await connectToDatabase();
    const member = await TeamMember.create(body);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
