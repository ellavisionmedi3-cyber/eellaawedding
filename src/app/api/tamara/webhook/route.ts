import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notificationToken = request.headers.get("Authorization");
    
    // Verify notification token for security if configured
    const EXPECTED_TOKEN = process.env.TAMARA_NOTIFICATION_TOKEN;
    if (EXPECTED_TOKEN && notificationToken !== `Bearer ${EXPECTED_TOKEN}`) {
      console.warn("[TAMARA WEBHOOK]: Unauthorized callback attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_type, order_reference_id, order_id } = body;
    console.log(`[TAMARA WEBHOOK] Received event: ${event_type} for order reference: ${order_reference_id}`);

    await connectToDatabase();

    // Find the corresponding booking in the database
    // We try to match by either our order reference id (client_name/generated id)
    // Or check if it's stored in notes or additional_services
    const booking = await Booking.findOne({
      $or: [
        { id: order_reference_id },
        { client_name: order_reference_id },
        { additional_services: { $regex: order_reference_id, $options: "i" } }
      ]
    });

    if (!booking) {
      console.warn(`[TAMARA WEBHOOK] No booking found matching reference: ${order_reference_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle Tamara Event Types
    switch (event_type) {
      case "order_approved":
      case "order_authorized":
        // Order authorized/approved by Tamara, ready for capturing
        booking.status = "confirmed";
        booking.notes = `${booking.notes}\n[Tamara ID: ${order_id}]\n[Payment Status: AUTHORIZED]`;
        break;

      case "order_captured":
        // Payment captured successfully
        booking.status = "confirmed";
        booking.notes = `${booking.notes}\n[Payment Status: CAPTURED/PAID]`;
        break;

      case "order_canceled":
      case "order_declined":
        booking.status = "cancelled";
        booking.notes = `${booking.notes}\n[Payment Status: CANCELLED/DECLINED]`;
        break;

      default:
        console.log(`[TAMARA WEBHOOK] Unhandled event: ${event_type}`);
    }

    await booking.save();
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[TAMARA WEBHOOK EXCEPTION]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
