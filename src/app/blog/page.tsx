"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  image_url: string | null;
  category: string | null;
  category_ar: string | null;
  author: string;
  read_time: string | null;
  read_time_ar: string | null;
  created_at: string;
}

export default function BlogPage() {
  const { t, isRtl } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page" style={{ paddingTop: 200, textAlign: "center" }}>{t("common.loading")}</div>;

  const featured = posts[0];
  const rest = posts.slice(1);
  const categories = [t("blog.allStories"), ...Array.from(new Set(posts.map((p) => isRtl && p.category_ar ? p.category_ar : p.category).filter(Boolean)))];

  return (
    <div className="page" style={{ paddingTop: 100, paddingBottom: "var(--section-py)" }}>
      {/* Hero */}
      <header className="container" style={{ textAlign: "center", padding: "60px var(--px) 80px" }}>
        <span className="eyebrow anim-fade-up">{t("blog.eyebrow")}</span>
        <h1 className="anim-fade-up delay-1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: "var(--text)", marginBottom: 20, lineHeight: 1.1 }}>
          {t("blog.titlePart1")} <span className="grad-text" style={{ fontStyle: "italic" }}>{t("blog.titlePart2")}</span>
        </h1>
        <p className="anim-fade-up delay-2" style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.75 }}>
          {t("blog.desc")}
        </p>
      </header>

      {/* Featured Post */}
      {featured && (
        <section className="container reveal" style={{ marginBottom: 80 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            <Link href={`/blog/${featured.slug}`} className="card featured-card" style={{ gridColumn: "span 2", position: "relative", borderRadius: "var(--radius)", overflow: "hidden", aspectRatio: "16/9" }}>
              <img src={featured.image_url || ""} alt={isRtl && featured.title_ar ? featured.title_ar : featured.title} className="featured-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,17,20,0.95) 0%, rgba(26,17,20,0.3) 50%, transparent 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px", textAlign: isRtl ? "right" : "left" }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--pink)", marginBottom: 12 }}>{isRtl && featured.category_ar ? featured.category_ar : featured.category}</span>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 600, color: "var(--text)", marginBottom: 16, maxWidth: isRtl ? "100%" : "80%" }}>{isRtl && featured.title_ar ? featured.title_ar : featured.title}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-dim)", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span>{new Date(featured.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)" }} />
                  <span>{isRtl && featured.read_time_ar ? featured.read_time_ar : featured.read_time}</span>
                </div>
              </div>
            </Link>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {rest.slice(0, 2).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", [isRtl ? 'borderRight' : 'borderLeft']: "4px solid var(--pink)", textAlign: isRtl ? "right" : "left" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--cyan)", marginBottom: 8 }}>{isRtl && post.category_ar ? post.category_ar : post.category}</span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>{isRtl && post.title_ar ? post.title_ar : post.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>{isRtl && post.excerpt_ar ? post.excerpt_ar : post.excerpt}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--pink)", display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: "0.05em", flexDirection: isRtl ? "row-reverse" : "row" }}>
                    {t("blog.readArticle")} <span className="icon" style={{ fontSize: 14, transform: isRtl ? "rotate(180deg)" : "none" }}>arrow_forward</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="container reveal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600 }}>{t("blog.latest")}</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            {categories.map(cat => (
              <button key={cat as string} style={{ padding: "8px 20px", borderRadius: 50, fontSize: 11, fontWeight: 700, textTransform: "uppercase", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-dim)", cursor: "pointer" }}>{cat as string}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card" style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: isRtl ? "right" : "left" }}>
                <div style={{ aspectRatio: "4/5", borderRadius: "var(--radius)", overflow: "hidden", position: "relative", background: "var(--bg-3)" }}>
                  {post.image_url && <img src={getMediaUrl(post.image_url)} alt={isRtl && post.title_ar ? post.title_ar : post.title} className="blog-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }} />}
                  <div style={{ position: "absolute", top: 16, [isRtl ? 'right' : 'left']: 16, background: "rgba(26,17,20,0.8)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase" }}>{isRtl && post.category_ar ? post.category_ar : post.category}</div>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>{isRtl && post.title_ar ? post.title_ar : post.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{isRtl && post.excerpt_ar ? post.excerpt_ar : post.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,176,204,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="icon" style={{ fontSize: 14, color: "var(--pink)" }}>person</span></div>
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{post.author}</span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{isRtl && post.read_time_ar ? post.read_time_ar : post.read_time}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0", color: "var(--text-dim)" }}>
              {isRtl ? "لا توجد مقالات منشورة حالياً." : "No articles published yet."}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container reveal-scale" style={{ marginTop: 120 }}>
        <div className="card" style={{ padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,176,204,0.08), transparent 70%)", filter: "blur(60px)" }} />
           <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, marginBottom: 16 }}>{t("blog.newsletterTitle")}</h2>
           <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.7 }}>
             {t("blog.newsletterDesc")}
           </p>
           <form method="POST" action="/api/newsletter" style={{ display: "flex", gap: 12, maxWidth: 500, margin: "0 auto", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
             <input type="email" name="email" placeholder={t("blog.placeholder")} style={{ flex: 1, minWidth: 240, textAlign: isRtl ? "right" : "left" }} required />
             <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>{t("blog.subscribe")}</button>
           </form>
        </div>
      </section>
      
      <style>{`
        @media (max-width: 768px) {
          .card[style*="gridColumn: span 2"] { grid-column: span 1 !important; }
        }
        .featured-card:hover .featured-img { transform: scale(1.03); }
        .blog-card:hover .blog-img { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
