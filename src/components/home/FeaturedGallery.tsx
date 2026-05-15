"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getMediaUrl } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  title_ar: string | null;
  image_url: string;
  category: string | null;
  featured: boolean;
}

export default function FeaturedGallery({ items }: { items: GalleryItem[] }) {
  const { t, isRtl } = useLanguage();

  const displayItems = items.length > 0 ? items : [
    { id: '1', title: "Grand Ballroom", title_ar: "القاعة الكبرى", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8gl9ovfxB2jRQCTbyGZf00f_iGqtwraTMi6RiC-31fIzcfkziOS-_82iIRai8MMOQykDNG1aWi2DqM-Sm5PMIdyszDaIpsfr3p_LtjL4XecvYjuwelyEV7R6qS9FzoKq3BtMxcLFEJSOmnlGo4Fy6Sglxkfe1zfIi64z9zYmTOaHUBGHN85KAftGcoA3NOfTGkttHm6tyZfBFZsWQgvuhTa8p4MEtCMpOApbyZqsy-GqDFSo2fY5ORSS4cpNacMsTajnwbaN99II_", category: "Venue" },
    { id: '2', title: "Bridal Portrait", title_ar: "بورتريه العروس", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdyLkmidK3oJvKx6vUxTqmRtvA7WtgCYNAp1FR6lxXVCdiN4MyBwoZonvdjCxDvt7GDXcNYgSQ1T8WsxqFsTOQVCPrn0AH1uAVp9oGG4559NW4enFcXCY83ZcLH6ntnbzairJa2YBeLezklYs38fmFJl16fGBxMtTzkVJWyNcyNVSU3kcPukVpiNsZIjGJ9aoWeH1rera84DnIj4k6Vp_1D4bNDBmpB9xCe0AHLT-lQB-hlcykZV5jYqsksb9hCFD0T9k3nNdlh5G0", category: "Portrait" },
    { id: '3', title: "Details", title_ar: "تفاصيل", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF77GBu85vj4zea3frOBsCHs85VymHap5GXAOAvE8q_HxL9W4fZS8b6xwXoMshhG-osK6uIi7_TKp8EMFWqILCfIuFtDvZJ3H_nZy7xecie04OQ2fIXdGpK5dynXhcaoVbK_0-6lAq3PFe7YcPo2s6rXuXrC1WCQtEUzIWBFB1UjhHz9px3L-8zmHdTK-cFRjnhd_0LwWkMDR84eAu4dYnhAFRLKhZ8oMj-4LSErfeWigHJg7qp7-Yke_ABHtm57glaRbrqQemxPB4", category: "Macro" },
    { id: '4', title: "Grand Walk", title_ar: "المسيرة", image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1QLxw_iZ5pj5oqyuj-YKSX6CCd_zE4fN2Z2R2UZ0D1eYx4QlWAs1IQ3fO_jazdTNwjAPzsd_cTYzJdqm1y5KxUawgjpFW4Pgd9QUiyxoyc1S6LknwmWBqU8QOjYbY3l7rPZTvj-TWne8ReA0puQmP-ki2uWqD4YM3KV4dsicGQvBiZdM7wvY8DJZpC5aD-BM_WjOW8jzREaTw54BMTjl3SAmb0gfHWdg1n-4WMBXEXKCY3I2_B6aX1UbYb9JlDQy-WRtsgpi9VSec", category: "Action" },
  ];

  return (
    <section className="section" style={{ background: "var(--bg)" }}>
      <div className="container reveal">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <div style={{ textAlign: isRtl ? "right" : "left" }}>
            <span className="eyebrow">{t("gallery.curated")}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--text)" }}>
              {t("gallery.excellence")}
            </h2>
          </div>
          <Link href="/gallery" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--pink)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", transition: "gap 0.3s", flexDirection: isRtl ? "row-reverse" : "row" }}>
            {t("gallery.all")} <span className="icon" style={{ fontSize: 16, transform: isRtl ? "rotate(180deg)" : "none" }}>arrow_forward</span>
          </Link>
        </div>

        {/* Dynamic Bento Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
          {displayItems.map((item: any, i: number) => {
             // Calculate dynamic spans for aesthetic variety
             let gridSpan = "span 4";
             let aspectRatio = "4/5";
             
             if (i === 0 || i === 3) {
               gridSpan = "span 8";
               aspectRatio = "16/9";
             }
             
             return (
              <div key={item.id} className={`bento-item anim-scale-in`} style={{ gridColumn: gridSpan, aspectRatio: aspectRatio, animationDelay: `${i * 0.15}s`, position: "relative", overflow: "hidden", borderRadius: "var(--radius)", cursor: "pointer" }}>
                <img src={getMediaUrl(item.image_url)} alt={isRtl && item.title_ar ? item.title_ar : item.title} className="bento-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease", display: "block" }} />
                <div className="bento-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)", opacity: 0, transition: "opacity 0.3s", display: "flex", alignItems: "flex-end", padding: 24 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{isRtl && item.title_ar ? item.title_ar : item.title}</span>
                </div>
              </div>
             );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bento-item { grid-column: span 12 !important; }
        }
        .bento-item:hover .bento-img { transform: scale(1.05); }
        .bento-item:hover .bento-overlay { opacity: 1; }
      `}</style>
    </section>
  );
}
