"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsOfServicePage() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="page" style={{ paddingTop: "120px", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="container">
          <span className="eyebrow">{isRtl ? "شروط الخدمة والاستخدام" : "Terms & Conditions"}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "شروط الخدمة" : "Terms of Service"}
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
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. الاتفاقية والموافقة</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    باستخدامك لموقع **إيلا ميديا (Ella Media)** أو طلب حجز خدمات التصوير من خلاله، فإنكِ توافقين بالكامل على شروط الخدمة الموضحة أدناه. تسري هذه الشروط على جميع الحجوزات والتعاملات المباشرة والإلكترونية.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. التزامات العميل وتصاريح التصوير</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    تلتزم العميلة بتوفير بيئة عمل مناسبة وتسهيل عمل فريق التصوير عبر:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>استخراج كافة التصاريح اللازمة لدخول طاقم عمل الاستوديو النسائي إلى قاعة الزفاف أو موقع التصوير.</li>
                    <li>التنسيق مع إدارة قاعة الحفل والتأكد من مطابقة شروط الإضاءة ومواقع التصوير المتفق عليها.</li>
                    <li>توفير معلومات دقيقة حول مواعيد بدء الفقرات (زفة العروس، التجهيز، وغيرها) لتجنب أي فوات للقطات.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. شروط السداد والدفع بالتقسيط</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    تخضع آلية الدفع للضوابط التالية:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>يتم دفع عربون تأكيد بنسبة **30%** لتأمين الموعد.</li>
                    <li>يتم سداد المبلغ المتبقي البالغ **70%** في يوم المناسبة أو قبله مباشرة.</li>
                    <li>في حال اختيار الدفع بالتقسيط عبر منصة **تمارا**، يجب إكمال عملية الدفع والموافقة عليها قبل موعد الحجز، وتخضع المعاملات للشروط المالية الخاصة بمنصة تمارا والجهات التمويلية التابعة لها.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. حقوق الملكية وحماية الخصوصية</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    تظل حقوق الملكية الفكرية وحقوق النشر لكافة الصور والفيديوهات المنتجة مملوكة لاستوديو إيلا ميديا. يلتزم الاستوديو التزاماً صارماً بعدم استخدام أي من هذه الصور أو الفيديوهات لأغراض الدعاية أو العرض على الموقع أو منصات التواصل دون موافقة خطية صريحة وموقعة من العميلة. للعميلة كامل الحق في استخدام وتسجيل ومشاركة صورها الشخصية ومقاطع الفيديو للاستخدام الشخصي وغير التجاري.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. مواعيد تسليم المعارض والألبومات</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    يلتزم الاستوديو بتسليم الصور الرقمية المعدلة والنسخ الأولية للفيديو خلال فترة تتراوح بين **30 إلى 45 يوم عمل** من تاريخ المناسبة. قد تتطلب الألبومات المادية الفاخرة المطبوعة في إيطاليا فترة إضافية تصل إلى 15 يوم عمل للشحن والتجهيز النهائي.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>6. حدود المسؤولية</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    يبذل فريق عملنا قصارى جهده لتوثيق كل لحظة فنية بدقة سينمائية. ومع ذلك، لا يتحمل الاستوديو مسؤولية جودة الصور الناتجة عن سوء تنظيم القاعة، أو ضعف الإضاءة المتوفرة من القاعة، أو عدم التزام الأطراف الأخرى بمواعيد الحفل المتفق عليها.
                  </p>
                </div>
              </>
            ) : (
              // English Content
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. Acceptance of Terms</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    By accessing the **Ella Media** website or booking our photography services, you agree to comply with and be bound by the following terms and conditions. These terms apply to all digital bookings and direct agreements.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. Client Responsibilities & Venue Permits</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    The client is responsible for facilitating a smooth shooting experience by:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>Obtaining all necessary venue entry passes and shooting permits for our all-female crew.</li>
                    <li>Coordinating lighting arrangements and designated photo shoot locations with the wedding hall management.</li>
                    <li>Providing an accurate schedule of the event events (entrance, makeup prep, cake cutting) to ensure no moments are missed.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. Payment Terms & Tamara Installments</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    Payments for our packages are structured as follows:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>A **30%** deposit is required upon booking to secure your date.</li>
                    <li>The remaining **70%** balance is due on or immediately before the event day.</li>
                    <li>If you choose to pay in installments via **Tamara**, the application and authorization must be finalized before the event date, subject to Tamara's finance terms and credit policies.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. Copyright & Usage Rights</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    Copyright and ownership of all raw and edited photos/videos captured remain with Ella Media. We strictly commit never to use your private photos or videos for marketing, portfolio displays, or social media without your **explicit, signed written consent**. The client receives full non-commercial personal usage rights for all final delivered assets.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. Delivery Schedule</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    We deliver the initial edited digital gallery and video highlights within **30 to 45 business days** following the event. Luxury physical albums printed in Italy may require an additional 15 business days for custom design, printing, and international shipping.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>6. Limitation of Liability</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    While our crew utilizes state-of-the-art gear and artistic expertise to document your wedding, we are not liable for any compromises in quality caused by poor venue lighting, restrictions imposed by venue management, or scheduling delays outside our control.
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
