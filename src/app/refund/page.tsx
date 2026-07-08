"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function RefundPolicyPage() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="page" style={{ paddingTop: "120px", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="container">
          <span className="eyebrow">{isRtl ? "شروط الاسترجاع والإلغاء" : "Cancellation & Refund Policies"}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "سياسة الاستبدال والاسترجاع" : "Return & Refund Policy"}
          </h1>
          <div className="divider" style={{ maxWidth: "200px", margin: "24px auto" }} />
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ paddingBottom: "120px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="card" style={{ padding: "40px", background: "var(--bg-3)", display: "flex", flexDirection: "column", gap: 32, textAlign: isRtl ? "right" : "left" }}>
            
            {isRtl ? (
              // Arabic Content (Requested text updated to use "إيلا ميديا")
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>سياسة إلغاء الحجوزات واسترداد الأموال</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    نظراً لطبيعة خدماتنا في **"إيلا ميديا"** والتي تتطلب حجز وتخصيص طاقم نسائي كامل ومعدات لكل مناسبة على حدة، فإننا نطبق سياسة الإلغاء والاسترجاع التالية لضمان حقوق جميع الأطراف:
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>تأكيد الحجز والعربون</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    يتطلب تأكيد الحجز دفع عربون (أو دفعة أولى عبر تمارا). يعتبر هذا العربون غير مسترد في حال الإلغاء من طرف العميل، وذلك لتغطية تكاليف حجز اليوم المخصص للمناسبة ومنع استقبال حجوزات أخرى لنفس التاريخ.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>الإلغاء قبل المناسبة بـ 30 يوماً أو أكثر</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    في حال طلب الإلغاء، يتم استرجاع المبالغ المدفوعة بالكامل (باستثناء قيمة العربون غير المسترد).
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>الإلغاء قبل المناسبة بـ 15 إلى 29 يوماً</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    يتم استرجاع 50% من إجمالي المبالغ المدفوعة.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>الإلغاء قبل المناسبة بأقل من 14 يوماً</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    نعتذر عن استرجاع أي مبالغ مالية في هذه الحالة، نظراً لصعوبة تعويض الحجز وتوفير عميل بديل في هذا الوقت الضيق.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>تأجيل أو تغيير الموعد</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    يحق للعميل طلب تأجيل الموعد مرة واحدة مجاناً، بشرط إبلاغنا قبل 14 يوماً على الأقل من الموعد الأصلي، ويخضع قبول التأجيل لتوفر الموعد الجديد في جدول حجوزاتنا.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>آلية الاسترجاع</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    تتم معالجة المبالغ المستردة وإعادتها عبر نفس طريقة الدفع المستخدمة (بما في ذلك بوابة تمارا) خلال 7 إلى 14 يوم عمل.
                  </p>
                </div>
              </>
            ) : (
              // English Content
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>Booking Cancellation & Refund Policy</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    Due to the nature of our services at **"Ella Media,"** which require booking and dedicating a full all-female crew and specialized equipment for each event individually, we apply the following cancellation and refund policy to protect the rights of all parties:
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Booking Confirmation & Deposit</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    A deposit (or first payment via Tamara) is required to secure the booking. This deposit is non-refundable in the event of cancellation by the client, in order to cover the costs of reserving the date and declining other bookings.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Cancellation 30 Days or More Prior</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    In case of cancellation, all amounts paid will be fully refunded, except for the non-refundable deposit.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Cancellation Between 15 to 29 Days Prior</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    50% of the total amount paid will be refunded.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Cancellation Less Than 14 Days Prior</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    We apologize as no refunds can be made in this case, due to the difficulty of rebooking the date on short notice.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Rescheduling & Date Changes</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    The client is entitled to reschedule the date once for free, provided we are notified at least 14 days prior to the original date. Rescheduling is subject to date availability in our booking schedule.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--pink)", marginBottom: 14 }}>Refund Processing</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    Eligible refunds are processed and returned via the same payment method used (including Tamara portal) within 7 to 14 business days.
                  </p>
                </div>
              </>
            )}
            
          </div>
        </div>
      </section>
    </div>
  );
}
