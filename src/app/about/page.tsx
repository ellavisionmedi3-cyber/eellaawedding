"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function AboutPage() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const [teamList, setTeamList] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/team").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setTeamList(data);
    });
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={settings?.about_hero_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Sr6W0aL_2WIN21DmaOCATeQ5Zkd_p_UvgLbLYJWXatWYrvoUwzeTzU71IomIX1yDNw-kygUx_NYsYNbpLlJHNUMgKA5Ny_Wszh7f5RX3KgGo1hvUjg8FF9MDk4PLqy976vfEsJrZGh6WZuG82Z1hWkLZYuFFCKJlvoP4c1wIQDy1TlPBETkGEmu9FZvj7t9HN1ta7WlEi11v6l8qFZHiSRhRQGazQ86S7mUS_3wI1eT8jVG7mSzrSj5Tt8LpUr2ow1VgkEFDwMEM"}
            alt="About" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, var(--bg))" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="eyebrow anim-fade-up">{t("about.heritage")}</span>
          <h1 className="anim-fade-up delay-1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(42px, 6vw, 72px)", fontWeight: 700, color: "var(--text)", marginBottom: 24, lineHeight: 1.1 }}>
            {t("about.title")}
          </h1>
          <p className="anim-fade-up delay-2" style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
            {t("about.desc")}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 80, alignItems: "center" }}>
            <div className="reveal-left" style={{ position: "relative" }}>
              <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", padding: 8, background: "var(--surface)" }}>
                <img
                  src={settings?.about_vision_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAiIbjHTbKDUe_kwH47A6Fa3rn5g7x-7JWlV7eDKumE6nUePSFpnmQe0VM3o979cPHpO-q0yLAd2WIC3elFtr2Eo2ION8OCzfYspZjH8gurfTLGpXJEOzEdw_gdOJkrsBtX8FQ4eq1qyh0Jht7TsqsIAxN65AI1L9bc2Gx047UBEAuRB2flJx-1yW9TMZSHdxM-5y278Q0UzEaZNbaekRSlkYYd-IJAD1u7v3-cE5dfZyqQoITCY8de21MBEb3P0qw6aaXQ6ioQsi_g"}
                  alt="Vision" style={{ width: "100%", height: "auto", borderRadius: "calc(var(--radius) - 8px)" }}
                />
              </div>
            </div>
            <div className="reveal" style={{ textAlign: isRtl ? "right" : "left" }}>
              <span className="eyebrow">{t("about.eyebrow")}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--text)", marginBottom: 24 }}>
                {t("about.visionTitle")} <span className="grad-text">{t("about.visionSpan")}</span>
              </h2>
              <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>
                {t("about.visionDesc")}
              </p>
              <Link href="/gallery" className="btn btn-primary">{t("hero.viewPortfolio")}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section" style={{ background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
        <div data-parallax="0.08" style={{ position: "absolute", inset: 0, backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.04, mixBlendMode: "luminosity", pointerEvents: "none", transition: "transform 0.15s ease-out" }} />
        <div className="container reveal">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600 }}>{t("about.pillars")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { icon: "shield_person", color: "var(--pink)", bg: "rgba(255,176,204,0.1)", title: t("about.list.0.title"), desc: t("about.list.0.desc") },
              { icon: "auto_fix_high", color: "var(--cyan)", bg: "rgba(145,205,255,0.1)", title: t("about.list.1.title"), desc: t("about.list.1.desc") },
              { icon: "star", color: "var(--purple)", bg: "rgba(209,188,255,0.1)", title: t("about.list.2.title"), desc: t("about.list.2.desc") },
            ].map((p, i) => (
              <div key={i} className="card" style={{ padding: 40, textAlign: isRtl ? "right" : "left" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, margin: isRtl ? "0 0 28px auto" : "0 auto 28px 0" }}>
                  <span className="icon" style={{ color: p.color, fontSize: 24 }}>{p.icon}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 16 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container reveal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 20, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <div style={{ maxWidth: 500, textAlign: isRtl ? "right" : "left" }}>
              <span className="eyebrow">{t("about.artisans")}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600 }}>{t("about.ledBy")}</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {Array.isArray(teamList) && teamList.map((m: any, i: number) => {
              const images = [
                settings?.about_team_1_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuARSYl-dyL6YPrsdEHG4IP8gQ6MOvp2JrcPs1d_euFGEnKJwuXLlwmKNGgTjlKi2-pP98Bty3-CTif5rqSnY4pLeQeKNyv4s2dju1FDw7LAZhdHqOULMCeEyZC-5omg30ERdACP9yBnt0WBGZnioXWx3C_i7ui9wOVdthM1B-JSWbQ0_OHolskTBkWwoZBjOpzyrg-32o2oEll2uTGfAUWnYQ3PJl-mFAtHOxzxbqk3jK59qcwDmVp5Tas7Org4KoLT4R10vdmDBwss",
                settings?.about_team_2_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAHKKUMMEwSYQTJSHHVi6vR9HNDaE04n6YVLU8TwJwEOX3aHW6KH8QtQz_mkOJDu44VL-qTFWzwZimVnouZd3Jso99q0w4lTA8YVRAWHWuJud9IAE586lA7lpSrK9LazrZgV6PYMbORHv3dEoYOb1T0lH2gIlNfnLFAvzAXGIRoq77R2vILBezKjoU3Da1KfS-5v34a43cIxV0U04jogmUV90XJmD07KHvCNG5VIhTM4j7mf2XGHb_yyiWHkY1O2X7AbS_XBhVR3beR",
                settings?.about_team_3_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuC3KfROc4OkeZUesjuJMPEn8jPfi8_xg_xMitgyw8M5sJTwFVDz3YEiaHP5BifEHV7ESwyoQnuM1IPSykXdvPnZhCTvjo-MJvdFduoCjnY6LH9aNLfbo15Y150NMGI81YTBFR9LJ5Tr4kxeuoGRNQEvgbI-mv0uu6D99OMch_CVF_kA6m1Kv_niun-8dt3VDkm9ALSpJ48Ro466U7fzHmS9QTgUh9u0PJwdU2UBtrVTLWC6qJlDUewFosovZ_XyJ_jx5Noj5AK9Uxng",
                settings?.about_team_4_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuD6DnM0EtsiNOMQCEpQ2J3hMpqB-q4NrCsNdS2rdS0l0NOEqT267qdr1H2291qmzyNq2bJfLXP6mRCRFUNNSuS3GsDEGKZO-KuIVjuk_lUi619KDDjYNkS763u60T5uSFO59r_-7SVjHIF-cJ3iiIYCG5IyHt9HxiJ_M5OoakhuGqTLgQ0caU7ni5t4EMsBz4IU2O2im-BfgRkCfSQReA5GbFkO4vYGpZ6v-BD3RRUJ6Y87zWR0QjcNCpDDnklv_UzkQKj8tY6ePwe_"
              ];
              return (
                <div key={m.id || i} className="team-item" style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: isRtl ? "right" : "left" }}>
                  <div 
                    onClick={() => setActiveImg(m.image_url || images[i % 4])}
                    style={{ aspectRatio: "3/4", borderRadius: "var(--radius)", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                    <img src={m.image_url || images[i % 4]} alt={isRtl ? m.name_ar : m.name} className="team-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s, filter 0.5s", filter: "grayscale(100%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", padding: 20, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--pink)" }}>{isRtl ? (m.role_ar || m.role) : m.role}</span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{isRtl ? (m.name_ar || m.name) : m.name}</h4>
                    <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", marginTop: 4 }}>{isRtl ? (m.role_ar || m.role) : m.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container reveal-scale">
          <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", padding: "80px 40px", textAlign: "center", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
             <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 600, marginBottom: 20 }}>{t("gallery.ctaTitle")}</h2>
             <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
               {t("about.ctaDesc")}
             </p>
             <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
               <Link href="/contact" className="btn btn-primary">{t("about.inquireNow")}</Link>
               <Link href="/packages" className="btn btn-outline">{t("about.pricingGuide")}</Link>
             </div>
          </div>
        </div>
      </section>
      <style>{`
        .team-item:hover .team-img { transform: scale(1.08); filter: grayscale(0%) !important; }
      `}</style>

      {activeImg && (
        <div 
          onClick={() => setActiveImg(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, cursor: "zoom-out" }}>
          <img 
            src={activeImg} 
            alt="Full view" 
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", animation: "zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} 
          />
          <button style={{ position: "absolute", top: 30, [isRtl ? 'left' : 'right']: 30, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <span className="icon" style={{ fontSize: 32 }}>close</span>
          </button>
          <style>{`@keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
}
