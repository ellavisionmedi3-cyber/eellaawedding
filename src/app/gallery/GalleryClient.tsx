"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getMediaUrl } from "@/lib/utils";

interface GalleryItem { id: number; title: string; category: string; image_url: string; location: string|null; year: number|null; featured: number; }

export default function GalleryClient({ items, categories }: { items: GalleryItem[]; categories: string[] }) {
  const { t, isRtl } = useLanguage();
  const [active, setActive] = useState(t("gallery.all"));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const allLabel = t("gallery.all");
  const filtered = active === allLabel ? items : items.filter(i => i.category === active);

  const displayCategories = [allLabel, ...categories.filter(c => c !== "All Collections")];

  return (
    <div className="page" style={{ paddingTop: 100, paddingBottom: "var(--section-py)" }}>
      {/* Hero */}
      <div className="container" style={{ textAlign: "center", padding: "60px var(--px) 80px" }}>
        <span className="eyebrow">{t("gallery.eyebrow")}</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: "var(--text)", marginBottom: 20, lineHeight: 1.1 }}>
          {t("gallery.titlePart1")} <span className="grad-text" style={{ fontStyle: "italic" }}>{t("gallery.titlePart2")}</span> {t("gallery.titlePart3")}
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
          {t("gallery.desc")}
        </p>
      </div>

      {/* Filters */}
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 60, flexDirection: isRtl ? "row-reverse" : "row" }}>
        {displayCategories.map(cat => (
          <button key={cat} onClick={() => setActive(cat)} style={{
            padding: "10px 22px", borderRadius: 50, fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
            transition: "all 0.25s",
            background: active === cat ? "var(--pink)" : "var(--surface)",
            color: active === cat ? "#640038" : "var(--text-muted)",
            border: active === cat ? "1px solid transparent" : "1px solid var(--border)",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry */}
      <div className="container">
        <div className="masonry reveal">
          {filtered.map(item => (
            <div 
              key={item.id} 
              className="masonry-item gallery-card" 
              onClick={() => setSelectedImage(item.image_url)}
              style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius)", cursor: "pointer" }}
            >
              <img 
                src={getMediaUrl(item.image_url)} 
                alt={item.title} 
                loading="lazy" 
                className="gallery-img bw-to-color" 
                style={{ width: "100%", height: "auto", display: "block", transition: "all 0.6s ease" }} 
              />
              <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)", opacity: 0, transition: "opacity 0.3s", pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20, textAlign: isRtl ? "right" : "left" }}>
                {item.location && <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--pink)", marginBottom: 4 }}>{item.location} {item.year && `, ${item.year}`}</span>}
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff" }}>{item.title}</h3>
              </div>
              {item.featured === 1 && <div style={{ position: "absolute", top: 12, [isRtl ? 'left' : 'right']: 12, background: "var(--pink)", color: "#640038", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20 }}>{isRtl ? "مميز" : "Featured"}</div>}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, cursor: "zoom-out" }}
          >
            <img 
              src={getMediaUrl(selectedImage)} 
              alt="Full Size" 
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 50px rgba(0,0,0,0.5)" }} 
            />
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: "absolute", top: 30, right: 30, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <span className="icon" style={{ fontSize: 40 }}>close</span>
            </button>
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <button className="btn btn-outline">{t("gallery.loadMore")}</button>
        </div>
      </div>

      {/* CTA */}
      <div className="container" style={{ marginTop: "var(--section-py)" }}>
        <div className="card reveal-scale" style={{ padding: "clamp(40px, 6vw, 80px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>{t("gallery.ctaTitle")}</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
            {t("gallery.ctaDesc")}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Link href="/contact" className="btn btn-primary">{t("gallery.ctaBook")}</Link>
            <Link href="/packages" className="btn btn-outline">{t("gallery.ctaPricing")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
