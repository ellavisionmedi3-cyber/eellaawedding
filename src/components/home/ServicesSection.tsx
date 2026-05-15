"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function ServicesSection() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();

  const services = [
    { icon: "female", color: "var(--pink)", bg: "rgba(255,176,204,0.08)", title: t("services.list.0.title"), desc: t("services.list.0.desc") },
    { icon: "movie", color: "var(--cyan)", bg: "rgba(145,205,255,0.08)", title: t("services.list.1.title"), desc: t("services.list.1.desc") },
    { icon: "auto_awesome", color: "var(--purple)", bg: "rgba(209,188,255,0.08)", title: t("services.list.2.title"), desc: t("services.list.2.desc") },
  ];

  return (
    <section className="section" style={{ background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
      {/* Background Image */}
      <div data-parallax="0.15" style={{ position: "absolute", inset: 0, backgroundImage: `url('${settings?.global_bg_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN"}')`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.1, mixBlendMode: "overlay", pointerEvents: "none", transition: "transform 0.15s ease-out" }} />
      <div className="container reveal">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="eyebrow">{t("services.eyebrow")}</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
            {t("services.title")}
          </h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>
            {t("services.desc")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {services.map((p, i) => (
            <div key={i} className="card anim-fade-up hover-lift" style={{ 
              animationDelay: `${i * 0.15}s`, 
              padding: "48px 36px", 
              textAlign: "center", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center" 
            }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                <span className="icon" style={{ color: p.color, fontSize: 26 }}>{p.icon}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
