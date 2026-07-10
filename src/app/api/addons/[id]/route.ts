import { checkApiAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDatabase, { Addon } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();
    const addon = await Addon.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(addon);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectToDatabase();
    await Addon.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 });
  }
}
