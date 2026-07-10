import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";
import nodemailer from "nodemailer";

// Helper function to send email notification to admin upon new booking creation
async function sendAdminNewBookingEmail(booking: any) {
  const mailHost = process.env.SMTP_HOST;
  const mailPort = parseInt(process.env.SMTP_PORT || "587");
  const mailUser = process.env.SMTP_USER;
  const mailPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;

  // Check if SMTP is configured
  if (!mailHost || !mailUser || !mailPass || !adminEmail) {
    console.log("[ADMIN NEW BOOKING EMAIL] SMTP not configured. Skipping email alert.");
    return;
  }

  const orderRef = booking._id.toString();
  const clientName = booking.client_name;
  const clientMobile = booking.mobile;
  const clientEmail = booking.email || "غير محدد";
  const eventDate = booking.event_date || "غير محدد";
  const venue = booking.venue_location || "غير محدد";
  const packageName = booking.package;
  const additional = booking.additional_services || "لا يوجد";
  const notes = booking.notes || "لا يوجد";
  const paymentMethodLabel = booking.payment_method === "tamara" ? "تمارا" : booking.payment_method === "mada" ? "مدى" : "بطاقة";
  const paymentStatusLabel = booking.payment_status === "authorized" ? "تم تفويض الدفع" : booking.payment_status === "paid" ? "مدفوع" : "قيد الانتظار";

  const emailSubject = `[طلب حجز جديد] تم تقديم طلب من العميلة: ${clientName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #FFB8CC; border-radius: 10px; padding: 20px; background-color: #fff;">
      <h2 style="color: #db2777; border-bottom: 2px solid #FFB8CC; padding-bottom: 10px;">طلب حجز جديد 🔔</h2>
      <p style="font-size: 16px; color: #333;">لقد تلقيت طلب حجز واستفسار جديد من الموقع:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right; width: 35%;">رقم الحجز:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #db2777;">${orderRef}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">اسم العميلة:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${clientName}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">رقم الجوال:</th>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${clientMobile}">${clientMobile}</a></td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">البريد الإلكتروني:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${clientEmail}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">تاريخ المناسبة:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${eventDate}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">الموقع / القاعة:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${venue}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">الباقة المختارة:</th>
          <td style="padding: 10px; border: 1px solid #ddd; color: #db2777; font-weight: bold;">${packageName}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">طريقة الدفع:</th>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${paymentMethodLabel}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">حالة الدفع:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${paymentStatusLabel}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">ملاحظات إضافية:</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${notes}</td>
        </tr>
      </table>

      <p style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">يمكنك عرض كافة التفاصيل والتحكم بالحجز من لوحة تحكم الإدارة.</p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465,
      auth: {
        user: mailUser,
        pass: mailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"${clientName} via Ayla Media" <${mailUser}>`,
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml
    });
    console.log(`[ADMIN NEW BOOKING EMAIL SUCCESS] Notification sent to ${adminEmail}`);
  } catch (error) {
    console.error("[ADMIN NEW BOOKING EMAIL ERROR] Failed to send email to admin:", error);
  }
}

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
      event_date: data.event_date || "",
      venue_location: data.venue_location || "",
      package: data.package,
      additional_services: data.additional_services || "",
      notes: data.notes || "",
      status: "pending",
      payment_method: data.payment_method || "card",
      payment_status: data.payment_status || "pending",
      amount: data.amount || 0
    });

    // Send email alert to admin (non-blocking for client response)
    sendAdminNewBookingEmail(newBooking).catch(err => {
      console.error("[ADMIN EMAIL ERROR] Failed to send new booking alert asynchronously:", err);
    });

    return NextResponse.json({ success: true, id: newBooking._id.toString() });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
