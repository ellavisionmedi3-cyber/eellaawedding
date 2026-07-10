import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";
import nodemailer from "nodemailer";

// Helper function to send email to client when admin updates status
async function sendClientStatusEmail(booking: any, newStatus: string) {
  const mailHost = process.env.SMTP_HOST;
  const mailPort = parseInt(process.env.SMTP_PORT || "587");
  const mailUser = process.env.SMTP_USER;
  const mailPass = process.env.SMTP_PASS;

  // Verify email settings and client email exist
  if (!mailHost || !mailUser || !mailPass || !booking.email) {
    console.log("[STATUS EMAIL] SMTP not configured or client email missing. Skipping email.");
    return;
  }

  const clientName = booking.client_name;
  const packageName = booking.package;
  const eventDate = booking.event_date || "غير محدد";
  const venue = booking.venue_location || "غير محدد";

  let subject = "";
  let htmlContent = "";

  if (newStatus === "confirmed") {
    subject = `تأكيد حجز موعد تصوير زفافك - ايلا ميديا`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #FFB8CC; border-radius: 10px; padding: 25px; background-color: #fff;">
        <h2 style="color: #db2777; border-bottom: 2px solid #FFB8CC; padding-bottom: 10px; text-align: center;">تم تأكيد حجزك بنجاح! 🎉</h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">عزيزتي <strong>${clientName}</strong>،</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">يسعدنا إبلاغك بأنه تم تأكيد حجز موعد تصوير مناسبتك لدى فريق <strong>ايلا ميديا للتصوير السينمائي</strong> بنجاح.</p>
        
        <div style="background-color: #fff0f5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #FFB8CC;">
          <h3 style="margin-top: 0; color: #db2777;">تفاصيل مناسبتك:</h3>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>الباقة المختارة:</strong> ${packageName}</p>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>تاريخ الحجز:</strong> ${eventDate}</p>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>الموقع:</strong> ${venue}</p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">يتطلع فريقنا لتوثيق أجمل لحظاتك وصنع ذكريات سينمائية لا تُنسى في يومك المميز. سنقوم بالتواصل معكِ قبل موعد الحفل لمناقشة التفاصيل والترتيبات النهائية.</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">إذا كان لديكِ أي استفسارات، يمكنكِ دائماً التواصل معنا مباشرة عبر الواتساب.</p>
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="font-size: 14px; color: #777;">مع كل الحب والتقدير،<br/><strong>فريق ايلا ميديا للتصوير السينمائي</strong></p>
        </div>
      </div>
    `;
  } else if (newStatus === "completed") {
    subject = `اكتملت جلسة تصوير مناسبتك بنجاح - ايلا ميديا`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #FFB8CC; border-radius: 10px; padding: 25px; background-color: #fff;">
        <h2 style="color: #16a34a; border-bottom: 2px solid #ddd; padding-bottom: 10px; text-align: center;">تم تنفيذ الخدمة بنجاح! 📸</h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">عزيزتي <strong>${clientName}</strong>،</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">نهنئكِ بمناسبة زفافك السعيد، ويسعدنا إخباركِ بأنه تم الانتهاء وتوثيق يومك المميز بنجاح من قِبل فريق <strong>ايلا ميديا للتصوير السينمائي</strong>.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #16a34a;">
          <p style="margin: 8px 0; font-size: 15px;">• <strong>الباقة:</strong> ${packageName}</p>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>تاريخ التصوير:</strong> ${eventDate}</p>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>حالة الحجز:</strong> منفذ / مكتمل</p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">فريق العمل يقوم حالياً بمعالجة الفيديوهات والصور سينمائياً للخروج بأفضل جودة ممكنة. سنقوم بالتواصل معكِ فور تجهيز المواد لتسليمها لكِ وفق مواعيد العمل المتفق عليها.</p>
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="font-size: 14px; color: #777;">نشكركِ لاختياركِ لنا لمشاركتكِ أجمل لحظاتك،<br/><strong>فريق ايلا ميديا للتصوير السينمائي</strong></p>
        </div>
      </div>
    `;
  } else if (newStatus === "cancelled") {
    subject = `إلغاء حجز موعد تصوير مناسبتك - ايلا ميديا`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #ccc; border-radius: 10px; padding: 25px; background-color: #fff;">
        <h2 style="color: #666; border-bottom: 2px solid #ccc; padding-bottom: 10px; text-align: center;">إشعار إلغاء حجز</h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">مرحباً <strong>${clientName}</strong>،</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">نود إخطاركِ بأنه تم إلغاء حجز موعد تصوير مناسبتك بناءً على طلبك أو لعدم اكتمال إجراءات الدفع.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd;">
          <p style="margin: 8px 0; font-size: 15px;">• <strong>الباقة:</strong> ${packageName}</p>
          <p style="margin: 8px 0; font-size: 15px;">• <strong>التاريخ الملغي:</strong> ${eventDate}</p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.6;">إذا كان هناك أي سوء تفاهم أو كنت ترغبين في إعادة جدولة الموعد، يرجى التواصل معنا في أقرب وقت.</p>
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p style="font-size: 14px; color: #777;"><strong>ايلا ميديا للتصوير السينمائي</strong></p>
        </div>
      </div>
    `;
  }

  if (subject && htmlContent) {
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
        from: `"ايلا ميديا للتصوير السينمائي" <${mailUser}>`,
        to: booking.email,
        subject: subject,
        html: htmlContent
      });
      console.log(`[STATUS EMAIL SUCCESS] Email sent to client: ${booking.email} for status: ${newStatus}`);
    } catch (error) {
      console.error("[STATUS EMAIL ERROR] Failed to send status email to client:", error);
    }
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();
    
    // Find the current booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const oldStatus = booking.status;
    const newStatus = data.status;

    // Update the booking status
    booking.status = newStatus;
    await booking.save();

    // If status changed to confirmed, completed, or cancelled, send email to client
    const notifyStatuses = ["confirmed", "completed", "cancelled"];
    if (newStatus !== oldStatus && notifyStatuses.includes(newStatus)) {
      await sendClientStatusEmail(booking, newStatus);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await Booking.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
