"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function ContactForm() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const searchParams = useSearchParams();
  const [pkg, setPkg] = useState("essential");
  const [services, setServices] = useState<string[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const p = searchParams.get("package");
    if (p) setPkg(p);

    fetch("/api/addons").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAddons(data);
    }).catch(() => {});
  }, [searchParams]);

  const pkgs = [
    { id: "essential", label: isRtl ? "أساسي" : "Essential", desc: isRtl ? "تغطية أساسية" : "Basic Coverage" },
    { id: "premium", label: isRtl ? "بريميوم" : "Premium", desc: isRtl ? "يوم كامل + ألبوم" : "Full Day + Album" },
    { id: "legacy", label: isRtl ? "ليجاسي" : "Legacy", desc: isRtl ? "تصوير فوتوغرافي + فيديو" : "Photo + Video" },
  ];

  const toggle = (s: string) => setServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    const client_name = fd.get("client_name") as string;
    const mobile = fd.get("mobile") as string;
    const event_type = fd.get("event_type") as string;
    const venue = fd.get("venue_location") as string;
    const notes = fd.get("notes") as string;

    // Honeypot anti-spam check
    const website_url = fd.get("website_url") as string;
    if (website_url) {
      setTimeout(() => {
        setDone(true);
        setLoading(false);
      }, 1000);
      return;
    }

    const body = { 
      client_name, 
      mobile, 
      email: fd.get("email"), 
      event_type, 
      event_date: fd.get("event_date"),
      venue_location: venue, 
      package: pkg, 
      additional_services: services.join(", "), 
      notes,
      website_url: ""
    };

    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) {
        // Redirect to WhatsApp
        const waNumber = settings?.social_whatsapp || settings?.contact_phone || "966500000000";
        const cleanNumber = waNumber.replace(/[^0-9]/g, "");
        const eventDate = fd.get("event_date") as string;
        const msg = isRtl 
          ? `طلب حجز جديد:\nالاسم: ${client_name}\nالجوال: ${mobile}\nالتاريخ: ${eventDate}\nالمناسبة: ${event_type}\nالباقة: ${pkg}\nالموقع: ${venue}\nملاحظات: ${notes}`
          : `New Booking Request:\nName: ${client_name}\nMobile: ${mobile}\nDate: ${eventDate}\nEvent: ${event_type}\nPackage: ${pkg}\nLocation: ${venue}\nNotes: ${notes}`;
        
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
        
        setDone(true);
      }
      else { const j = await r.json(); setError(isRtl ? "حدث خطأ أثناء الإرسال." : (j.error || "Error occurred.")); }
    } catch { setError(isRtl ? "خطأ في الاتصال." : "Network error."); }
    setLoading(false);
  };

  const field = (label: string, name: string, type = "text", placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{label}</label>
      <input 
        name={name} 
        type={type} 
        placeholder={placeholder} 
        required={["client_name","mobile","event_type"].includes(name)} 
        style={{ textAlign: isRtl ? "right" : "left" }}
      />
    </div>
  );

  if (done) return (
    <div className="page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px var(--px) 60px" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,176,204,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <span className="icon icon-fill" style={{ fontSize: 36, color: "var(--pink)" }}>check_circle</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>{t("contact.success.title")}</h2>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36 }}>{t("contact.success.desc")}</p>
        <Link href="/" className="btn btn-primary">{t("contact.success.return")}</Link>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 100, paddingBottom: "var(--section-py)" }}>
      <div className="container reveal" style={{ paddingBottom: 60, textAlign: isRtl ? "right" : "left" }}>
        <span className="eyebrow">{t("contact.eyebrow")}</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>{t("contact.title")}</h1>
        <p style={{ fontSize: 17, color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.75, margin: isRtl ? "0 0 0 auto" : "0 auto 0 0" }}>{t("contact.desc")}</p>
      </div>

      <div className="container">
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 32, alignItems: "start" }}>
          {/* Left info */}
          <div className="reveal-left" style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: isRtl ? "right" : "left" }}>
            <div className="card" style={{ padding: 32 }}>
              <span className="icon" style={{ fontSize: 36, color: "var(--pink)", marginBottom: 16, display: "block" }}>contact_support</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>{t("contact.getInTouch")}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{t("contact.hours")}</p>
              {[
                { icon: "mail", text: settings.contact_email || "studio@aylamedia.sa" },
                { icon: "call", text: settings.contact_phone || "+966 500 000 000" },
                { icon: "location_on", text: (isRtl ? settings.contact_address_ar : settings.contact_address) || (isRtl ? "العليا، الرياض، السعودية" : "Al Olaya, Riyadh, KSA") }
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: "var(--text)" }}>{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Map */}
            {settings.contact_map_url && (
              <div className="card reveal-up" style={{ height: 250, padding: 0, overflow: "hidden" }}>
                {(() => {
                  let mapUrl = settings.contact_map_url;
                  // If it's a sharing link, it won't work in iframe. We try to detect standard embed URLs or fallback.
                  // Note: Converting a sharing link to an embed link reliably usually requires API, 
                  // but we can check if it's already an embed link or a share link.
                  if (mapUrl.includes("google.com/maps") && !mapUrl.includes("embed")) {
                    // Try to convert simple links if possible, otherwise user should use embed link
                    // For now, we just pass it as is but with a check
                  }
                  return (
                    <iframe 
                      src={mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: "grayscale(1) invert(0.9)" }} 
                      allowFullScreen 
                      loading="lazy" 
                    />
                  );
                })()}
              </div>
            )}

            <div className="card" style={{ padding: 28 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pink)", marginBottom: 20 }}>{t("contact.policies")}</h4>
              {[
                ["female", t("contact.policyList.0")], 
                ["schedule", t("contact.policyList.1")], 
                ["verified", t("contact.policyList.2")]
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start", flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 18, marginTop: 2, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card reveal-scale" style={{ padding: "40px 36px" }}>
            {error && <div style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(147,0,10,0.2)", border: "1px solid rgba(255,180,171,0.2)", color: "#ffb4ab", fontSize: 14, marginBottom: 24, textAlign: "center" }}>{error}</div>}
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Honeypot hidden field for anti-spam */}
              <input type="text" name="website_url" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {field(t("contact.form.name"), "client_name", "text", t("contact.form.placeholders.name"))}
                {field(t("contact.form.mobile"), "mobile", "tel", "+966 5X XXX XXXX")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {field(t("contact.form.email"), "email", "email", "your@email.com")}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{t("contact.form.eventType")}</label>
                  <select name="event_type" required style={{ textAlign: isRtl ? "right" : "left" }}>
                    {(isRtl 
                      ? ["زفاف كبير", "حفل خطوبة", "استقبال خاص", "جلسة تصوير عروس"]
                      : ["Grand Wedding","Engagement Party","Private Reception","Bridal Portrait Session"]
                    ).map(t_type => <option key={t_type} value={t_type}>{t_type}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {field(isRtl ? "تاريخ المناسبة" : "Event Date", "event_date", "date")}
                {field(t("contact.form.venue"), "venue_location", "text", t("contact.form.placeholders.venue"))}
              </div>

              {/* Package */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>{t("contact.form.package")}</label>
                <div style={{ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  {pkgs.map(p => (
                    <button type="button" key={p.id} onClick={() => setPkg(p.id)} style={{
                      flex: 1, padding: "14px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: isRtl ? "right" : "left",
                      border: pkg === p.id ? "1px solid var(--pink)" : "1px solid var(--border)",
                      background: pkg === p.id ? "rgba(255,176,204,0.06)" : "var(--surface)",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 12, textAlign: isRtl ? "right" : "left" }}>{t("contact.form.addons")}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  {addons.map(s => {
                    const label = isRtl ? (s.name_ar || s.name) : s.name;
                    return (
                      <button type="button" key={s.id} onClick={() => toggle(label)} style={{
                        padding: "8px 18px", borderRadius: 50, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                        border: services.includes(label) ? "1px solid var(--pink)" : "1px solid var(--border)",
                        background: services.includes(label) ? "rgba(255,176,204,0.1)" : "var(--surface)",
                        color: services.includes(label) ? "var(--pink)" : "var(--text-muted)",
                      }}>{label}</button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{t("contact.form.notes")}</label>
                <textarea name="notes" rows={4} placeholder={t("contact.form.placeholders.notes")} style={{ textAlign: isRtl ? "right" : "left" }} />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1, flexDirection: isRtl ? "row-reverse" : "row" }}>
                {loading ? t("contact.form.submitting") : <><span>{t("contact.form.submit")}</span><span className="icon" style={{ fontSize: 18, transform: isRtl ? "rotate(180deg)" : "none" }}>send</span></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
