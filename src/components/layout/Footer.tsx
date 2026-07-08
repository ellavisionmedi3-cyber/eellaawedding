"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();

  const navLinks = [
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/about", label: t("nav.about") },
    { href: "/packages", label: t("nav.pricing") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const socialLinks = [
    { key: "social_whatsapp", icon: "chat", href: settings?.social_whatsapp ? `https://wa.me/${settings.social_whatsapp}` : null },
    { key: "social_instagram", icon: "photo_camera", href: settings?.social_instagram },
    { key: "social_tiktok", icon: "movie", href: settings?.social_tiktok },
    { key: "social_snapchat", icon: "camera", href: settings?.social_snapchat },
    { key: "social_linkedin", icon: "link", href: settings?.social_linkedin },
    { key: "social_behance", icon: "brush", href: settings?.social_behance },
    { key: "social_x", icon: "close", href: settings?.social_x },
    { key: "social_youtube", icon: "play_circle", href: settings?.social_youtube },
    { key: "social_facebook", icon: "thumb_up", href: settings?.social_facebook },
  ].filter(s => s.href);

  return (
    <footer style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)" }}>
      <div className="container" style={{ padding: "64px var(--px)" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 56, textAlign: isRtl ? "right" : "left" }}>
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Link href="/">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Ayla Media" style={{ width: settings.logo_width ? `${settings.logo_width}px` : "120px", height: "auto", objectFit: "contain" }} />
              ) : (
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--pink)" }}>Ayla Media</span>
              )}
            </Link>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 260, margin: isRtl ? "0 0 0 auto" : "0" }}>
              {t("footer.desc")}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: isRtl ? "flex-start" : "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
              {socialLinks.map(social => (
                <a key={social.key} href={social.href as string} target="_blank" rel="noopener noreferrer" style={{
                  width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--pink)", cursor: "pointer", transition: "border-color 0.3s",
                }}>
                  <span className="icon" style={{ fontSize: 18 }}>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pink)", marginBottom: 4 }}>
              {t("footer.navTitle")}
            </span>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 14, color: "var(--text-muted)", transition: "color 0.2s" }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pink)", marginBottom: 4 }}>
              {t("footer.contactTitle")}
            </span>
            {[
              { icon: "mail", text: settings?.contact_email || "studio@aylamedia.sa" },
              { icon: "call", text: settings?.contact_phone || "+966 500 000 000" },
              { icon: "location_on", text: (isRtl ? settings?.contact_address_ar : settings?.contact_address) || (isRtl ? "العليا، الرياض، السعودية" : "Al Olaya, Riyadh, KSA") },
              { icon: "schedule", text: t("contact.hours") },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span className="icon" style={{ color: "var(--pink)", fontSize: 17, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider row */}
        <div className="divider" style={{ marginBottom: 32 }} />

        {/* Bottom row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <p style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <div style={{ display: "flex", gap: 24, flexDirection: isRtl ? "row-reverse" : "row" }}>
            {[
              { label: t("footer.policy"), href: "/privacy" },
              { label: t("footer.terms"), href: "/terms" },
              { label: isRtl ? "سياسة الاستبدال والاسترجاع" : "Refund Policy", href: "/refund" },
              { label: t("footer.faq"), href: "#" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ fontSize: 12, color: "var(--text-dim)", transition: "color 0.2s" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
