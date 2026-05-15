"use client";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Service {
  id: string;
  title: string;
  title_ar: string;
  desc: string;
  desc_ar: string;
  image_url: string;
}

export default function ServicesClient({ services }: { services: Service[] }) {
  const { t, isRtl } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".reveal",
          start: "top 85%",
        }
      });

      gsap.utils.toArray<HTMLElement>(".service-card").forEach((card, i) => {
        gsap.from(card, {
          x: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="page" style={{ paddingTop: 140, paddingBottom: 100 }}>
      {/* Header */}
      <section className="container" style={{ marginBottom: 100, textAlign: isRtl ? "right" : "left" }}>
        <span className="eyebrow reveal">{isRtl ? "ما نقدمه" : "What We Offer"}</span>
        <h1 className="reveal" style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "clamp(48px, 8vw, 90px)", 
          fontWeight: 700, 
          lineHeight: 1.1,
          marginBottom: 32,
          maxWidth: 900,
          margin: isRtl ? "0 0 32px auto" : "0 auto 32px 0"
        }}>
          {isRtl ? "خدماتنا الحصرية" : "Our Exclusive Services"}
        </h1>
        <p className="reveal" style={{ 
          fontSize: "clamp(16px, 1.2vw, 20px)", 
          color: "var(--text-muted)", 
          maxWidth: 600, 
          lineHeight: 1.8,
          margin: isRtl ? "0 0 0 auto" : "0 auto 0 0"
        }}>
          {isRtl 
            ? "نقدم تجربة متكاملة مصممة خصيصاً للعروس السعودية، تجمع بين الفن العالي والخصوصية التامة في كل لقطة."
            : "We provide a comprehensive experience tailored specifically for the Saudi bride, blending high art with complete privacy in every shot."}
        </p>
      </section>

      {/* Services List */}
      <section className="container">
        <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
          {services.map((s, i) => {
            const title = isRtl ? (s.title_ar || s.title) : s.title;
            const desc = isRtl ? (s.desc_ar || s.desc) : s.desc;
            const isEven = i % 2 === 0;

            return (
              <div key={s.id} className="service-card" style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: 80, 
                alignItems: "center",
                flexDirection: isEven ? "row" : "row-reverse"
              }}>
                <div style={{ 
                  order: isEven ? (isRtl ? 2 : 1) : (isRtl ? 1 : 2),
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 24,
                  aspectRatio: "16/10"
                }}>
                  <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    backgroundImage: `url(${s.image_url})`, 
                    backgroundSize: "cover", 
                    backgroundPosition: "center",
                    transform: "scale(1.05)"
                  }} />
                  <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" 
                  }} />
                </div>
                
                <div style={{ 
                  order: isEven ? (isRtl ? 1 : 2) : (isRtl ? 2 : 1),
                  textAlign: isRtl ? "right" : "left"
                }}>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: "var(--pink)", 
                    letterSpacing: "0.2em", 
                    textTransform: "uppercase",
                    marginBottom: 16,
                    display: "block"
                  }}>0{i + 1}</span>
                  <h2 style={{ 
                    fontFamily: "var(--font-display)", 
                    fontSize: "clamp(32px, 4vw, 48px)", 
                    fontWeight: 600, 
                    marginBottom: 24,
                    color: "var(--text)"
                  }}>{title}</h2>
                  <p style={{ 
                    fontSize: 17, 
                    color: "var(--text-dim)", 
                    lineHeight: 1.8, 
                    marginBottom: 40 
                  }}>{desc}</p>
                  <Link href="/contact" className="btn btn-outline">
                    {isRtl ? "احجز الخدمة" : "Book Service"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ marginTop: 150, textAlign: "center" }}>
        <div style={{ 
          padding: "100px 40px", 
          borderRadius: 40, 
          background: "var(--bg-2)", 
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden"
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 600, marginBottom: 24 }}>
            {isRtl ? "هل أنتِ مستعدة لتوثيق قصتك؟" : "Ready to document your story?"}
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            {isRtl 
              ? "دعينا نخلد لحظاتك السحرية بذوق رفيع ودقة سينمائية لا تضاهى." 
              : "Let us immortalize your magical moments with refined taste and unmatched cinematic precision."}
          </p>
          <Link href="/contact" className="btn btn-primary" style={{ padding: "18px 48px" }}>
            {isRtl ? "تواصلِ معنا" : "Contact Us"}
          </Link>
        </div>
      </section>

      <style>{`
        @media(max-width: 900px) {
          .service-card { 
            grid-template-columns: 1fr !important; 
            gap: 40px !important; 
          }
          .service-card > div { order: unset !important; }
        }
      `}</style>
    </div>
  );
}
