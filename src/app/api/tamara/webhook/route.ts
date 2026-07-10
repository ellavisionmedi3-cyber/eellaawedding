import { NextResponse } from "next/server";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import connectToDatabase, { Booking } from "@/lib/db";

// Helper function to send email and WhatsApp alerts to admin
async function sendNotificationAlert(booking: any, eventType: string, orderId: string) {
  const mailHost = process.env.SMTP_HOST;
  const mailPort = parseInt(process.env.SMTP_PORT || "587");
  const mailUser = process.env.SMTP_USER;
  const mailPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;

  const orderRef = booking._id.toString();
  const clientName = booking.client_name;
  const clientMobile = booking.mobile;
  const clientEmail = booking.email || "غير محدد";
  const eventDate = booking.event_date || "غير محدد";
  const packageName = booking.package;
  const statusTranslation: Record<string, string> = {
    approved: "تمت الموافقة (قيد المعالجة)",
    authorized: "تم الدفع والاعتماد (ناجح)",
    captured: "تم تحصيل الدفعة بالكامل (مكتمل)",
    cancelled: "ملغي",
    refunded: "مسترجع",
    expired: "منتهي",
    declined: "مرفوض"
  };

  const statusText = statusTranslation[eventType] || eventType;

  const emailSubject = `[تمارا] تحديث حالة حجز العميل: ${clientName} (${statusText})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #FFB8CC; border-radius: 10px; padding: 20px; background-color: #fff;">
      <h2 style="color: #db2777; border-bottom: 2px solid #FFB8CC; padding-bottom: 10px;">إشعار مدفوعات تمارا (Tamara Payment)</h2>
      <p style="font-size: 16px; color: #333;">تم استقبال تحديث جديد لعملية حجز من بوابة تمارا:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right; width: 35%;">رقم الحجز (الموقع):</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #db2777;">${orderRef}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">رقم الطلب (تمارا):</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">${orderId}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">اسم العميلة:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${clientName}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">رقم الجوال:</th>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${clientMobile}">${clientMobile}</a></td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">البريد الإلكتروني:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${clientEmail}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">تاريخ المناسبة:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${eventDate}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">الباقة المطلوبة:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${packageName}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">حالة الدفع الحالية:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #16a34a;">${statusText}</td>
        </tr>
      </table>

      <p style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">يمكنك إدارة كافة الحجوزات وتفاصيلها من خلال لوحة تحكم الإدارة.</p>
    </div>
  `;

  // 1. Send Email Notification
  if (mailHost && mailUser && mailPass && adminEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465,
        auth: {
          user: mailUser,
          pass: mailPass
        }
      });

      await transporter.sendMail({
        from: `"${clientName} via website" <${mailUser}>`,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[TAMARA WEBHOOK ALERT] Email sent successfully to ${adminEmail}`);
    } catch (mailError) {
      console.error("[TAMARA WEBHOOK ALERT] Failed to send email alert:", mailError);
    }
  } else {
    console.log("[TAMARA WEBHOOK ALERT] SMTP mail credentials are not fully configured in env.");
  }

  // 2. Send WhatsApp Notification
  const waApiUrl = process.env.WHATSAPP_API_URL;
  const waToken = process.env.WHATSAPP_TOKEN;
  const waTo = process.env.WHATSAPP_TO;

  if (waApiUrl && waToken && waTo) {
    try {
      const waMsg = `📢 *إشعار تمارا جديد* 📢\n\n` +
        `• *اسم العميلة:* ${clientName}\n` +
        `• *رقم الجوال:* ${clientMobile}\n` +
        `• *تاريخ الحجز:* ${eventDate}\n` +
        `• *الباقة:* ${packageName}\n` +
        `• *حالة الدفع:* ${statusText}\n` +
        `• *رقم طلب تمارا:* ${orderId}\n` +
        `• *رقم الحجز:* ${booking._id.toString()}\n\n` +
        `رابط المحادثة مباشرة: https://wa.me/${clientMobile.replace(/[^0-9]/g, "")}`;

      const response = await fetch(waApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: waToken,
          to: waTo,
          body: waMsg,
          phone: waTo,
          message: waMsg
        })
      });

      if (response.ok) {
        console.log(`[TAMARA WEBHOOK ALERT] WhatsApp alert sent successfully to ${waTo}`);
      } else {
        const waErr = await response.text();
        console.warn("[TAMARA WEBHOOK ALERT] WhatsApp gateway returned error:", waErr);
      }
    } catch (waError) {
      console.error("[TAMARA WEBHOOK ALERT] Failed to send WhatsApp alert:", waError);
    }
  } else {
    console.log("[TAMARA WEBHOOK ALERT] WhatsApp credentials are not configured in env.");
  }
}

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
    
    // Trigger automated background notifications (Email & WhatsApp if configured)
    await sendNotificationAlert(booking, event_type, order_id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[TAMARA WEBHOOK EXCEPTION]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
