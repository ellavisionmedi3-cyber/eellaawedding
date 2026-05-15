"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string | null;
  content_ar: string | null;
  image_url: string | null;
  category: string | null;
  category_ar: string | null;
  author: string;
  read_time: string | null;
  read_time_ar: string | null;
  created_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, isRtl } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/blog/${slug}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setPost(data);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) return <div className="page" style={{ paddingTop: 200, textAlign: "center" }}>{t("common.loading")}</div>;
  if (!post) return <div className="page" style={{ paddingTop: 200, textAlign: "center" }}>Post Not Found</div>;

  const title = isRtl && post.title_ar ? post.title_ar : post.title;
  const excerpt = isRtl && post.excerpt_ar ? post.excerpt_ar : post.excerpt;
  const content = isRtl && post.content_ar ? post.content_ar : post.content;
  const category = isRtl && post.category_ar ? post.category_ar : post.category;
  const readTime = isRtl && post.read_time_ar ? post.read_time_ar : post.read_time;

  return (
    <div className="page" style={{ paddingTop: 68 }}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "60vh", display: "flex", alignItems: "flex-end", paddingBottom: 60, overflow: "hidden" }}>
        {post.image_url && (
          <img src={post.image_url} alt={title || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, rgba(26,17,20,0.4) 100%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: isRtl ? "right" : "left" }}>
          <span className="eyebrow" style={{ color: "var(--pink)" }}>{category}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", marginBottom: 24, lineHeight: 1.1, maxWidth: 800 }}>
            {title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,176,204,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="icon" style={{ color: "var(--pink)", fontSize: 20 }}>person</span>
            </div>
            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{post.author}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                {new Date(post.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US", { month: "long", day: "numeric", year: "numeric" })} · {readTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="container reveal" style={{ maxWidth: 800, padding: "80px var(--px)", textAlign: isRtl ? "right" : "left" }}>
        {excerpt && (
          <p style={{ fontSize: 20, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 48, [isRtl ? 'borderRight' : 'borderLeft']: "4px solid var(--pink)", [isRtl ? 'paddingRight' : 'paddingLeft']: 32 }}>
            {excerpt}
          </p>
        )}
        
        <div style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.8 }}>
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p>
                {isRtl ? "تصوير حفلات الزفاف هو أكثر من مجرد التقاط صور - إنه يتعلق بالحفاظ على جوهر يومك الأكثر عزيزاً. في آيلا ميديا، نتعامل مع كل حفل زفاف كقصة فريدة تنتظر أن تُروى." : "Wedding photography is more than just taking pictures—it's about preserving the essence of your most cherished day. At Ayla Media, we approach every wedding as a unique story waiting to be told."}
              </p>
              <p>
                {isRtl ? "يفهم فريقنا من المصورات ذوات الخبرة الفروق الثقافية ومتطلبات الخصوصية لحفلات الزفاف السعودية. نحن نعمل بحذر لالتقاط اللحظات الأصيلة دون مقاطعة تدفق احتفالك." : "Our team of experienced female photographers understands the cultural nuances and privacy requirements of Saudi weddings. We work discreetly to capture authentic moments without interrupting the flow of your celebration."}
              </p>
              <p>
                {isRtl ? "من التفاصيل الحميمة لتحضيرات الزفاف الخاصة بك إلى الدخول الكبير الذي يمثل بداية فصلك الجديد، نحن نلتقط كل لحظة بدقة فنية وعمق عاطفي." : "From the intimate details of your bridal preparation to the grand entrance that marks the beginning of your new chapter, we capture every moment with artistic precision and emotional depth."}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Link href="/blog" style={{ fontSize: 12, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <span className="icon" style={{ fontSize: 16, transform: isRtl ? "rotate(180deg)" : "none" }}>arrow_back</span> {t("common.back")}
          </Link>
          <div style={{ display: "flex", gap: 16 }}>
             {["Share", "Save"].map(l => (
               <button key={l} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", border: "1px solid var(--border)", padding: "6px 16px", borderRadius: 20, cursor: "pointer", background: "none" }}>{l}</button>
             ))}
          </div>
        </div>
      </article>

      {/* Suggested Articles */}
      <section style={{ background: "var(--bg-2)", padding: "100px 0" }}>
        <div className="container reveal">
           <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginBottom: 40, textAlign: isRtl ? "right" : "left" }}>{isRtl ? "قصص موصى بها" : "Recommended Stories"}</h3>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
             <div className="card" style={{ padding: 32, textAlign: isRtl ? "right" : "left" }}>
               <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--cyan)" }}>{isRtl ? "تخطيط" : "Planning"}</span>
               <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, margin: "12px 0" }}>{isRtl ? "كيفية اختيار قاعة الزفاف في الرياض" : "How to Choose Your Wedding Venue in Riyadh"}</h4>
               <Link href="/blog" style={{ fontSize: 11, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase" }}>{isRtl ? "اقرأ المزيد" : "Read More"}</Link>
             </div>
             <div className="card" style={{ padding: 32, textAlign: isRtl ? "right" : "left" }}>
               <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--purple)" }}>{isRtl ? "أسلوب" : "Style"}</span>
               <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, margin: "12px 0" }}>{isRtl ? "جلسة تصوير العروس: البحث عن زاويتك" : "Bridal Portrait Masterclass: Finding Your Angle"}</h4>
               <Link href="/blog" style={{ fontSize: 11, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase" }}>{isRtl ? "اقرأ المزيد" : "Read More"}</Link>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
