"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function PromoPopup() {
  const { isRtl } = useLanguage();
  const settings = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (settings?.promo_enabled !== "1") return;
    
    const intervalSeconds = parseInt(settings.promo_interval || "20", 10);
    const intervalMs = intervalSeconds * 1000;

    // Show initially
    const initialTimer = setTimeout(() => setIsOpen(true), 2000);

    // Show periodically
    const recurringTimer = setInterval(() => {
      setIsOpen(true);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, [settings?.promo_enabled, settings?.promo_interval]);

  if (!isOpen || settings?.promo_enabled !== "1") return null;

  const title = isRtl ? (settings.promo_title_ar || "عرض خاص") : (settings.promo_title_en || "Special Offer");
  const text = isRtl ? (settings.promo_text_ar || "") : (settings.promo_text_en || "");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", padding: 20
    }} onClick={() => setIsOpen(false)}>
      <div 
        className="anim-scale-in"
        style={{
          background: "var(--bg-2)", border: "1px solid var(--pink)", borderRadius: "var(--radius)", maxWidth: 450, width: "100%", overflow: "hidden", position: "relative", textAlign: isRtl ? "right" : "left", boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: "absolute", top: 12, right: isRtl ? "auto" : 12, left: isRtl ? 12 : "auto", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ✕
        </button>
        {settings.promo_image_url && (
          <img src={settings.promo_image_url} alt="Promo" style={{ width: "100%", height: 200, objectFit: "cover" }} />
        )}
        <div style={{ padding: 32 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--pink)", marginBottom: 12 }}>{title}</h2>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 24, whiteSpace: "pre-wrap" }}>{text}</p>
          <a 
            href={`https://wa.me/${settings?.social_whatsapp || "966500000000"}?text=${encodeURIComponent(isRtl ? "مرحباً، أريد الاستفسار عن هذا العرض: " + title : "Hello, I want to inquire about this offer: " + title)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary" 
            style={{ display: "block", width: "100%", padding: 14, textAlign: "center" }} 
            onClick={() => setIsOpen(false)}
          >
            {isRtl ? "اطلبي العرض الان" : "Order the offer now"}
          </a>
        </div>
      </div>
    </div>
  );
}
