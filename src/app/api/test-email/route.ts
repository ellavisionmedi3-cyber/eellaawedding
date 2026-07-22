import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const mailHost = process.env.SMTP_HOST;
  const mailPort = process.env.SMTP_PORT;
  const mailUser = process.env.SMTP_USER;
  const mailPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;

  const configInfo = {
    SMTP_HOST: mailHost ? "DEFINED (value: " + mailHost + ")" : "UNDEFINED",
    SMTP_PORT: mailPort ? "DEFINED (value: " + mailPort + ")" : "UNDEFINED",
    SMTP_USER: mailUser ? "DEFINED (value: " + mailUser + ")" : "UNDEFINED",
    SMTP_PASS: mailPass ? "DEFINED (length: " + mailPass.length + " chars)" : "UNDEFINED",
    ADMIN_EMAIL: adminEmail ? "DEFINED (value: " + adminEmail + ")" : "UNDEFINED",
  };

  if (!mailHost || !mailUser || !mailPass || !adminEmail) {
    return NextResponse.json({
      success: false,
      message: "One or more SMTP environment variables are missing.",
      configInfo
    }, { status: 400 });
  }

  try {
    const portNum = parseInt(mailPort || "587");
    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: portNum,
      secure: portNum === 465,
      auth: {
        user: mailUser,
        pass: mailPass
      },
      tls: {
        rejectUnauthorized: false // Helps avoid SSL certificate validation errors
      },
      connectionTimeout: 10000 // 10 seconds timeout
    });

    // Verify connection configuration
    console.log("[SMTP TEST] Verifying transporter connection...");
    await transporter.verify();

    // Send a test email
    console.log("[SMTP TEST] Sending test email to:", adminEmail);
    const info = await transporter.sendMail({
      from: `"Ella Wedding Test" <${mailUser}>`,
      to: adminEmail,
      subject: "اختبار إرسال البريد الإلكتروني - موقع إيلا ميديا",
      text: "إذا وصلت هذه الرسالة، فهذا يعني أن إعدادات البريد الإلكتروني (SMTP) الخاصة بموقعك تعمل بنجاح وبشكل سليم!",
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 500px; margin: 0 auto; border: 2px solid #db2777; border-radius: 10px; padding: 20px;">
          <h2 style="color: #db2777; border-bottom: 1px solid #ddd; padding-bottom: 10px; text-align: center;">نجاح اختبار البريد! 🎉</h2>
          <p style="font-size: 16px; color: #333;">أهلاً بك،</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">هذه رسالة تأكيد تفيد بأن إعدادات البريد الإلكتروني (SMTP) الخاصة بك في Vercel قد تم إعدادها وربطها بنجاح وهي قادرة على إرسال الإشعارات الآن!</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #777; text-align: center;">إيلا ميديا للتصوير السينمائي - Ella Media</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
      configInfo
    });

  } catch (error: any) {
    console.error("[SMTP TEST ERROR]:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to send email. See the error details below.",
      error: {
        code: error.code,
        message: error.message,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      },
      configInfo
    }, { status: 500 });
  }
}
