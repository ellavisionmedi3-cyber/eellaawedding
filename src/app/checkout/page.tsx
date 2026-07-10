"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

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
}

function CheckoutContent() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mada" | "tamara" | "cash">("card");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    event_date: "",
    event_location: "",
    notes: "",
    website_url: ""
  });
  
  // Card details states (mock)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [isFailure, setIsFailure] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Tamara eligibility states
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");

  // Read URL query parameters for return states (success, cancel, failure)
  useEffect(() => {
    const successParam = searchParams.get("success");
    const cancelParam = searchParams.get("cancel");
    const failureParam = searchParams.get("failure");
    const orderParam = searchParams.get("order");

    if (successParam === "true") {
      setIsSuccess(true);
      if (orderParam) setOrderId(orderParam);
    } else if (cancelParam === "true") {
      setIsCancel(true);
    } else if (failureParam === "true") {
      setIsFailure(true);
    }
  }, [searchParams]);

  // Fetch packages on mount/search param change
  useEffect(() => {
    // Fetch packages to find the selected one
    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPackages(data);
          const tierParam = searchParams.get("package");
          const found = data.find((p) => p.tier === tierParam) || data[0];
          if (found) setSelectedPkg(found);
        }
      })
      .catch((err) => console.error(err));
  }, [searchParams]);

  // Setup window.tamaraWidgetConfig dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.tamaraWidgetConfig = {
        lang: isRtl ? "ar" : "en",
        country: "SA",
        publicKey: process.env.NEXT_PUBLIC_TAMARA_PUBLIC_KEY || "43d6d648-4f13-48cb-b330-2bc018ae0f22",
        style: {
          fontSize: "13px",
          badgeRatio: 1.1
        }
      };

      if (window.TamaraWidgetV2) {
        window.TamaraWidgetV2.refresh();
      }
    }
  }, [selectedPkg?.price, isRtl]);

  // Check eligibility for Tamara with a debounce of 600ms
  useEffect(() => {
    if (paymentMethod === "tamara" && selectedPkg && formData.mobile) {
      const checkEligibility = async () => {
        const cleanPhone = formData.mobile.replace(/\s+/g, "");
        if (cleanPhone.length < 9) {
          setIsEligible(null);
          setEligibilityError("");
          return;
        }

        setCheckingEligibility(true);
        setEligibilityError("");

        try {
          const res = await fetch("/api/tamara/payment-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              country: "SA",
              phone: cleanPhone,
              currency: "SAR",
              order_value: selectedPkg.price
            })
          });

          const data = await res.json();
          if (res.ok) {
            setIsEligible(data.eligible);
            if (!data.eligible) {
              setEligibilityError(isRtl 
                ? "عذرًا، العميل غير مؤهل لخدمة تمارا لهذا المبلغ أو رقم الجوال." 
                : "Sorry, you are not eligible for Tamara with this amount or phone number."
              );
            }
          } else {
            setIsEligible(false);
            setEligibilityError(isRtl 
              ? "فشل التحقق من الأهلية، يرجى التأكد من صحة رقم الجوال." 
              : "Eligibility check failed, please verify the phone number is correct."
            );
          }
        } catch (err) {
          console.error("Eligibility check error:", err);
          setIsEligible(false);
          setEligibilityError(isRtl 
            ? "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً." 
            : "Connection error, please try again later."
          );
        } finally {
          setCheckingEligibility(false);
        }
      };

      const timer = setTimeout(() => {
        checkEligibility();
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setIsEligible(null);
      setEligibilityError("");
    }
  }, [paymentMethod, formData.mobile, selectedPkg?.price, isRtl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = packages.find((p) => p.id === e.target.value);
    if (found) setSelectedPkg(found);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setIsSubmitting(true);

    if (formData.website_url) {
      setTimeout(() => {
        setOrderId("ORD-" + Math.floor(100000 + Math.random() * 900000));
        setIsSuccess(true);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      // 1. Create booking in DB
      const bookingData = {
        client_name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        event_type: "Wedding / زفاف",
        event_date: formData.event_date,
        venue_location: formData.event_location,
        package: selectedPkg.name,
        additional_services: `Payment Method: ${paymentMethod.toUpperCase()}`,
        notes: `${formData.notes}\n[Payment Method: ${paymentMethod.toUpperCase()}]`,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "tamara" ? "authorized" : (paymentMethod === "cash" ? "pending" : "paid"),
        amount: selectedPkg.price
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        const result = await res.json();
        const generatedId = result.id || "ORD-" + Math.floor(100000 + Math.random() * 900000);
        setOrderId(generatedId);

        // 2. If Tamara is selected, redirect to Tamara checkout API URL
        if (paymentMethod === "tamara") {
          const tamaraRes = await fetch("/api/tamara/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: generatedId,
              amount: selectedPkg.price,
              customer: {
                name: formData.name,
                phone: formData.mobile,
                email: formData.email
              },
              packageName: selectedPkg.name
            })
          });

          const tamaraData = await tamaraRes.json();
          
          if (tamaraData.checkout_url) {
            window.location.href = tamaraData.checkout_url;
            return;
          } else {
            console.error("Tamara Checkout API Error: ", tamaraData);
            alert(isRtl 
              ? "فشل تحويلك لبوابة دفع تمارا. يرجى المحاولة لاحقاً." 
              : "Failed to redirect to Tamara gateway. Please try again."
            );
            setIsSubmitting(false);
            return;
          }
        }

        // Default direct success screen for Card / Mada
        setTimeout(() => {
          setIsSuccess(true);
          setIsSubmitting(false);
        }, 1500);
      } else {
        alert(isRtl ? "فشل إتمام العملية، يرجى المحاولة لاحقاً" : "Failed to process booking, please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert(isRtl ? "حدث خطأ غير متوقع" : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const getInstallments = (price: number) => {
    const inst = (price / 3).toFixed(2);
    return parseFloat(inst).toLocaleString();
  };

  if (isCancel) {
    return (
      <div className="page" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px var(--px) 60px" }}>
        <div className="card anim-scale-in" style={{ textAlign: "center", maxWidth: 540, padding: "50px 40px", background: "var(--bg-3)", border: "1px solid #FF9E00" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,158,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <span className="icon icon-fill" style={{ fontSize: 40, color: "#FF9E00" }}>warning</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "تم إلغاء عملية الدفع" : "Payment Cancelled"}
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36 }}>
            {isRtl 
              ? "لقد قمت بإلغاء عملية الدفع عبر تمارا. يمكنك محاولة الحجز مرة أخرى أو اختيار طريقة دفع بديلة." 
              : "You have cancelled the payment process. You can try booking again or select a different payment method."}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => { setIsCancel(false); router.replace("/checkout"); }} className="btn btn-primary" style={{ flex: 1 }}>
              {isRtl ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFailure) {
    return (
      <div className="page" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px var(--px) 60px" }}>
        <div className="card anim-scale-in" style={{ textAlign: "center", maxWidth: 540, padding: "50px 40px", background: "var(--bg-3)", border: "1px solid #ff4d4d" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,77,77,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <span className="icon icon-fill" style={{ fontSize: 40, color: "#ff4d4d" }}>error</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "فشلت عملية الدفع" : "Payment Failed"}
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 36 }}>
            {isRtl 
              ? "حدث خطأ أثناء معالجة دفعتك عبر تمارا. يرجى المحاولة لاحقاً أو استخدام بطاقة أخرى." 
              : "An error occurred while processing your payment. Please try again later or use a different card."}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button onClick={() => { setIsFailure(false); router.replace("/checkout"); }} className="btn btn-primary" style={{ flex: 1 }}>
              {isRtl ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    // Premium Success Screen
    return (
      <div className="page" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px var(--px) 60px" }}>
        <div className="card anim-scale-in" style={{ textAlign: "center", maxWidth: 540, padding: "50px 40px", background: "var(--bg-3)", border: "1px solid var(--border-pink)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,176,204,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <span className="icon icon-fill" style={{ fontSize: 40, color: "var(--pink)" }}>check_circle</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
            {isRtl ? "تمت عملية الحجز بنجاح!" : "Booking Completed Successfully!"}
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 16 }}>
            {isRtl 
              ? "شكراً لكِ. تم استلام طلب الحجز والدفع بنجاح. ستصلكِ رسالة تأكيد بالتفاصيل على البريد الإلكتروني الذي قمتِ بإدخاله خلال لحظات." 
              : "Thank you. Your booking and payment have been received successfully. A confirmation email with details will be sent to your email address shortly."}
          </p>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", marginBottom: 36, fontSize: 14 }}>
            <span style={{ color: "var(--text-dim)" }}>{isRtl ? "رقم الطلب:" : "Order Reference:"}</span>
            <span style={{ fontWeight: 700, color: "var(--pink)", fontFamily: "monospace" }}>{orderId}</span>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", flexDirection: isRtl ? "row-reverse" : "row" }}>
            <Link href="/" className="btn btn-outline" style={{ flex: 1 }}>{isRtl ? "الرئيسية" : "Home"}</Link>
            <button 
              onClick={() => {
                const waNumber = settings?.social_whatsapp || "966500000000";
                const cleanNumber = waNumber.replace(/[^0-9]/g, "");
                const msg = isRtl 
                  ? `أهلاً، قمت بإتمام الدفع والحجز للباقة (${selectedPkg?.name_ar || selectedPkg?.name}) عبر الموقع بنجاح. رقم الطلب: ${orderId}`
                  : `Hello, I have successfully booked and paid for the (${selectedPkg?.name}) package. Order Ref: ${orderId}`;
                window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              <span className="icon">chat</span> {isRtl ? "واتساب لتأكيد الموعد" : "WhatsApp Confirmation"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 120, paddingBottom: "var(--section-py)", minHeight: "100vh" }}>
      <div className="container">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: "var(--text)", marginBottom: 40, textAlign: isRtl ? "right" : "left" }}>
          {isRtl ? "إتمام الطلب والدفع" : "Secure Checkout"}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 40, alignItems: "start", width: "100%" }} className="checkout-grid">
          
          {/* Left Column: Form */}
          <div className="card" style={{ padding: "40px 32px", background: "var(--bg-3)" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Honeypot hidden field for anti-spam */}
              <input type="text" name="website_url" value={formData.website_url} onChange={(e) => setFormData(prev => ({...prev, website_url: e.target.value}))} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              
              {/* Section 1: Customer details */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--pink)", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
                  {isRtl ? "1. معلومات العميلة والتواصل" : "1. Personal & Contact Details"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "الاسم بالكامل *" : "Full Name *"}</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={isRtl ? "اسمك بالكامل" : "Your full name"} style={{ textAlign: isRtl ? "right" : "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "رقم الجوال *" : "Mobile Number *"}</label>
                    <input required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="9665xxxxxxxx" style={{ textAlign: "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" style={{ textAlign: "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)" }} />
                </div>
              </div>

              {/* Section 2: Booking details */}
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--pink)", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
                  {isRtl ? "2. تفاصيل وموعد المناسبة" : "2. Wedding details"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "موعد الزفاف/المناسبة *" : "Event Date *"}</label>
                    <input required type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)", fontFamily: "inherit" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "موقع القاعة (رابط قوقل ماب) *" : "Venue Location *"}</label>
                    <input required type="text" name="event_location" value={formData.event_location} onChange={handleInputChange} placeholder="https://maps.google.com/..." style={{ textAlign: isRtl ? "right" : "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)" }} />
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--text-dim)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "ملاحظات إضافية" : "Additional Notes"}</label>
                  <textarea name="notes" rows={3} value={formData.notes} onChange={handleInputChange} placeholder={isRtl ? "أخبرينا المزيد عن رؤيتك..." : "Tell us more about your vision..."} style={{ textAlign: isRtl ? "right" : "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--text)", resize: "none" }} />
                </div>
              </div>

              {/* Section 3: Payment Method Selection */}
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--pink)", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
                  {isRtl ? "3. طريقة الدفع" : "3. Select Payment Method"}
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Option 1: Credit Card */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10, border: paymentMethod === "card" ? "1px solid var(--pink)" : "1px solid var(--border)", background: "rgba(255,255,255,0.02)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} style={{ width: 18, height: 18 }} />
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{isRtl ? "بطاقة ائتمانية (فيزا / ماستركارد)" : "Credit Card (Visa / Mastercard)"}</span>
                      <span className="icon" style={{ fontSize: 24, color: "var(--text-dim)" }}>credit_card</span>
                    </div>
                  </label>

                  {/* Option 2: Mada */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10, border: paymentMethod === "mada" ? "1px solid var(--pink)" : "1px solid var(--border)", background: "rgba(255,255,255,0.02)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <input type="radio" checked={paymentMethod === "mada"} onChange={() => setPaymentMethod("mada")} style={{ width: 18, height: 18 }} />
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{isRtl ? "مدى (Mada)" : "Mada"}</span>
                      <span style={{ fontWeight: 800, fontSize: 11, color: "var(--pink)", letterSpacing: 1 }}>mada</span>
                    </div>
                  </label>

                  {/* Option 3: Tamara (Buy Now Pay Later) */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10, border: paymentMethod === "tamara" ? "1px solid #FFB8CC" : "1px solid var(--border)", background: paymentMethod === "tamara" ? "rgba(255,184,204,0.04)" : "rgba(255,255,255,0.02)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <input type="radio" checked={paymentMethod === "tamara"} onChange={() => setPaymentMethod("tamara")} style={{ width: 18, height: 18 }} />
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: isRtl ? "flex-end" : "flex-start" }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{isRtl ? "تمارا | قسّم دفعاتك بدون فوائد" : "Tamara | Split in 3 interest-free payments"}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{isRtl ? "ادفع 1/3 اليوم والباقي على شهرين بدون فوائد ورسوم" : "Pay 1/3 today and the rest over 2 months."}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <img src="https://cdn.tamara.co/assets/svg/tamara-logo-badge-ar.svg" alt="Tamara" style={{ height: 26, background: "transparent" }} />
                      </div>
                    </div>
                  </label>

                  {/* Option 4: Cash / Transfer after contact */}
                  <label style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 10, border: paymentMethod === "cash" ? "1px solid var(--pink)" : "1px solid var(--border)", background: "rgba(255,255,255,0.02)", cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row"
                  }}>
                    <input type="radio" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} style={{ width: 18, height: 18 }} />
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: isRtl ? "flex-end" : "flex-start" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{isRtl ? "دفع نقدي / تحويل بنكي بعد التواصل" : "Cash / Bank Transfer after contact"}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{isRtl ? "يتم التنسيق والدفع نقداً أو بالتحويل البنكي بعد التواصل وتأكيد موعد المناسبة" : "Pay via cash or bank transfer after we contact you to confirm details."}</span>
                      </div>
                      <span className="icon" style={{ color: "var(--pink)", fontSize: 24 }}>payments</span>
                    </div>
                  </label>
                </div>

                {/* Card Fields Mockup */}
                {(paymentMethod === "card" || paymentMethod === "mada") && (
                  <div className="anim-fade-up" style={{ marginTop: 20, padding: 20, background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "رقم البطاقة" : "Card Number"}</label>
                      <input required type="text" name="number" value={cardData.number} onChange={handleCardChange} placeholder="•••• •••• •••• ••••" maxLength={19} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)", color: "var(--text)", textAlign: "left" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                        <input required type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" maxLength={5} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)", color: "var(--text)", textAlign: "left" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", textAlign: isRtl ? "right" : "left" }}>{isRtl ? "الرمز (CVV)" : "CVV"}</label>
                        <input required type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="•••" maxLength={3} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.3)", color: "var(--text)", textAlign: "left" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tamara BNPL Breakdown Widget */}
                {paymentMethod === "tamara" && selectedPkg && (
                  <div className="anim-fade-up" style={{ marginTop: 20, padding: 20, background: "rgba(255,184,204,0.02)", border: "1px solid rgba(255,184,204,0.1)", borderRadius: 12 }}>
                    <Script 
                      src="https://cdn.tamara.co/widget-v2/tamara-widget.js" 
                      strategy="afterInteractive"
                    />
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                      <span className="icon" style={{ color: "#FF9E00", fontSize: 20 }}>payments</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{isRtl ? "عرض خطة الدفع مع تمارا:" : "Tamara Payment Options:"}</span>
                    </div>

                    <tamara-widget
                      type="tamara-summary"
                      amount={selectedPkg.price.toString()}
                      inline-type="2"
                      config={JSON.stringify({ badgePosition: isRtl ? "left" : "right" })}
                    />
                  </div>
                )}
              </div>

              {/* Eligibility Error Warning */}
              {paymentMethod === "tamara" && eligibilityError && (
                <div style={{ color: "#ff4d4d", fontSize: 13, textAlign: isRtl ? "right" : "left", marginTop: 8, padding: "10px 14px", background: "rgba(255, 77, 77, 0.08)", borderRadius: 8, border: "1px solid rgba(255, 77, 77, 0.2)", lineHeight: 1.5 }}>
                  <span className="icon" style={{ fontSize: 16, verticalAlign: "middle", marginInlineEnd: 6 }}>warning</span>
                  {eligibilityError}
                </div>
              )}

              {/* Complete checkout button */}
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", padding: 16, marginTop: 12, justifyContent: "center", fontSize: 13 }}
                disabled={isSubmitting || !selectedPkg || checkingEligibility || (paymentMethod === "tamara" && isEligible === false)}
              >
                {isSubmitting 
                  ? (isRtl ? "جاري إتمام المعاملة..." : "Processing Order...") 
                  : checkingEligibility
                    ? (isRtl ? "جاري التحقق من الأهلية..." : "Checking Eligibility...")
                    : (isRtl ? `إتمام الحجز والدفع - ${selectedPkg?.price.toLocaleString()} ر.س` : `Pay & Confirm Booking - ${selectedPkg?.price.toLocaleString()} SAR`)}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="card" style={{ padding: 32, background: "var(--bg-2)", border: "1px solid var(--border)", position: "sticky", top: 100 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 20, textAlign: isRtl ? "right" : "left" }}>
              {isRtl ? "ملخص الحجز والطلب" : "Booking Summary"}
            </h3>

            {selectedPkg ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: isRtl ? "right" : "left" }}>
                
                {/* Select Package Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--text-dim)" }}>{isRtl ? "الباقة المختارة" : "Selected Package"}</label>
                  <select 
                    value={selectedPkg.id} 
                    onChange={handlePackageChange}
                    style={{ padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-3)", color: "var(--text)", width: "100%", fontSize: 13, appearance: "none" }}
                  >
                    {packages.map(p => <option key={p.id} value={p.id} style={{background: "#1a1114"}}>{isRtl && p.name_ar ? p.name_ar : p.name}</option>)}
                  </select>
                </div>

                {/* Package price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px dashed var(--border)", paddingBottom: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{isRtl ? "سعر الباقة:" : "Package Price:"}</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "var(--pink)" }}>{selectedPkg.price.toLocaleString()} {t("packages.currency")}</span>
                </div>

                {/* Features Checklist */}
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)", marginBottom: 12 }}>{isRtl ? "المزايا المشمولة بالباقة:" : "Package Features Included:"}</h4>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0 }}>
                    {JSON.parse((isRtl && selectedPkg.features_ar ? selectedPkg.features_ar : selectedPkg.features) || "[]").slice(0, 4).map((f: string, i: number) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", flexDirection: isRtl ? "row-reverse" : "row" }}>
                        <span className="icon" style={{ color: "var(--pink)", fontSize: 16 }}>check</span>
                        <span style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct payment badges */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center" }}>
                    <img src="https://cdn.tamara.co/assets/svg/tamara-logo-badge-ar.svg" alt="Tamara" style={{ height: 20 }} />
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>|</span>
                    <span style={{ fontWeight: 700, fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.5 }}>MADA</span>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>|</span>
                    <span style={{ fontWeight: 700, fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.5 }}>VISA</span>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", textAlign: "center" }}>
                    {isRtl ? "مدفوعات مشفرة وآمنة 100%" : "100% Secure & Encrypted Payments"}
                  </span>
                </div>
                
              </div>
            ) : (
              <p style={{ color: "var(--text-dim)", textAlign: "center" }}>{isRtl ? "جاري تحميل تفاصيل الباقة..." : "Loading package details..."}</p>
            )}

          </div>

        </div>
      </div>
      
      <style>{`
        @media(max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-grid > div:last-child {
            position: static !important;
            order: -1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CheckoutContent />
    </Suspense>
  );
}
