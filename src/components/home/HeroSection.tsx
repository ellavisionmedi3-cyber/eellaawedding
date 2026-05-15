"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { Volume2, VolumeX } from "lucide-react";

import { getMediaUrl } from "@/lib/utils";

export default function HeroSection() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const [currentImg, setCurrentImg] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = getMediaUrl(settings?.hero_video_url || "", false);
  const isEmbed = videoUrl.includes("embed") || videoUrl.includes("preview");

  const images = (settings?.hero_bg_url || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")
    .split(",")
    .filter(Boolean);

  const slides = [
    { 
      title: settings?.hero_title_en ? (isRtl ? settings.hero_title_ar : settings.hero_title_en) : t("hero.title"),
      span: settings?.hero_span_en ? (isRtl ? settings.hero_span_ar : settings.hero_span_en) : t("hero.span"),
      desc: settings?.hero_desc_en ? (isRtl ? settings.hero_desc_ar : settings.hero_desc_en) : t("hero.desc")
    }
  ];

  const heroTagline = isRtl ? (settings?.hero_tagline_ar || t("hero.tagline")) : (settings?.hero_tagline_en || t("hero.tagline"));
  const heroCta1 = isRtl ? (settings?.hero_cta1_ar || t("hero.cta1")) : (settings?.hero_cta1_en || t("hero.cta1"));
  const heroCta2 = isRtl ? (settings?.hero_cta2_ar || t("hero.cta2")) : (settings?.hero_cta2_en || t("hero.cta2"));

  if (settings?.hero_title2_en || settings?.hero_title2_ar) {
    slides.push({
      title: isRtl ? (settings.hero_title2_ar || "") : (settings.hero_title2_en || ""),
      span: "",
      desc: isRtl ? (settings.hero_desc2_ar || "") : (settings.hero_desc2_en || "")
    });
  }
  if (settings?.hero_title3_en || settings?.hero_title3_ar) {
    slides.push({
      title: isRtl ? (settings.hero_title3_ar || "") : (settings.hero_title3_en || ""),
      span: "",
      desc: isRtl ? (settings.hero_desc3_ar || "") : (settings.hero_desc3_en || "")
    });
  }

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const stats = [
    ["500+", t("hero.stats.weddings")],
    ["100%", t("hero.stats.crew")],
    ["7", t("hero.stats.years")]
  ];

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden", background: "#000" }}>
      {/* BG Image or Video */}
      <div style={{ position: "absolute", inset: 0 }}>
        {settings?.hero_video_url ? (
          isEmbed ? (
            <iframe
              id="hero-video-iframe"
              src={videoUrl}
              style={{ width: "100vw", height: "56.25vw", minHeight: "100vh", minWidth: "177.77vh", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "none", pointerEvents: "none", opacity: 0.6 }}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <>
              <video 
                ref={videoRef}
                src={videoUrl} 
                autoPlay loop muted={isMuted} playsInline 
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.6 }} 
              />
            </>
          )
        ) : (
          images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Hero" 
              style={{ 
                position: "absolute", inset: 0, 
                width: "100%", height: "100%", 
                objectFit: "cover", 
                opacity: currentImg === idx ? 0.7 : 0,
                transition: "opacity 1.5s ease-in-out" 
              }}
            />
          ))
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,12,0.4), rgba(10,10,12,0.8))" }} />
      </div>

      {/* Content */}
      <div className="container" style={{ position: "relative", zIndex: 2, padding: "80px var(--px) 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Tagline */}
          <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ width: 40, height: 1, background: "var(--pink)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pink)" }}>{heroTagline}</span>
            <span style={{ width: 40, height: 1, background: "var(--pink)" }} />
          </div>

          {/* Headline Slider */}
          <div style={{ position: "relative", minHeight: isRtl ? 280 : 220 }}>
            {slides.map((slide, idx) => (
              <div 
                key={idx} 
                style={{ 
                  position: idx === 0 ? "relative" : "absolute", 
                  inset: 0, 
                  opacity: activeSlide === idx ? 1 : 0, 
                  transform: activeSlide === idx ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 1s ease, transform 1s ease",
                  pointerEvents: activeSlide === idx ? "auto" : "none"
                }}
              >
                <h1 style={{ 
                  fontFamily: "var(--font-display)", 
                  fontSize: "clamp(38px, 6.5vw, 84px)", 
                  fontWeight: 700, 
                  lineHeight: isRtl ? 1.4 : 1.1, 
                  letterSpacing: "-0.02em", 
                  color: "var(--text)", 
                  marginBottom: 24,
                  overflowWrap: "break-word"
                }}>
                  {slide.title}
                  {slide.span && (
                    <span className="grad-text" style={{ 
                      display: "block", 
                      fontStyle: "italic",
                      marginTop: isRtl ? 12 : 4,
                      padding: "4px 0"
                    }}>
                      {slide.span}
                    </span>
                  )}
                </h1>
                <p style={{ 
                  fontSize: "clamp(15px, 1.1vw, 18px)", 
                  color: "var(--text-muted)", 
                  maxWidth: 600, 
                  margin: "0 auto 40px", 
                  lineHeight: 1.8,
                  padding: "0 10px"
                }}>
                  {slide.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            <Link href="/contact" className="btn btn-primary" style={{ padding: "16px 36px" }}>{heroCta1}</Link>
            <Link href="/gallery" className="btn btn-outline" style={{ padding: "16px 36px" }}>{heroCta2}</Link>
          </div>

          {/* Stats */}
          <div className="anim-fade-up delay-4" style={{ display: "flex", gap: "clamp(20px, 4vw, 56px)", marginTop: 56, justifyContent: "center", flexWrap: "wrap" }}>
            {stats.map(([val, lbl], i) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div className="grad-text" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sound Toggle Button */}
      {settings?.hero_video_url && (
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (isEmbed) {
              const iframe = document.getElementById('hero-video-iframe') as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: !isMuted ? 'mute' : 'unMute' }), '*');
              }
            } else if (videoRef.current) {
              videoRef.current.muted = !isMuted;
            }
          }}
          style={{
            position: "fixed",
            bottom: 104,
            left: "var(--wa-left, auto)",
            right: "var(--wa-right, 32px)",
            zIndex: 90,
            background: "var(--pink)",
            color: "#fff",
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
          }}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </section>
  );
}
