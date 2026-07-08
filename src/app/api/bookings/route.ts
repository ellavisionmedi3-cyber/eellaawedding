import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Honeypot anti-spam filter
    if (data.website_url) {
      console.warn("[SPAM FILTER] Bot submission blocked.");
      return NextResponse.json({ success: true, spam: true });
    }

    await connectToDatabase();
    
    const newBooking = await Booking.create({
      client_name: data.client_name,
      mobile: data.mobile,
      email: data.email || "",
      event_type: data.event_type,
      venue_location: data.venue_location || "",
      package: data.package,
      additional_services: data.additional_services || "",
      notes: data.notes || "",
      status: "pending"
    });

    return NextResponse.json({ success: true, id: newBooking._id.toString() });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
