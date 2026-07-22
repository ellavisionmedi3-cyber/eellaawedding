"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="page" style={{ paddingTop: "120px", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="container">
          <span className="eyebrow">{isRtl ? "السياسات القانونية" : "Legal Policies"}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
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
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. مقدمة وخصوصيتكِ أولاً</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    نحن في **إيلا ميديا (Ella Media)** نضع خصوصية العروس والحاضرات في الحفلات والمناسبات كأولوية قصوى وجزء أساسي من هويتنا وخدماتنا. نلتزم بحماية بياناتك الشخصية وصورك بكافة الطرق الممكنة. جميع أفراد فريق العمل والإنتاج لدينا هم من الإناث المؤهلات لضمان توفير أعلى درجات الأمان والراحة والخصوصية.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. البيانات التي نجمعها</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    نقوم بجمع البيانات الشخصية التالية عند تقديم طلب حجز أو التواصل معنا:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>الاسم بالكامل للعميلة.</li>
                    <li>بيانات الاتصال (رقم الجوال والبريد الإلكتروني).</li>
                    <li>تفاصيل المناسبة (التاريخ، التوقيت، ونوع المناسبة).</li>
                    <li>موقع قاعة المناسبة (رابط أو عنوان).</li>
                    <li>أي تفاصيل أو ملاحظات إضافية تقدمينها.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. سرية الصور والوسائط الرقمية</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    كافة المواد المصورة (الصور الفوتوغرافية، مقاطع الفيديو، الملفات الرقمية) تعتبر سرية للغاية ومحمية بموجب أعلى معايير الأمان. **لا نقوم بنشر أو مشاركة أي صور أو فيديوهات** خاصة بمناسبتك على منصات التواصل الاجتماعي، موقعنا الإلكتروني، أو أي منصة عامة دون الحصول على **موافقة خطية وصريحة مسبقة** منكِ وعبر اتفاقية منفصلة.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. استخدام البيانات الشخصية</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    نستخدم معلوماتك لتقديم وتنسيق الخدمات التالية:
                  </p>
                  <ul style={{ paddingRight: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>التواصل معك وتأكيد طلبات الحجز.</li>
                    <li>تخصيص وإعداد فريق العمل وفق متطلبات مناسبتك.</li>
                    <li>معالجة عمليات الدفع والأقساط بالتنسيق مع شركائنا (بما في ذلك منصة **تمارا**).</li>
                    <li>تقديم الدعم الفني وتوصيل الألبومات المادية والملفات الرقمية.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. أمن البيانات وحمايتها</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    نطبق في إيلا ميديا بروتوكولات حماية تقنية متكاملة ومستمرة لضمان حماية خوادمنا وملفاتنا وقواعد بياناتنا من الاختراقات أو الدخول غير المصرح به. كما نقوم بتخزين الأصول والملفات المصورة على وحدات تخزين مشفرة ومؤمنة تماماً.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>6. التحديثات والتواصل</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    قد نقوم بتحديث سياسة الخصوصية الخاصة بنا لتتماشى مع الأنظمة أو التغييرات التقنية. في حال كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو رقم الواتساب الموضحين في صفحة الاتصال.
                  </p>
                </div>
              </>
            ) : (
              // English Content
              <>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>1. Introduction & Privacy First</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    At **Ella Media**, we hold the privacy of the bride, families, and guests as a core tenet of our brand and service. We commit to protecting your personal data and visual assets with the highest standards. Our entire onsite team and production staff are strictly female, ensuring full comfort, security, and absolute privacy.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>2. Personal Data We Collect</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    We collect the following personal information when you request a booking or contact us:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>Full Name.</li>
                    <li>Contact details (Mobile number and Email).</li>
                    <li>Event details (Date, time, and event type).</li>
                    <li>Event venue location (Google Maps link or address).</li>
                    <li>Any other custom requirements or notes you share.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>3. Confidentiality of Photos & Videos</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    All raw and edited media assets (photos, videos, digital files) are treated as strictly confidential. **We will never publish, share, or showcase** any media from your event on our website, social media, or any public space without obtaining your **explicit, prior written approval** through a separate agreement.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>4. How We Use Your Data</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 10 }}>
                    We use the collected information for the following purposes:
                  </p>
                  <ul style={{ paddingLeft: 20, color: "var(--text-muted)", lineHeight: 1.8, listStyleType: "disc" }}>
                    <li>Processing and confirming your booking request.</li>
                    <li>Scheduling and preparing the photography crew for your event.</li>
                    <li>Processing payments and installments in coordination with our partners (including **Tamara**).</li>
                    <li>Delivering physical albums and digital media download links.</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>5. Data Security</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    We implement modern technical and administrative security measures to protect database records and digital assets. Final files are stored in fully secure, encrypted drives accessible only by authorized staff.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--pink)", marginBottom: 14 }}>6. Revisions & Contact</h2>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
                    We may update this policy periodically to reflect operational changes or regulatory requirements. For inquiries regarding our privacy policy, please contact us via email or WhatsApp as displayed in our contact section.
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
