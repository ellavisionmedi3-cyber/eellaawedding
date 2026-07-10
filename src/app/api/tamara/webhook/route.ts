import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase, { Booking } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get Authorization header
    const authHeader = request.headers.get("Authorization") || "";
    let notificationToken = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      notificationToken = authHeader.substring(7);
    }
    
    // Verify notification token for security if configured
    const EXPECTED_TOKEN = process.env.TAMARA_NOTIFICATION_TOKEN;
    if (EXPECTED_TOKEN && notificationToken !== EXPECTED_TOKEN) {
      console.warn("[TAMARA WEBHOOK]: Unauthorized callback attempt. Received token:", notificationToken);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_type, order_reference_id, order_id } = body;
    console.log(`[TAMARA WEBHOOK] Event: ${event_type}, Order Reference: ${order_reference_id}, Tamara ID: ${order_id}`);

    await connectToDatabase();

    // Find the corresponding booking in the database
    let booking = null;
    if (order_reference_id && mongoose.Types.ObjectId.isValid(order_reference_id)) {
      booking = await Booking.findById(order_reference_id);
    }

    if (!booking && order_reference_id) {
      booking = await Booking.findOne({
        $or: [
          { client_name: order_reference_id },
          { additional_services: { $regex: order_reference_id, $options: "i" } }
        ]
      });
    }

    if (!booking) {
      console.warn(`[TAMARA WEBHOOK] No booking found matching reference: ${order_reference_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle Tamara Event Types mapping to DB status:
    // - approved -> الطلب قيد المعالجة (processing)
    // - authorized -> الدفع ناجح (confirmed)
    // - captured -> مكتمل (completed)
    // - cancelled -> ملغي (cancelled)
    // - refunded -> مسترجع (refunded)
    // - expired -> منتهي (expired)
    // - declined -> مرفوض (declined)
    let newStatus = booking.status;
    let paymentLogMessage = "";

    switch (event_type) {
      case "approved":
      case "order_approved":
        newStatus = "processing";
        paymentLogMessage = `[Tamara approved] order_id: ${order_id}`;
        break;

      case "authorized":
      case "order_authorized":
        newStatus = "confirmed";
        paymentLogMessage = `[Tamara authorized] order_id: ${order_id}`;
        break;

      case "captured":
      case "order_captured":
        newStatus = "completed";
        paymentLogMessage = `[Tamara captured] order_id: ${order_id}`;
        break;

      case "cancelled":
      case "order_cancelled":
        newStatus = "cancelled";
        paymentLogMessage = `[Tamara cancelled] order_id: ${order_id}`;
        break;

      case "refunded":
      case "order_refunded":
        newStatus = "refunded";
        paymentLogMessage = `[Tamara refunded] order_id: ${order_id}`;
        break;

      case "expired":
      case "order_expired":
        newStatus = "expired";
        paymentLogMessage = `[Tamara expired] order_id: ${order_id}`;
        break;

      case "declined":
      case "order_declined":
        newStatus = "declined";
        paymentLogMessage = `[Tamara declined] order_id: ${order_id}`;
        break;

      default:
        paymentLogMessage = `[Tamara webhook event: ${event_type}] order_id: ${order_id}`;
        console.log(`[TAMARA WEBHOOK] Unhandled event: ${event_type}`);
    }

    // Update booking status
    booking.status = newStatus;
    // Append to notes
    const currentNotes = booking.notes || "";
    booking.notes = `${currentNotes}\n[${new Date().toISOString()}] ${paymentLogMessage}`.trim();

    await booking.save();
    console.log(`[TAMARA WEBHOOK SUCCESS] Booking ${booking._id} status updated to ${newStatus}`);
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[TAMARA WEBHOOK EXCEPTION]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
