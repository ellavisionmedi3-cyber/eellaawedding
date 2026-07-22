"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

import { useEffect, useState } from "react";

export default function TestimonialsSection() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const [reviews, setReviews] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetch("/api/reviews")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(t("testimonials.list") as any[]);
        }
      })
      .catch(() => setReviews(t("testimonials.list") as any[]));
  }, [t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      client_name: fd.get("name"),
      comment: fd.get("comment"),
      rating: rating
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) setSubmitted(true);
    } catch (e) {}
    setLoading(false);
  };

  return (
    <section className="section" style={{ background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
      {/* Background Image */}
      <div data-parallax="0.12" style={{ position: "absolute", inset: 0, backgroundImage: `url('${settings?.global_bg_url || "https://images.unsplash.com/photo-1519741497674-611481863552"}')`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none", transition: "transform 0.15s ease-out" }} />
      
      <div className="container reveal">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="eyebrow">{t("testimonials.eyebrow")}</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--text)" }}>
            {t("testimonials.title")}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 56 }}>
          {reviews.map((rev: any, i: number) => (
            <div key={i} className="card anim-fade-up hover-lift" style={{ 
              animationDelay: `${i * 0.1}s`, 
              padding: "40px 32px", 
              position: "relative",
              textAlign: isRtl ? "right" : "left"
            }}>
              <div style={{ position: "absolute", top: 24, [isRtl ? 'left' : 'right']: 32, display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={j < (rev.rating || 5) ? "icon icon-fill" : "icon"} style={{ fontSize: 14, color: j < (rev.rating || 5) ? "var(--pink)" : "var(--text-muted)" }}>star</span>
                ))}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1, marginBottom: 12, opacity: 0.15, color: "var(--pink)", textAlign: isRtl ? "right" : "left" }}>&ldquo;</div>
              <p style={{ fontSize: 15, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 28 }}>
                {isRtl ? (rev.comment_ar || rev.comment || rev.quote) : (rev.comment || rev.quote)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,176,204,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 24 }}>person</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{isRtl ? (rev.client_name_ar || rev.client_name || rev.name) : (rev.client_name || rev.name)}</div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginTop: 2 }}>{rev.role || (isRtl ? "عميلة إيلا" : "Ella Client")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowModal(true)} className="btn btn-outline">
            <span className="icon" style={{ fontSize: 18 }}>rate_review</span>
            {isRtl ? "أضف تجربتك" : "Write a Review"}
          </button>
          <Link href="/contact" className="btn btn-primary">
            <span className="icon" style={{ fontSize: 18 }}>calendar_month</span>
            {t("nav.bookDate")}
          </Link>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setShowModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(10,10,12,0.9)", backdropFilter: "blur(10px)" }} />
          <div className="card anim-scale-in" style={{ position: "relative", width: "100%", maxWidth: 500, padding: 40, background: "var(--bg-2)" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, [isRtl ? 'left' : 'right']: 20, background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
              <span className="icon">close</span>
            </button>
            
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span className="icon" style={{ fontSize: 64, color: "var(--pink)", marginBottom: 24, display: "block" }}>task_alt</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12 }}>{isRtl ? "شكراً لكِ!" : "Thank You!"}</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>{isRtl ? "سيتم مراجعة تجربتك ونشرها قريباً." : "Your review has been submitted for approval."}</p>
                <button onClick={() => setShowModal(false)} className="btn btn-primary">{isRtl ? "إغلاق" : "Close"}</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>{isRtl ? "شاركينا تجربتك" : "Share Your Experience"}</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 15, textAlign: isRtl ? "right" : "left" }}>{isRtl ? "رأيك يهمنا ويساعد العرائس الأخريات في اختيارهن." : "Your feedback helps other brides make the right choice."}</p>
                
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "الاسم" : "Your Name"}</label>
                    <input name="name" required placeholder={isRtl ? "اسمك الكامل" : "Full Name"} style={{ textAlign: isRtl ? "right" : "left" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "التعليق" : "Your Review"}</label>
                    <textarea name="comment" required rows={4} placeholder={isRtl ? "اكتبي تجربتك هنا..." : "Tell us about your session..."} style={{ textAlign: isRtl ? "right" : "left" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: isRtl ? "flex-end" : "flex-start" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>{isRtl ? "التقييم" : "Rating"}</label>
                    <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => setRating(star)}
                          className={star <= rating ? "icon icon-fill" : "icon"} 
                          style={{ fontSize: 28, color: star <= rating ? "var(--pink)" : "var(--text-muted)", cursor: "pointer", transition: "color 0.2s ease" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                    {loading ? (isRtl ? "جاري الإرسال..." : "Sending...") : (isRtl ? "إرسال المراجعة" : "Submit Review")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
