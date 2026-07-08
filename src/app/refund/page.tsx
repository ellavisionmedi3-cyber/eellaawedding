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
              // Arabic Content
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. طبيعة الخدمة وحجز الموعد</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    نظراً لأن الخدمات المقدمة من **إيلا ميديا (Ella Media)** هي خدمات حجز وتصوير وإنتاج مخصصة وحصرية وتعتمد على حجز تواريخ محددة لفريق العمل، فإننا نطبق سياسة حجز واسترجاع واضحة وعادلة لضمان حقوق العميل والاستوديو.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. سياسة العربون (الدُفعة المقدمة)</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    لتأكيد حجز تاريخ مناسبتكِ بشكل نهائي وحصري، يُطلب دفع عربون مقدم يبلغ **30% من إجمالي قيمة الباقة** المختارة. 
                    <br />
                    * **العربون غير مسترد** بمجرد إتمام الحجز، نظراً لأن الاستوديو يقوم برفض طلبات الحجز الأخرى لنفس التاريخ لضمان التفرغ الكامل لمناسبتكِ.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. سياسة إلغاء الحجز والاسترداد</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    في حال رغبة العميلة في إلغاء الحجز بالكامل، تطبق الشروط التالية:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc", marginBottom: 10 }}>
                    <li>**الإلغاء قبل أكثر من 30 يوماً من موعد المناسبة:** يتم الاحتفاظ بالعربون (30% من قيمة الباقة)، ويتم استرداد أي مبالغ إضافية تم دفعها تتجاوز قيمة العربون بالكامل.</li>
                    <li>**الإلغاء قبل 30 يوماً أو أقل من موعد المناسبة:** نظراً لضيق الوقت وصعوبة إعادة حجز التاريخ لعميلة أخرى، فإن إجمالي المبالغ المدفوعة (بما فيها العربون) تكون غير مستردة.</li>
                  </ul>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    * **طريقة الاسترداد:** يتم استرداد جميع المبالغ المستحقة والمؤهلة للاسترداد **إلى نفس وسيلة الدفع الأصلية** التي استخدمتها العميلة (بما في ذلك الحسابات المرتبطة ببوابة الدفع **تمارا** أو البطاقات الائتمانية والمدى) وتستغرق معالجة الاسترداد من 7 إلى 14 يوم عمل وفقاً لسياسات البنوك.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. سياسة تأجيل المناسبة (إعادة الجدولة)</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    نحن نتفهم حدوث ظروف طارئة تتطلب تغيير موعد المناسبة، لذا نتيح إمكانية إعادة الجدولة وفق الضوابط التالية:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>**التأجيل قبل 14 يوماً أو أكثر من موعد المناسبة:** يتم نقل الحجز والعربون مجاناً وبدون أي رسوم إضافية إلى الموعد الجديد المقترح، شريطة توفر فريق العمل في التاريخ الجديد.</li>
                    <li>**التأجيل قبل أقل من 14 يوماً من موعد المناسبة:** قد يترتب على التأجيل رسوم إدارية وإعادة جدولة تبلغ **15% من قيمة الباقة الإجمالية** لتغطية تكاليف التجهيز وحجز طاقم العمل.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. الحالات الاستثنائية والقوة القاهرة</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    في حالات القوة القاهرة المثبتة رسمياً (مثل الكوارث الطبيعية، القرارات الحكومية الطارئة التي تمنع إقامة الحفلات)، يتم الاتفاق بالتراضي على تأجيل موعد الحجز وتثبيت الحقوق للطرفين دون تطبيق أي غرامات إضافية.
                  </p>
                </div>
              </>
            ) : (
              // English Content
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. Nature of Service & Booking Exclusivity</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    Since the services provided by **Ayla Media** are customized, high-end photography bookings assigned to specific dates, we maintain a clear refund and cancellation policy to protect the interests of both our clients and our studio.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. Deposit Policy</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    To confirm and secure your event date exclusively, a non-refundable deposit of **30% of the total package value** is required.
                    <br />
                    * **The deposit is non-refundable** upon booking, as we immediately block the date and turn down other inquiries to dedicate our team to your wedding.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. Cancellation & Refund Policy</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    In the event that the client wishes to cancel the booking, the following conditions apply:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc", marginBottom: 10 }}>
                    <li>**Cancellation more than 30 days prior to the event date:** The 30% deposit is retained by the studio, and any additional payments made above the deposit will be fully refunded.</li>
                    <li>**Cancellation 30 days or less prior to the event date:** Due to the difficulty of rebooking the date on short notice, the total amount paid (including the deposit) is non-refundable.</li>
                  </ul>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    * **Refund Method:** All eligible refunds are processed back **to the original payment method** used at checkout (including **Tamara** installment accounts, credit cards, or Mada). Processing refunds typically takes 7 to 14 business days, depending on bank rules.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. Postponement & Rescheduling Policy</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    We understand that unexpected circumstances can arise. Rescheduling is permitted under the following terms:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>**Rescheduling 14 days or more before the event:** The deposit and booking will be transferred to the new date free of charge, subject to our crew's availability.</li>
                    <li>**Rescheduling less than 14 days before the event:** A rescheduling fee of **15% of the total package price** may apply to cover administrative costs and team restructuring.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. Force Majeure</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    In verified cases of force majeure (such as natural disasters or government-mandated restrictions preventing events), both parties will cooperate to postpone the event to an mutually agreed date without any penalties.
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
