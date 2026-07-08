"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Package { 
  id: string; 
  name: string; 
  name_ar?: string;
  tier: string; 
  price: number; 
  description: string; 
  description_ar?: string;
  features: string; 
  features_ar?: string;
  featured: number; 
  active: number; 
}

export default function PackagesPage() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    fetch('/api/packages').then(res => res.json()).then(data => setPackages(data));
  }, []);

  // Get FAQ array from translations
  const faqList = t("packages.faq") as any;

  return (
    <div className="page" style={{ paddingTop: 100, paddingBottom: "var(--section-py)" }}>
      {/* Hero */}
      <div className="container" style={{ textAlign: "center", padding: "60px var(--px) 80px" }}>
        <span className="eyebrow anim-fade-up">{t("packages.eyebrow")}</span>
        <h1 className="anim-fade-up delay-1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: "var(--text)", marginBottom: 20, lineHeight: 1.1 }}>
          {t("packages.titlePart1")} <span className="grad-text" style={{ fontStyle: "italic" }}>{t("packages.titlePart2")}</span>
        </h1>
        <p className="anim-fade-up delay-2" style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
          {t("packages.desc")}
        </p>
      </div>

      {/* Pricing cards */}
      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div data-parallax="0.1" style={{ position: "absolute", inset: 0, backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1, mixBlendMode: "luminosity", pointerEvents: "none", transition: "transform 0.15s ease-out" }} />
        <div className="container reveal">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
            {packages.map(pkg => {
              const name = isRtl && pkg.name_ar ? pkg.name_ar : pkg.name;
              const description = isRtl && pkg.description_ar ? pkg.description_ar : pkg.description;
              const featuresJson = isRtl && pkg.features_ar ? pkg.features_ar : pkg.features;
              const features: string[] = JSON.parse(featuresJson || "[]");
              const featured = pkg.featured === 1;
              return (
                <div key={pkg.id} className="hover-lift" style={{
                  padding: "40px 32px",
                  borderRadius: "var(--radius)",
                  border: featured ? "1px solid transparent" : "1px solid var(--border)",
                  background: featured
                    ? "linear-gradient(var(--bg-3), var(--bg-3)) padding-box, linear-gradient(135deg, var(--pink-deep), var(--cyan)) border-box"
                    : "var(--surface)",
                  position: "relative",
                  transform: featured ? "scale(1.03)" : "scale(1)",
                  zIndex: featured ? 2 : 1,
                  textAlign: isRtl ? "right" : "left"
                }}>
                  {featured && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--pink)", color: "#640038", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 16px", borderRadius: 20 }}>
                      {t("packages.mostRequested")}
                    </div>
                  )}
                  <div style={{ marginBottom: 28 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: featured ? "var(--pink-deep)" : "var(--pink)" }}>{name}</span>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 700, color: "var(--text)", margin: "10px 0 12px" }}>{pkg.price.toLocaleString()} <span style={{ fontSize: 20 }}>{t("packages.currency")}</span></div>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{description}</p>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                    {features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span className="icon icon-fill" style={{ color: featured ? "var(--pink-deep)" : "var(--pink)", fontSize: 18, flexShrink: 0, marginTop: 2 }}>check_circle</span>
                        <span style={{ fontSize: 14, color: "var(--text)", fontWeight: featured ? 500 : 400 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href={`/checkout?package=${pkg.tier}`}
                    className={featured ? "btn btn-primary" : "btn btn-outline"} 
                    style={{ width: "100%", display: "flex", justifyContent: "center" }}
                  >
                    {featured ? t("packages.bookSignature") : t("packages.reserve")}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container reveal" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--text)", textAlign: "center", marginBottom: 48 }}>{t("packages.faqTitle")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.isArray(faqList) && faqList.map((item: any, i: number) => (
              <details key={i} className="card" style={{ padding: "20px 24px", cursor: "pointer", textAlign: isRtl ? "right" : "left" }}>
                <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, fontWeight: 600, color: "var(--text)", userSelect: "none", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  {item.q}
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 22, flexShrink: 0, [isRtl ? 'marginRight' : 'marginLeft']: 16 }}>expand_more</span>
                </summary>
                <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
