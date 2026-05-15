"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function PricingTeaser() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();

  const cols = [
    { num: "01", title: t("investment.list.0.title"), desc: t("investment.list.0.desc") },
    { num: "02", title: t("investment.list.1.title"), desc: t("investment.list.1.desc") },
    { num: "03", title: t("investment.list.2.title"), desc: t("investment.list.2.desc") },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div className="reveal-left" style={{ textAlign: isRtl ? "right" : "left", order: isRtl ? 2 : 1 }}>
            <span className="eyebrow">{t("investment.eyebrow")}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 600, color: "var(--text)", marginBottom: 20, lineHeight: 1.15 }}>
              {t("investment.titlePart1")} <span className="grad-text">{t("investment.titlePart2")}</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 36 }}>
              {t("investment.desc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {cols.map(c => (
                <div key={c.num} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                  background: "var(--surface)", transition: "border-color 0.3s, background 0.3s", cursor: "pointer",
                  flexDirection: isRtl ? "row-reverse" : "row"
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,176,204,0.1)", color: "var(--pink)", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{c.num}</div>
                  <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 16, transform: isRtl ? "rotate(180deg)" : "none" }}>arrow_forward</span>
                </div>
              ))}
            </div>
            <Link href="/packages" className="btn btn-primary" style={{ flexDirection: isRtl ? "row-reverse" : "row", display: "inline-flex" }}>
              {t("investment.viewAll")} <span className="icon" style={{ fontSize: 16, transform: isRtl ? "rotate(180deg)" : "none" }}>arrow_forward</span>
            </Link>
          </div>

          {/* Right — image */}
          <div className="reveal-scale" style={{ position: "relative", order: isRtl ? 1 : 2 }}>
            <div style={{ position: "absolute", top: -40, [isRtl ? 'right' : 'left']: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,176,204,0.2), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", padding: 6, background: "var(--surface)" }}>
              <img
                src={settings?.pricing_teaser_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAFWsnJluTeMdkvTJSTwdMAoznM9M55Cti8ADXO01_XtdmOPsbCsAuzQEQ8MoWQyj31oR-356IB_u41obyVds-o4_Xvvo-QISyMzO2-LytDHkW8bTm3pZMkZOrL45fgF6Jhsb3nhV6qO4Koo1m1NNlEbVIp69Fgo6E8A2-ZhHcC_GMllFy3iQuFvbcmsjPw4izBsrET6GQQEeBMpzu75kLZjyelB15OR_3GESk5BM2-2YO4jwFwKs0HhivjC022i_SpSiJPOBcSTBGU"}
                alt="Luxury Package" style={{ width: "100%", maxHeight: 480, objectFit: "cover", borderRadius: 12, display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){
          .pricing-grid { grid-template-columns: 1fr !important; }
          .pricing-grid > div { order: unset !important; }
        }
      `}</style>
    </section>
  );
}
