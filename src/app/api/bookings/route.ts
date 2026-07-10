import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";
import nodemailer from "nodemailer";

// Helper function to send Telegram alert to admin
async function sendTelegramAlert(booking: any, title: string, statusText: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[TELEGRAM ALERT] Token or Chat ID not configured. Skipping Telegram.");
    return;
  }

  const orderRef = booking._id.toString();
  const clientName = booking.client_name;
  const clientMobile = booking.mobile;
  const clientEmail = booking.email || "غير محدد";
  const eventDate = booking.event_date || "غير محدد";
  const venue = booking.venue_location || "غير محدد";
  const packageName = booking.package;
  const paymentMethod = booking.payment_method === "tamara" ? "تمارا" : booking.payment_method === "mada" ? "مدى" : (booking.payment_method === "cash" ? "كاش / تحويل بنكي" : "بطاقة ائتمانية");

  const messageText = 
    `🔔 <b>${title}</b> 🔔\n\n` +
    `• <b>رقم الحجز:</b> <code>${orderRef}</code>\n` +
    `• <b>العميلة:</b> ${clientName}\n` +
    `• <b>الجوال:</b> ${clientMobile}\n` +
    `• <b>البريد:</b> ${clientEmail}\n` +
    `• <b>التاريخ:</b> ${eventDate}\n` +
    `• <b>الموقع:</b> ${venue}\n` +
    `• <b>الباقة:</b> ${packageName}\n` +
    `• <b>طريقة الدفع:</b> ${paymentMethod}\n` +
    `• <b>حالة الحجز:</b> ${statusText}\n\n` +
    `🔗 <a href="https://wa.me/${clientMobile.replace(/[^0-9]/g, "")}">محادثة واتساب مباشرة</a>`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
    if (res.ok) {
      console.log("[TELEGRAM ALERT SUCCESS] Sent notification to chat:", chatId);
    } else {
      const errText = await res.text();
      console.warn("[TELEGRAM ALERT ERROR] Telegram returned error:", errText);
    }
  } catch (error) {
    console.error("[TELEGRAM ALERT EXCEPTION] Failed to send telegram notification:", error);
  }
}

// Helper function to send email & WhatsApp notifications to admin upon new booking creation
async function sendAdminNewBookingEmail(booking: any) {
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
  const venue = booking.venue_location || "غير محدد";
  const packageName = booking.package;
  const notes = booking.notes || "لا يوجد";
  const paymentMethodLabel = booking.payment_method === "tamara" ? "تمارا" : booking.payment_method === "mada" ? "مدى" : "بطاقة";
  const paymentStatusLabel = booking.payment_status === "authorized" ? "تم تفويض الدفع" : booking.payment_status === "paid" ? "مدفوع" : "قيد الانتظار";

  // 1. Send Email Notification to Admin
  if (mailHost && mailUser && mailPass && adminEmail) {
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

  // 2. Send WhatsApp Notification to Admin
  const waApiUrl = process.env.WHATSAPP_API_URL;
  const waToken = process.env.WHATSAPP_TOKEN;
  const waTo = process.env.WHATSAPP_TO;

  if (waApiUrl && waToken && waTo) {
    try {
      const waMsg = `🔔 *طلب حجز جديد (ايلا ميديا)* 🔔\n\n` +
        `• *العميلة:* ${clientName}\n` +
        `• *الجوال:* ${clientMobile}\n` +
        `• *التاريخ:* ${eventDate}\n` +
        `• *الموقع:* ${venue}\n` +
        `• *الباقة:* ${packageName}\n` +
        `• *طريقة الدفع:* ${paymentMethodLabel}\n` +
        `• *حالة الدفع:* ${paymentStatusLabel}\n` +
        `• *رقم الحجز:* ${orderRef}\n\n` +
        `رابط محادثة العميلة مباشرة: https://wa.me/${clientMobile.replace(/[^0-9]/g, "")}`;

      let response;
      if (waApiUrl.includes("callmebot.com")) {
        const queryParams = new URLSearchParams({
          phone: waTo,
          text: waMsg,
          apikey: waToken
        });
        response = await fetch(`${waApiUrl}?${queryParams.toString()}`);
      } else {
        response = await fetch(waApiUrl, {
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
      }

      if (response.ok) {
        console.log(`[ADMIN NEW BOOKING WA SUCCESS] WhatsApp notification sent to ${waTo}`);
      } else {
        const errText = await response.text();
        console.warn("[ADMIN NEW BOOKING WA ERROR] WhatsApp gateway returned error:", errText);
      }
    } catch (error) {
      console.error("[ADMIN NEW BOOKING WA ERROR] Failed to send WhatsApp notification:", error);
    }
  }
}

// Helper function to send receipt email to the client upon creation
async function sendClientNewBookingEmail(booking: any) {
  const mailHost = process.env.SMTP_HOST;
  const mailPort = parseInt(process.env.SMTP_PORT || "587");
  const mailUser = process.env.SMTP_USER;
  const mailPass = process.env.SMTP_PASS;

  if (!mailHost || !mailUser || !mailPass || !booking.email) {
    console.log("[CLIENT NEW BOOKING EMAIL] SMTP not configured or client email missing.");
    return;
  }

  const clientName = booking.client_name;
  const packageName = booking.package;
  const eventDate = booking.event_date || "غير محدد";
  const orderRef = booking._id.toString();

  const subject = `تم استلام طلب حجزك بنجاح - ايلا ميديا`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #FFB8CC; border-radius: 10px; padding: 25px; background-color: #fff;">
      <h2 style="color: #db2777; border-bottom: 2px solid #FFB8CC; padding-bottom: 10px; text-align: center;">تم استلام طلب حجزك بنجاح 🎉</h2>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">عزيزتي <strong>${clientName}</strong>،</p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">شكراً لكِ لتواصلكِ مع فريقنا. لقد تم استلام طلب حجزك وتفاصيل مناسبتك بنجاح عبر موقعنا الإلكتروني.</p>
      
      <div style="background-color: #fff0f5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #FFB8CC;">
        <h3 style="margin-top: 0; color: #db2777; font-size: 16px;">تفاصيل طلب الحجز:</h3>
        <p style="margin: 8px 0; font-size: 15px;">• <strong>رقم الحجز:</strong> ${orderRef}</p>
        <p style="margin: 8px 0; font-size: 15px;">• <strong>الباقة المختارة:</strong> ${packageName}</p>
        <p style="margin: 8px 0; font-size: 15px;">• <strong>تاريخ الحجز:</strong> ${eventDate}</p>
        <p style="margin: 8px 0; font-size: 15px;">• <strong>حالة الطلب:</strong> قيد المراجعة / الانتظار</p>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">سيقوم فريق <strong>ايلا ميديا للتصوير السينمائي</strong> بمراجعة تفاصيل طلبك وجدول المواعيد، وسنتواصل معكِ قريباً لتأكيد الموعد النهائي والتنسيق.</p>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
        <p style="font-size: 14px; color: #777;">مع كل الحب،<br/><strong>فريق ايلا ميديا للتصوير السينمائي</strong></p>
      </div>
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
      from: `"ايلا ميديا للتصوير السينمائي" <${mailUser}>`,
      to: booking.email,
      subject: subject,
      html: htmlContent
    });
    console.log(`[CLIENT NEW BOOKING EMAIL SUCCESS] Receipt email sent to client: ${booking.email}`);
  } catch (error) {
    console.error("[CLIENT NEW BOOKING EMAIL ERROR] Failed to send receipt email to client:", error);
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

    // Send email/whatsapp alert to admin (non-blocking)
    sendAdminNewBookingEmail(newBooking).catch(err => {
      console.error("[ADMIN EMAIL ERROR] Failed to send new booking alert asynchronously:", err);
    });

    // Send receipt email to client (non-blocking)
    sendClientNewBookingEmail(newBooking).catch(err => {
      console.error("[CLIENT EMAIL ERROR] Failed to send client receipt alert asynchronously:", err);
    });

    // Send Telegram alert to admin (non-blocking)
    sendTelegramAlert(newBooking, "طلب حجز جديد", "قيد الانتظار").catch(err => {
      console.error("[TELEGRAM EMAIL ERROR] Failed to send Telegram alert asynchronously:", err);
    });

    return NextResponse.json({ success: true, id: newBooking._id.toString() });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
