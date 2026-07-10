import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase, { SiteSetting } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { user, pass } = await request.json();

    await connectToDatabase();
    const dbSettings = await SiteSetting.find({ key: { $in: ["admin_username", "admin_password"] } }).lean();
    let adminUser = "admin";
    let adminPass = "Ee203120@#";
    
    for (const s of dbSettings as any[]) {
      if (s.key === "admin_username") adminUser = s.value;
      if (s.key === "admin_password") adminPass = s.value;
    }

    if (user === adminUser && pass === adminPass) {
      const token = crypto.createHash("sha256").update(`${adminUser}:${adminPass}:ayla2024`).digest("hex");
      
      const cookieStore = await cookies();
      cookieStore.set("ayla_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
