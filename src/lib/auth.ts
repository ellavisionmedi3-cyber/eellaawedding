import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectToDatabase, { SiteSetting } from "@/lib/db";
import crypto from "crypto";

export async function getAdminAuthStatus(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ayla_admin_token")?.value;
  if (!token) return false;

  await connectToDatabase();
  const dbSettings = await SiteSetting.find({ key: { $in: ["admin_username", "admin_password"] } }).lean();
  let adminUser = "admin";
  let adminPass = "Ee203120@#";
  
  for (const s of dbSettings as any[]) {
    if (s.key === "admin_username") adminUser = s.value;
    if (s.key === "admin_password") adminPass = s.value;
  }

  // Create expected hash
  const expectedToken = crypto.createHash("sha256").update(`${adminUser}:${adminPass}:ayla2024`).digest("hex");
  return token === expectedToken;
}

export async function checkApiAuth() {
  const isAuth = await getAdminAuthStatus();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
