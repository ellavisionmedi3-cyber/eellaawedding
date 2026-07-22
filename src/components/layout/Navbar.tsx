"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { lang, setLang, t, isRtl } = useLanguage();
  const settings = useSettings();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  if (path?.startsWith("/admin")) return null;

  const links = [
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
    { href: "/packages", label: t("nav.pricing") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <nav
      className="anim-fade-in"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "24px var(--px)", transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        background: scrolled ? "rgba(26,17,20,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(15px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div style={{
        maxWidth: "var(--max-w)", margin: "0 auto",
        padding: "0 var(--px)", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexDirection: isRtl ? "row-reverse" : "row"
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Ella Media" style={{ width: settings.logo_width ? `${settings.logo_width}px` : "150px", objectFit: "contain" }} />
          ) : (
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--pink)", letterSpacing: "-0.02em" }}>Ella Media</span>
          )}
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32, flexDirection: isRtl ? "row-reverse" : "row" }} className="nav-desktop">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: path === l.href ? "var(--pink)" : "var(--text-muted)",
              borderBottom: path === l.href ? "1px solid rgba(255,176,204,0.4)" : "1px solid transparent",
              paddingBottom: 2, transition: "color 0.2s",
            }}>
              {l.label}
            </Link>
          ))}
          
          {/* Lang Toggle */}
          <button 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="hover-lift"
            style={{
              padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border)",
              fontSize: 10, fontWeight: 800, color: "var(--pink)", cursor: "pointer",
              minWidth: 60, textAlign: "center"
            }}
          >
            {t("nav.switchLangShort")}
          </button>

          <Link href="/contact" className="btn btn-outline" style={{ padding: "10px 24px", fontSize: 11 }}>
            {t("nav.bookNow")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{ color: "var(--pink)", display: "none" }} className="nav-mobile-btn" aria-label="Menu">
          <span className="icon">{open ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: "rgba(26,17,20,0.97)", backdropFilter: "blur(24px)",
          padding: "16px var(--px) 28px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", gap: 4,
          textAlign: isRtl ? "right" : "left"
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: "14px 0", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: path === l.href ? "var(--pink)" : "var(--text-muted)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {l.label}
            </Link>
          ))}
          
          <button 
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            style={{
              padding: "14px 0", fontSize: 13, fontWeight: 600,
              color: "var(--pink)", textAlign: isRtl ? "right" : "left", cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {t("nav.switchLang")}
          </button>

          <Link href="/contact" className="btn btn-primary" style={{ marginTop: 16, width: "100%" }}>
            {t("nav.bookDate")}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
