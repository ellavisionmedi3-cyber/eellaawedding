"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface Booking { id: string; client_name: string; mobile: string; email: string|null; event_type: string; event_date: string|null; venue_location: string|null; package: string; additional_services: string|null; notes: string|null; status: string; created_at: string; payment_method?: string; payment_status?: string; }
interface Stats { totalBookings: number; revenue: number; galleryCount: number; newToday: number; pendingBookings: number; confirmedBookings: number; blogCount: number; subscriberCount: number; }

interface AdminProps {
  bookings: Booking[];
  stats: Stats;
  galleryItems: any[];
  blogPosts: any[];
  packages: any[];
  subscribers: any[];
  settings: Record<string, string>;
  teamMembers: any[];
  services: any[];
  addons: any[];
  reviews: any[];
}

const englishFonts = ["Playfair Display", "Inter", "Roboto", "Montserrat", "Cinzel", "Cormorant Garamond", "Libre Baskerville", "Bodoni Moda", "Prata"];
const arabicFonts = ["Tajawal", "Cairo", "Almarai", "Amiri", "Reem Kufi", "El Messiri", "Changa", "Harmattan", "Lalezar"];

export default function AdminDashboardClient({ 
  bookings: initialBookings, 
  stats, 
  galleryItems = [], 
  blogPosts = [], 
  packages: initialPackages = [], 
  subscribers = [], 
  settings = {}, 
  teamMembers = [], 
  services: initialServices = [], 
  addons: initialAddons = [],
  reviews: initialReviews = []
}: AdminProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking|null>(null);
  const [busy, setBusy] = useState<string|null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settingsState, setSettingsState] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{message:string, type:'success'|'error'} | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  
  const [bookingsList, setBookingsList] = useState(initialBookings);
  const [packagesList, setPackagesList] = useState(initialPackages);
  const [galleryList, setGalleryList] = useState(galleryItems);
  const [postsList, setPostsList] = useState(blogPosts);
  const [teamList, setTeamList] = useState(teamMembers);
  const [servicesList, setServicesList] = useState(initialServices);
  const [addonsList, setAddonsList] = useState(initialAddons);
  const [reviews, setReviews] = useState<any[]>(initialReviews);

  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [addingGalleryImage, setAddingGalleryImage] = useState<any>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 2500;
          const MAX_HEIGHT = 2500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, mimeType, 0.85);
        };
      };
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let fileToUpload: File | Blob = file;
      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
        fileToUpload = await compressImage(file);
      }
      const formData = new FormData();
      formData.append("file", fileToUpload, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setSettingsState(prev => ({ ...prev, [field]: data.url }));
        notify(isRtl ? "تم رفع الصورة بنجاح" : "Image uploaded successfully");
      } else {
        notify(isRtl ? "فشل الرفع: " + (data.error || "خطأ غير معروف") : "Upload failed: " + (data.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error(error);
      notify(isRtl ? "حدث خطأ أثناء الرفع" : "Error occurred during upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isNew = !editingPost.id;
      const res = await fetch(isNew ? "/api/blog" : `/api/blog/${editingPost.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost)
      });
      if (res.ok) {
        notify(isRtl ? "تم حفظ المقال بنجاح" : "Post saved successfully");
        setEditingPost(null);
        const postsRes = await fetch("/api/blog");
        const postsData = await postsRes.json();
        setPostsList(postsData);
      }
    } catch (e) {
      notify(isRtl ? "فشل في حفظ المقال" : "Failed to save post", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا المقال؟" : "Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPostsList(prev => prev.filter(p => p.id !== id));
        notify(isRtl ? "تم حذف المقال" : "Post deleted");
      }
    } catch (e) {
      notify(isRtl ? "فشل الحذف" : "Delete failed", "error");
    }
  };

  const saveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isNew = !editingReview.id;
      const res = await fetch(isNew ? "/api/reviews" : `/api/reviews/${editingReview.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingReview)
      });
      if (res.ok) {
        notify(isRtl ? "تم حفظ المراجعة" : "Review saved");
        setEditingReview(null);
        fetch("/api/reviews?all=true").then(r => r.json()).then(setReviews);
      }
    } catch (e) {
      notify(isRtl ? "فشل الحفظ" : "Save failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const publishPost = async (id: string, status: number) => {
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: status })
      });
      if (res.ok) {
        setPostsList(prev => prev.map(p => p.id === id ? { ...p, published: status } : p));
        notify(status ? (isRtl ? "تم النشر" : "Published") : (isRtl ? "تم الإيقاف" : "Stopped"));
      }
    } catch (e) {
      notify("Error", "error");
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('ayla_admin_auth');
    if (auth === 'true') setIsAuthorized(true);
    
    fetch("/api/bookings").then(r => r.json()).then(setBookingsList);
    fetch("/api/packages").then(r => r.json()).then(setPackagesList);
    fetch("/api/gallery").then(r => r.json()).then(setGalleryList);
    fetch("/api/blog").then(r => r.json()).then(setPostsList);
    fetch("/api/team").then(r => r.json()).then(setTeamList);
    fetch("/api/services").then(r => r.json()).then(setServicesList);
    fetch("/api/addons").then(r => r.json()).then(setAddonsList);
    fetch("/api/reviews?all=true").then(r => r.json()).then(setReviews);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctUser = settingsState.admin_username || 'admin';
    const correctPass = settingsState.admin_password || 'Ee203120@#';
    
    if (loginForm.user === correctUser && loginForm.pass === correctPass) {
      setIsAuthorized(true);
      localStorage.setItem('ayla_admin_auth', 'true');
      notify(isRtl ? "تم تسجيل الدخول" : "Logged in successfully");
    } else {
      notify(isRtl ? "بيانات الدخول غير صحيحة" : "Invalid credentials", "error");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('ayla_admin_auth');
  };

  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: isRtl ? "قيد الانتظار" : "PENDING",   bg: "rgba(255,176,204,0.12)", color: "#ffb0cc" },
    confirmed: { label: isRtl ? "مؤكد" : "CONFIRMED", bg: "rgba(145,205,255,0.12)", color: "#91cdff" },
    completed: { label: isRtl ? "مكتمل" : "COMPLETED", bg: "rgba(145,205,255,0.16)", color: "#91cdff" },
    cancelled: { label: isRtl ? "ملغي" : "CANCELLED", bg: "rgba(255,180,171,0.12)", color: "#ffb4ab" },
    "follow-up": { label: isRtl ? "متابعة" : "FOLLOW UP", bg: "rgba(209,188,255,0.12)", color: "#d1bcff" },
    processing: { label: isRtl ? "قيد المعالجة" : "PROCESSING", bg: "rgba(255,193,7,0.12)", color: "#ffc107" },
    refunded: { label: isRtl ? "مسترجع" : "REFUNDED", bg: "rgba(233,30,99,0.12)", color: "#e91e63" },
    expired: { label: isRtl ? "منتهي" : "EXPIRED", bg: "rgba(158,158,158,0.12)", color: "#9e9e9e" },
    declined: { label: isRtl ? "مرفوض" : "DECLINED", bg: "rgba(244,67,54,0.12)", color: "#f44336" }
  };

  const getPaymentMethodLabel = (b: Booking) => {
    const method = b.payment_method || "";
    if (method === "tamara") return isRtl ? "تمارا" : "Tamara";
    if (method === "mada") return isRtl ? "مدى" : "Mada";
    if (method === "card") return isRtl ? "بطاقة" : "Card";
    
    // Fallback to searching notes
    const notesText = (b.notes || "").toLowerCase();
    if (notesText.includes("tamara")) return isRtl ? "تمارا" : "Tamara";
    if (notesText.includes("mada")) return isRtl ? "مدى" : "Mada";
    if (notesText.includes("card")) return isRtl ? "بطاقة" : "Card";
    
    return isRtl ? "بطاقة" : "Card";
  };

  const filtered = filter === "all" ? bookingsList : bookingsList.filter(b => b.status === filter);


  const deleteBooking = async (id: string) => {
    if(!confirm(isRtl ? "هل أنت متأكد من حذف هذا الاستفسار؟" : "Are you sure you want to delete this inquiry?")) return;
    setBusy(id);
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setBookingsList(prev => prev.filter(b => b.id !== id));
    setBusy(null);
    notify(isRtl ? "تم حذف الاستفسار" : "Inquiry deleted");
    router.refresh();
  };

  const exportBookings = () => {
    const csvRows = [];
    const headers = isRtl ? ["الاسم", "رقم الجوال"] : ["Name", "Mobile"];
    csvRows.push(headers.join(","));
    for (const b of bookingsList) {
      csvRows.push(`${b.client_name},${b.mobile}`);
    }
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inquiries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/api/bookings/${id}`, { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ status }) 
    });
    setBusy(null);
    router.refresh();
  };

  const saveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingTeamMember.id ? "PATCH" : "POST";
    const url = editingTeamMember.id ? `/api/team/${editingTeamMember.id}` : "/api/team";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTeamMember),
      });
      if (res.ok) {
        setEditingTeamMember(null);
        notify(isRtl ? "تم حفظ العضو بنجاح" : "Member saved successfully");
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingService.id ? "PATCH" : "POST";
    const url = editingService.id ? `/api/services/${editingService.id}` : "/api/services";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      });
      if (res.ok) {
        setEditingService(null);
        notify(isRtl ? "تم حفظ الخدمة بنجاح" : "Service saved successfully");
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingAddon.id ? "PATCH" : "POST";
    const url = editingAddon.id ? `/api/addons/${editingAddon.id}` : "/api/addons";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAddon),
      });
      if (res.ok) {
        setEditingAddon(null);
        notify(isRtl ? "تم حفظ الخدمة الإضافية بنجاح" : "Add-on saved successfully");
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: "Overview", icon: "grid_view", label: t("admin.dashboard") },
    { id: "Gallery", icon: "photo_library", label: t("admin.gallery") },
    { id: "Pricing", icon: "payments", label: t("admin.pricing") },
    { id: "Blog", icon: "article", label: t("admin.blog") },
    { id: "Inquiries", icon: "mail", label: t("admin.inquiries") },
    { id: "Subscribers", icon: "group", label: t("admin.subscribers") },
    { id: "Team", icon: "badge", label: isRtl ? "فريق العمل" : "Team" },
    { id: "Services", icon: "photo_camera", label: isRtl ? "الخدمات" : "Services" },
    { id: "Addons", icon: "add_circle", label: isRtl ? "الخدمات الإضافية" : "Add-ons" },
    { id: "Reviews", icon: "star", label: isRtl ? "المراجعات" : "Reviews" },
    { id: "Settings", icon: "settings", label: isRtl ? "الإعدادات" : "Settings" },
  ];

  const statCards = [
    { label: t("admin.totalBookings"), value: stats.totalBookings, icon: "calendar_month", badge: null, color: "var(--pink)" },
    { label: t("admin.revenue"), value: stats.revenue.toLocaleString(), icon: "payments", badge: isRtl ? "ريال" : "SAR", color: "var(--pink)" },
    { label: t("admin.visits"), value: "4,210", icon: "visibility", badge: null, color: "var(--cyan)" },
    { label: t("admin.newInquiries"), value: stats.newToday, icon: "mail", badge: isRtl ? "جديد" : "NEW", color: "var(--pink)" },
  ];

  const s = (obj: React.CSSProperties): React.CSSProperties => obj;

  if (!isAuthorized) {
    return (
      <div style={s({ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 })}>
        <div className="anim-scale-in" style={s({ background: "var(--surface)", border: "1px solid var(--border)", padding: isMobile ? 20 : 40, borderRadius: "var(--radius)", width: "100%", maxWidth: isMobile ? "95vw" : 400, textAlign: isRtl ? "right" : "left", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" })}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={s({ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--pink)", marginBottom: 8 })}>Ella Media</h1>
            <p style={s({ fontSize: 13, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" })}>{t("admin.portal")}</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" }}>{isRtl ? "اسم المستخدم" : "Username"}</label>
              <input type="text" required value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="admin" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" }}>{isRtl ? "كلمة المرور" : "Password"}</label>
              <input type="password" required value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: 14, marginTop: 8 }}>{isRtl ? "تسجيل الدخول" : "Login"}</button>
          </form>
          {notification && (
            <div className="anim-fade-up" style={{ marginTop: 20, padding: 12, borderRadius: 8, background: notification.type === 'error' ? "rgba(255,0,0,0.1)" : "rgba(0,255,0,0.1)", color: notification.type === 'error' ? "#ff4d4d" : "#4ade80", fontSize: 12, textAlign: "center", border: `1px solid ${notification.type === 'error' ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)"}` }}>
              {notification.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={s({ display: "flex", minHeight: "100vh", maxWidth: "100vw", overflowX: "hidden", background: "var(--bg)", color: "var(--text)", flexDirection: isRtl ? "row-reverse" : "row" })}>
      {isMobile && (
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ position: "fixed", top: 16, [isRtl ? 'right' : 'left']: 16, zIndex: 60, background: "var(--pink)", color: "#fff", border: "none", borderRadius: 8, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span className="icon">{isSidebarOpen ? "close" : "menu"}</span>
        </button>
      )}
      
      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      )}
      {/* Sidebar */}
      <aside style={s({ width: 220, flexShrink: 0, background: "var(--bg-2)", borderRight: isRtl ? "none" : "1px solid var(--border)", borderLeft: isRtl ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", padding: "28px 0", position: "fixed", top: 0, [isRtl ? 'right' : 'left']: isMobile ? (isSidebarOpen ? 0 : -250) : 0, height: "100vh", zIndex: 50, textAlign: isRtl ? "right" : "left", transition: "all 0.3s ease" })}>
        <div style={s({ padding: "0 20px 28px", borderBottom: "1px solid var(--border)" })}>
          <div style={s({ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--pink)" })}>Ayla Media</div>
          <div style={s({ fontSize: 11, color: "var(--text-dim)", marginTop: 4 })}>{t("admin.portal")}</div>
        </div>

        <nav style={s({ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, flexGrow: 1 })}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); if (isMobile) setIsSidebarOpen(false); }}
              style={s({
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: activeTab === item.id ? "rgba(255,126,179,0.12)" : "transparent",
                color: activeTab === item.id ? "#ff7eb3" : "var(--text-muted)",
                border: "none", width: "100%", textAlign: isRtl ? "right" : "left",
                flexDirection: isRtl ? "row-reverse" : "row",
                transition: "background 0.2s",
              })}
            >
              <span className="icon" style={{ fontSize: 19 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={s({ padding: "16px 12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 })}>
          <Link href="/" style={s({ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", flexDirection: isRtl ? "row-reverse" : "row" })}>
            <span className="icon" style={{ fontSize: 19 }}>home</span> {t("admin.viewSite")}
          </Link>
          <button style={s({ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: isRtl ? "right" : "left", flexDirection: isRtl ? "row-reverse" : "row" })}>
            <span className="icon" style={{ fontSize: 19 }}>settings</span> {t("admin.settings")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={s({ [isRtl ? 'marginRight' : 'marginLeft']: isMobile ? 0 : 220, flex: 1, padding: isMobile ? "80px 20px 64px" : "48px 48px 64px", overflowX: "hidden", textAlign: isRtl ? "right" : "left", transition: "all 0.3s ease", width: "100%" })}>
        
        {activeTab === "Overview" && (
          <>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <div>
                <h1 style={s({ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--text)", marginBottom: 6 })}>{t("admin.overview")}</h1>
                <p style={s({ fontSize: 14, color: "var(--text-dim)" })}>{t("admin.welcome")}</p>
              </div>
            </div>

            {/* Stat cards */}
            <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20, marginBottom: 40 })}>
              {statCards.map((c, i) => (
                <div key={i} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 28, position: "relative", overflow: "hidden" })}>
                  <div style={s({ position: "absolute", top: 12, [isRtl ? 'left' : 'right']: 12, opacity: 0.1 })}>
                    <span className="icon" style={{ fontSize: 48, color: c.color }}>{c.icon}</span>
                  </div>
                  <p style={s({ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-dim)", marginBottom: 12 })}>{c.label}</p>
                  <div style={s({ display: "flex", alignItems: "flex-end", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" })}>
                    <span style={s({ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: c.color, lineHeight: 1 })}>{c.value}</span>
                    {c.badge && <span style={s({ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: "rgba(255,176,204,0.15)", color: "var(--pink)", padding: "4px 8px", borderRadius: 20, marginBottom: 4 })}>{c.badge}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Inquiries Table */}
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <div style={s({ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 })}>{t("admin.recentInquiries")}</h2>
                <div style={s({ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" })}>
                  {["all","pending","confirmed","follow-up"].map(t_tab => (
                    <button key={t_tab} onClick={() => setFilter(t_tab)} style={s({
                      padding: "6px 16px", borderRadius: 50, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
                      background: filter === t_tab ? "var(--pink)" : "transparent",
                      color: filter === t_tab ? "#640038" : "var(--text-dim)",
                      border: filter === t_tab ? "1px solid transparent" : "1px solid var(--border)",
                    })}>{t_tab === "all" ? t("admin.viewAll") : (statusMap[t_tab]?.label)}</button>
                  ))}
                  <button onClick={exportBookings} style={s({ padding: "6px 16px", borderRadius: 50, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 })}>
                    <span className="icon" style={{fontSize: 14}}>download</span> {isRtl ? "تنزيل" : "Export"}
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left", minWidth: 600 })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    {[t("admin.client"), t("admin.date"), isRtl ? "موعد المناسبة" : "Event Date", t("contact.form.package"), t("admin.status"), t("admin.action")].map(h => (
                      <th key={h} style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-dim)" })}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={s({ padding: isMobile ? 20 : 40, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا توجد طلبات حجز حالياً" : "No booking requests found"}</td></tr>
                  ) : filtered.map(b => {
                    const st = statusMap[b.status] || statusMap.pending;
                    return (
                      <tr key={b.id} style={s({ borderTop: "1px solid var(--border)" })}>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{b.client_name}</div>
                          <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 2 })}>{b.mobile}</div>
                        </td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" })}>{new Date(b.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "#fff", fontWeight: 600 })}>{b.event_date || "-"}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--pink)", textTransform: "capitalize", fontWeight: 600 })}>{b.package}</td>
                        <td style={s({ padding: "16px 20px" })}>
                          <span style={s({ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", background: st.bg, color: st.color })}>{st.label}</span>
                        </td>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ display: "flex", gap: 8, justifyContent: isRtl ? "flex-end" : "flex-start" })}>
                            <select 
                              value={b.status} 
                              onChange={(e) => updateStatus(b.id, e.target.value)}
                              disabled={busy === b.id}
                              style={s({ 
                                padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, 
                                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", 
                                color: "var(--text)", cursor: "pointer", appearance: "none", textAlign: "center"
                              })}
                            >
                              {Object.entries(statusMap).map(([k, v]) => (
                                <option key={k} value={k} style={{background: "#1a1114"}}>{v.label}</option>
                              ))}
                            </select>
                            <button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>
                              <span className="icon" style={{ fontSize: 16 }}>visibility</span>
                            </button>
                            <button onClick={() => deleteBooking(b.id)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.2)", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" })}>
                              <span className="icon" style={{ fontSize: 16 }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
             </div>
            </div>
          </>
        )}

        {activeTab === "Gallery" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.gallery")}</h2>
              <button onClick={() => setAddingGalleryImage({ image_url: "", title: "", category: "Wedding" })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ إضافة صورة</button>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 })}>
              {galleryItems.map((item: any) => (
                <div key={item.id} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", position: "relative" })}>
                  <div style={s({ height: 160, backgroundImage: `url(${item.image_url})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundColor: "rgba(0,0,0,0.1)" })} />
                  <div style={s({ padding: 12 })}>
                    <div style={s({ fontSize: 14, fontWeight: 600 })}>{item.title}</div>
                    <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 4 })}>{item.category} • {item.year}</div>
                  </div>
                  <button 
                    onClick={() => setAddingGalleryImage({...item})}
                    style={{ position: "absolute", top: 8, [isRtl ? 'left' : 'right']: 8, background: "rgba(0,0,0,0.6)", color: "var(--pink)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span className="icon" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm(isRtl ? "هل أنت متأكد من حذف هذه الصورة؟" : "Are you sure you want to delete this image?")) {
                        await fetch(`/api/gallery/${item.id}`, { method: 'DELETE' });
                        router.refresh();
                      }
                    }}
                    style={{ position: "absolute", top: 8, [isRtl ? 'right' : 'left']: 8, background: "rgba(0,0,0,0.6)", color: "#ff4d4d", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span className="icon" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
              {galleryItems.length === 0 && <p style={s({ color: "var(--text-dim)" })}>{isRtl ? "لا توجد صور" : "No images found."}</p>}
            </div>
          </div>
        )}

        {activeTab === "Blog" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.blog")}</h2>
              <button onClick={() => setEditingPost({ title: "", title_ar: "", content: "", content_ar: "", category: "General", image_url: "", published: 0 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ مقال جديد</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>العنوان</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>التصنيف</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>الحالة</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post: any) => (
                    <tr key={post.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px", fontSize: 14, fontWeight: 600 })}>{isRtl ? (post.title_ar || post.title) : post.title}</td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" })}>{isRtl ? (post.category_ar || post.category) : post.category}</td>
                      <td style={s({ padding: "16px 20px" })}>
                        <span style={s({ padding: "4px 10px", borderRadius: 20, fontSize: 10, background: post.published ? "rgba(145,205,255,0.12)" : "rgba(255,255,255,0.1)", color: post.published ? "#91cdff" : "var(--text-muted)" })}>
                          {post.published ? (isRtl ? "منشور" : "Published") : (isRtl ? "مسودة" : "Draft")}
                        </span>
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <button onClick={() => setEditingPost(post)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "هل أنت متأكد من حذف هذا المقال؟" : "Are you sure you want to delete this post?")) {
                              await fetch(`/api/blog/${post.id}`, { method: 'DELETE' });
                              router.refresh();
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogPosts.length === 0 && <tr><td colSpan={3} style={s({ padding: 20, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا توجد مقالات" : "No posts found."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Pricing" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.pricing")}</h2>
              <button onClick={() => setEditingPackage({ name: "", name_ar: "", price: 0, description: "", description_ar: "", features: [], features_ar: [] })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ باقة جديدة</button>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 })}>
              {packagesList.map((pkg: any) => (
                <div key={pkg.id} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 })}>
                  <div style={s({ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                    <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--pink)" })}>{isRtl ? (pkg.name_ar || pkg.name) : pkg.name}</h3>
                    <span style={s({ fontSize: 18, fontWeight: 700 })}>{pkg.price.toLocaleString()} {isRtl ? "ريال" : "SAR"}</span>
                  </div>
                  <p style={s({ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 })}>{isRtl ? (pkg.description_ar || pkg.description) : pkg.description}</p>
                  <button onClick={() => {
                    setEditingPackage({
                      ...pkg,
                      features: typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : (pkg.features || []),
                      features_ar: typeof pkg.features_ar === 'string' ? JSON.parse(pkg.features_ar || '[]') : (pkg.features_ar || [])
                    });
                  }} style={s({ width: "100%", padding: "8px 0", background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, cursor: "pointer" })}>{isRtl ? "تعديل الباقة" : "Edit Package"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Inquiries" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.inquiries")}</h2>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    {[t("admin.client"), t("admin.date"), t("contact.form.package"), isRtl ? "طريقة الدفع" : "Payment Method", t("admin.status"), t("admin.action")].map(h => (
                      <th key={h} style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-dim)" })}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map(b => {
                    const st = statusMap[b.status] || statusMap.pending;
                    return (
                      <tr key={b.id} style={s({ borderTop: "1px solid var(--border)" })}>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{b.client_name}</div>
                          <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 2 })}>{b.mobile}</div>
                        </td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" })}>{new Date(b.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--pink)", textTransform: "capitalize", fontWeight: 600 })}>{b.package}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)", textTransform: "capitalize", fontWeight: 600 })}>{getPaymentMethodLabel(b)}</td>
                        <td style={s({ padding: "16px 20px" })}>
                          <span style={s({ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", background: st.bg, color: st.color })}>{st.label}</span>
                        </td>
                        <td style={s({ padding: "16px 20px" })}>
                          <button onClick={() => setSelected(b)} style={s({ padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: 12 })}>التفاصيل</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Blog" && (
          <div className="anim-fade-up">
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "إدارة المدونة" : "Blog Management"}</h2>
              <button 
                onClick={() => setEditingPost({ 
                  title: "", title_ar: "", slug: "", excerpt: "", excerpt_ar: "", 
                  content: "", content_ar: "", image_url: "", category: "Wedding", 
                  category_ar: "زفاف", author: "Layan Ahmed", read_time: "5 min read", read_time_ar: "5 دقائق للقراءة", 
                  published: 1 
                })} 
                className="btn btn-primary" 
                style={s({ padding: "8px 16px", fontSize: 12 })}
              >
                + {isRtl ? "مقال جديد" : "New Post"}
              </button>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 })}>
              {postsList.map(post => (
                <div key={post.id} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", display: "flex", flexDirection: "column" })}>
                  <div style={s({ height: 160, backgroundImage: `url(${post.image_url})`, backgroundSize: "cover", backgroundPosition: "center" })} />
                  <div style={s({ padding: 20, flex: 1, textAlign: isRtl ? "right" : "left" })}>
                    <div style={s({ fontSize: 10, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase", marginBottom: 8 })}>{isRtl ? post.category_ar : post.category}</div>
                    <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text)" })}>{isRtl ? post.title_ar : post.title}</h3>
                    <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", flexDirection: isRtl ? "row-reverse" : "row" })}>
                      <div style={s({ display: "flex", gap: 8 })}>
                        <button onClick={() => setEditingPost(post)} style={s({ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontSize: 12 })}>{isRtl ? "تعديل" : "Edit"}</button>
                        <button onClick={() => deletePost(post.id)} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 12 })}>{isRtl ? "حذف" : "Delete"}</button>
                      </div>
                      <span style={s({ fontSize: 11, color: post.published ? "var(--cyan)" : "var(--text-dim)" })}>{post.published ? (isRtl ? "منشور" : "Published") : (isRtl ? "مسودة" : "Draft")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Subscribers" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.subscribers")}</h2>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{t("contact.form.email")}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{t("admin.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub: any) => (
                    <tr key={sub.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px", fontSize: 14 })}>{sub.email}</td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" })}>{new Date(sub.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && <tr><td colSpan={2} style={s({ padding: 20, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا يوجد مشتركون" : "No subscribers found."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Team" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "فريق العمل" : "Our Team"}</h2>
              <button onClick={() => setEditingTeamMember({ name: "", name_ar: "", role: "", role_ar: "", image_url: "", order: teamMembers.length + 1 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ إضافة عضو</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "العضو" : "Member"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "الدور" : "Role"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member: any) => (
                    <tr key={member.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", alignItems: "center", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <div style={s({ width: 40, height: 40, borderRadius: "50%", background: `url(${member.image_url}) center/cover`, border: "1px solid var(--border)" })} />
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? (member.name_ar || member.name) : member.name}</div>
                        </div>
                      </td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" })}>{isRtl ? (member.role_ar || member.role) : member.role}</td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <button onClick={() => setEditingTeamMember(member)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "حذف هذا العضو؟" : "Delete this member?")) {
                              await fetch(`/api/team/${member.id}`, { method: 'DELETE' });
                              router.refresh();
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Services" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "الخدمات" : "Services"}</h2>
              <button onClick={() => setEditingService({ title: "", title_ar: "", desc: "", desc_ar: "", image_url: "", order: servicesList.length + 1 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ خدمة جديدة</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "الخدمة" : "Service"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesList.map((service: any) => (
                    <tr key={service.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", alignItems: "center", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <div style={s({ width: 60, height: 40, borderRadius: 8, background: `url(${service.image_url}) center/cover`, border: "1px solid var(--border)" })} />
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? (service.title_ar || service.title) : service.title}</div>
                        </div>
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <button onClick={() => setEditingService(service)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "حذف هذه الخدمة؟" : "Delete this service?")) {
                              await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
                              router.refresh();
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Addons" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "الخدمات الإضافية" : "Add-ons"}</h2>
              <button onClick={() => setEditingAddon({ name: "", name_ar: "", active: 1 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ إضافة خيار</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "الخدمة" : "Add-on"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {addonsList.map((addon: any) => (
                    <tr key={addon.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? (addon.name_ar || addon.name) : addon.name}</div>
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <button onClick={() => setEditingAddon(addon)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "حذف هذا الخيار؟" : "Delete this option?")) {
                              await fetch(`/api/addons/${addon.id}`, { method: 'DELETE' });
                              router.refresh();
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>إعدادات الموقع</h2>
              <button 
                className="btn btn-primary" 
                style={s({ padding: "8px 24px", fontSize: 13 })}
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await fetch("/api/settings", { 
                      method: "PATCH", 
                      headers: { "Content-Type": "application/json" }, 
                      body: JSON.stringify(settingsState) 
                    });
                    if (res.ok) {
                      alert(isRtl ? "تم حفظ جميع التغييرات بنجاح!" : "All changes saved successfully!");
                    } else {
                      alert(isRtl ? "فشل الحفظ، يرجى المحاولة مرة أخرى" : "Save failed, please try again");
                    }
                  } catch (e) {
                    alert(isRtl ? "حدث خطأ أثناء الاتصال بالخادم" : "Error connecting to server");
                  }
                  setIsSaving(false);
                  router.refresh();
                }}
              >
                {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
            
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, display: "flex", flexDirection: "column", gap: 32 })}>
              
              {/* Branding Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>الهوية البصرية</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "رابط الشعار (URL)" : "Logo URL"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        type="text" 
                        value={settingsState.logo_url || ""} 
                        onChange={e => setSettingsState({ ...settingsState, logo_url: e.target.value })}
                        style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, fontFamily: "monospace" })} 
                        placeholder="https://..."
                      />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "logo_url")} />
                      </label>
                    </div>
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "حجم الشعار (بيكسل)" : "Logo Width (px)"}</label>
                    <input 
                      type="number" 
                      value={settingsState.logo_width || "150"} 
                      onChange={e => setSettingsState({ ...settingsState, logo_width: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                    />
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>الخطوط (Google Fonts)</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الخط الإنجليزي الأساسي" : "Primary English Font"}</label>
                    <select 
                      value={settingsState.font_en || "Playfair Display"} 
                      onChange={e => setSettingsState({ ...settingsState, font_en: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, appearance: "none" })}
                    >
                      {englishFonts.map(f => <option key={f} value={f} style={{background: "#1a1114"}}>{f}</option>)}
                      {!englishFonts.includes(settingsState.font_en || "") && settingsState.font_en && <option value={settingsState.font_en}>{settingsState.font_en} (Custom)</option>}
                    </select>
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الخط العربي الأساسي" : "Primary Arabic Font"}</label>
                    <select 
                      value={settingsState.font_ar || "Tajawal"} 
                      onChange={e => setSettingsState({ ...settingsState, font_ar: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, appearance: "none" })}
                    >
                      {arabicFonts.map(f => <option key={f} value={f} style={{background: "#1a1114"}}>{f}</option>)}
                      {!arabicFonts.includes(settingsState.font_ar || "") && settingsState.font_ar && <option value={settingsState.font_ar}>{settingsState.font_ar} (Custom)</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>الوسائط والصور</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>

                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صور الهيدر (Hero Images)" : "Hero Images"}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 12, marginBottom: 8 }}>
                      {(settingsState.hero_bg_url || "").split(",").filter(Boolean).map((imgUrl: string, idx: number) => (
                        <div key={idx} style={{ position: "relative", height: 80, borderRadius: 8, backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid var(--border)" }}>
                          <button 
                            onClick={() => {
                              setSettingsState(prev => {
                                const arr = (prev.hero_bg_url || "").split(",").filter(Boolean);
                                arr.splice(idx, 1);
                                return {...prev, hero_bg_url: arr.join(",")};
                              });
                            }}
                            style={{ position: "absolute", top: -6, right: -6, background: "var(--pink)", color: "#fff", border: "none", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}
                          >×</button>
                        </div>
                      ))}
                      <label style={{ height: 80, borderRadius: 8, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-dim)" }}>
                        <span className="icon">add</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          try {
                            const blob = await compressImage(file);
                            const formData = new FormData();
                            formData.append("file", blob, file.name);
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setSettingsState(prev => {
                                const arr = (prev.hero_bg_url || "").split(",").filter(Boolean);
                                arr.push(data.url);
                                return {...prev, hero_bg_url: arr.join(",")};
                              });
                              notify(isRtl ? "تم رفع الصورة بنجاح" : "Image uploaded successfully");
                            }
                          } catch (err) {
                            notify(isRtl ? "حدث خطأ أثناء الرفع" : "Error occurred during upload", "error");
                          } finally {
                            setIsUploading(false);
                          }
                        }} />
                      </label>
                    </div>
                    <span style={s({ fontSize: 11, color: "var(--text-muted)" })}>{isRtl ? "يمكنك إضافة صورة أو أكثر لتعمل كشريط عرض (Slider)." : "Add one or multiple images to create a slider."}</span>
                  </div>

                  {/* Hero Video */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "فيديو الخلفية (Hero Video)" : "Hero Background Video"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.hero_video_url || ""} onChange={e => setSettingsState({ ...settingsState, hero_video_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleUpload(e, "hero_video_url")} />
                      </label>
                    </div>
                    <span style={s({ fontSize: 11, color: "#ffb0cc", fontWeight: 600 })}>
                      {isRtl ? "ملاحظة: إذا كان حجم الفيديو أكبر من 4.5 ميجابايت، يرجى وضع الرابط مباشرة بدلاً من الرفع." : "Note: If video is > 4.5MB, please paste a direct link instead of uploading."}
                    </span>
                  </div>



              {/* Hero Content Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "نصوص الهيدر (Hero Content)" : "Hero Content"}</h3>
                
                {/* Global Hero Settings */}
                <div style={s({ marginBottom: 32, padding: 20, background: "rgba(255,176,204,0.03)", borderRadius: 12, border: "1px solid var(--border)" })}>
                  <h4 style={s({ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--pink)" })}>{isRtl ? "إعدادات عامة (العنوان العلوي والأزرار)" : "Global Settings (Tagline & Buttons)"}</h4>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان الصغير العلوي (EN)" : "Upper Tagline (EN)"}</label>
                        <input type="text" value={settingsState.hero_tagline_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_tagline_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان الصغير العلوي (AR)" : "Upper Tagline (AR)"}</label>
                        <input type="text" value={settingsState.hero_tagline_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_tagline_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "نص زر احجز الآن (EN)" : "CTA Button 1 (EN)"}</label>
                        <input type="text" value={settingsState.hero_cta1_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_cta1_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "نص زر احجز الآن (AR)" : "CTA Button 1 (AR)"}</label>
                        <input type="text" value={settingsState.hero_cta1_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_cta1_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "نص زر المعرض (EN)" : "CTA Button 2 (EN)"}</label>
                        <input type="text" value={settingsState.hero_cta2_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_cta2_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "نص زر المعرض (AR)" : "CTA Button 2 (AR)"}</label>
                        <input type="text" value={settingsState.hero_cta2_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_cta2_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Slide 1 */}
                {/* Hero Media */}
                <div style={s({ marginBottom: 32, padding: 20, background: "rgba(255,176,204,0.02)", borderRadius: 12, border: "1px solid var(--pink)" })}>
                  <h4 style={s({ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--pink)" })}>{isRtl ? "فيديو الخلفية والصور" : "Background Video & Images"}</h4>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "رابط فيديو الهيرو (YouTube/Drive)" : "Hero Video URL (YouTube/Drive)"}</label>
                        <input type="text" value={settingsState.hero_video_url || ""} onChange={e => setSettingsState({ ...settingsState, hero_video_url: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder="https://..." />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "صور الهيرو (روابط مفصولة بفاصلة)" : "Hero Background Images (Comma separated URLs)"}</label>
                        <input type="text" value={settingsState.hero_bg_url || ""} onChange={e => setSettingsState({ ...settingsState, hero_bg_url: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder="https://..., https://..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={s({ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px solid var(--border)" })}>
                  <h4 style={s({ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--pink)" })}>{isRtl ? "الشريحة 1 (الأساسية)" : "Slide 1 (Main)"}</h4>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان الأساسي (EN)" : "Primary Title (EN)"}</label>
                        <input type="text" value={settingsState.hero_title_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_title_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان الأساسي (AR)" : "Primary Title (AR)"}</label>
                        <input type="text" value={settingsState.hero_title_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_title_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الكلمة الملونة (EN)" : "Gradient Text (EN)"}</label>
                        <input type="text" value={settingsState.hero_span_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_span_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الكلمة الملونة (AR)" : "Gradient Text (AR)"}</label>
                        <input type="text" value={settingsState.hero_span_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_span_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (EN)" : "Description (EN)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (AR)" : "Description (AR)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 2 */}
                <div style={s({ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px solid var(--border)" })}>
                  <h4 style={s({ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--cyan)" })}>{isRtl ? "الشريحة 2" : "Slide 2"}</h4>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (EN)" : "Title (EN)"}</label>
                        <input type="text" value={settingsState.hero_title2_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_title2_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (AR)" : "Title (AR)"}</label>
                        <input type="text" value={settingsState.hero_title2_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_title2_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (EN)" : "Description (EN)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc2_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc2_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (AR)" : "Description (AR)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc2_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc2_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 3 */}
                <div style={s({ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px solid var(--border)" })}>
                  <h4 style={s({ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--purple)" })}>{isRtl ? "الشريحة 3" : "Slide 3"}</h4>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (EN)" : "Title (EN)"}</label>
                        <input type="text" value={settingsState.hero_title3_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_title3_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (AR)" : "Title (AR)"}</label>
                        <input type="text" value={settingsState.hero_title3_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_title3_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                    <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (EN)" : "Description (EN)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc3_en || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc3_en: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                      </div>
                      <div>
                        <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (AR)" : "Description (AR)"}</label>
                        <textarea rows={2} value={settingsState.hero_desc3_ar || ""} onChange={e => setSettingsState({ ...settingsState, hero_desc3_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Images */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "صور أقسام الموقع" : "Section Images"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  
                  {/* About Hero */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة غلاف صفحة (عن أيلة)" : "About Page Hero"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_hero_url || ""} onChange={e => setSettingsState({ ...settingsState, about_hero_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_hero_url")} />
                      </label>
                    </div>
                  </div>

                  {/* Pricing Teaser */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة قسم الباقات (الرئيسية)" : "Pricing Teaser Image"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.pricing_teaser_url || ""} onChange={e => setSettingsState({ ...settingsState, pricing_teaser_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "pricing_teaser_url")} />
                      </label>
                    </div>
                  </div>

                  {/* About Vision */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الرؤية (صفحة عن أيلة)" : "About Vision Image"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_vision_url || ""} onChange={e => setSettingsState({ ...settingsState, about_vision_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_vision_url")} />
                      </label>
                    </div>
                  </div>

                  {/* Team 1 */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الفريق 1" : "Team Image 1"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_team_1_url || ""} onChange={e => setSettingsState({ ...settingsState, about_team_1_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_team_1_url")} />
                      </label>
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الفريق 2" : "Team Image 2"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_team_2_url || ""} onChange={e => setSettingsState({ ...settingsState, about_team_2_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_team_2_url")} />
                      </label>
                    </div>
                  </div>

                  {/* Team 3 */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الفريق 3" : "Team Image 3"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_team_3_url || ""} onChange={e => setSettingsState({ ...settingsState, about_team_3_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_team_3_url")} />
                      </label>
                    </div>
                  </div>

                  {/* Team 4 */}
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الفريق 4" : "Team Image 4"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.about_team_4_url || ""} onChange={e => setSettingsState({ ...settingsState, about_team_4_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "about_team_4_url")} />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Contact Info Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "معلومات التواصل" : "Contact Information"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "البريد الإلكتروني" : "Contact Email"}</label>
                    <input type="email" value={settingsState.contact_email || ""} onChange={e => setSettingsState({ ...settingsState, contact_email: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="studio@aylamedia.sa" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "رقم الهاتف" : "Contact Phone"}</label>
                    <input type="text" value={settingsState.contact_phone || ""} onChange={e => setSettingsState({ ...settingsState, contact_phone: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="966500000000" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "العنوان (EN)" : "Address (EN)"}</label>
                    <input type="text" value={settingsState.contact_address || ""} onChange={e => setSettingsState({ ...settingsState, contact_address: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="Riyadh, KSA" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "العنوان (AR)" : "Address (AR)"}</label>
                    <input type="text" value={settingsState.contact_address_ar || ""} onChange={e => setSettingsState({ ...settingsState, contact_address_ar: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, textAlign: "right" })} placeholder="الرياض، السعودية" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8, gridColumn: "span 2" })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "رابط الخريطة (Google Maps Embed)" : "Google Maps Embed URL"}</label>
                    <input type="text" value={settingsState.contact_map_url || ""} onChange={e => setSettingsState({ ...settingsState, contact_map_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://www.google.com/maps/embed?..." />
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>روابط السوشيال ميديا</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Instagram</label>
                    <input 
                      type="text" 
                      value={settingsState.social_instagram || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_instagram: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>TikTok</label>
                    <input 
                      type="text" 
                      value={settingsState.social_tiktok || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_tiktok: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Snapchat</label>
                    <input 
                      type="text" 
                      value={settingsState.social_snapchat || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_snapchat: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://snapchat.com/add/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>WhatsApp</label>
                    <input 
                      type="text" 
                      value={settingsState.social_whatsapp || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_whatsapp: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="966500000000"
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>LinkedIn</label>
                    <input 
                      type="text" 
                      value={settingsState.social_linkedin || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_linkedin: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Behance</label>
                    <input 
                      type="text" 
                      value={settingsState.social_behance || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_behance: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://behance.net/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>X / Twitter</label>
                    <input 
                      type="text" 
                      value={settingsState.social_x || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_x: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>YouTube</label>
                    <input 
                      type="text" 
                      value={settingsState.social_youtube || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_youtube: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Facebook</label>
                    <input 
                      type="text" 
                      value={settingsState.social_facebook || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_facebook: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Promo Popup Settings */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "مربع العروض الترويجية" : "Promotional Popup"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "تفعيل المربع" : "Enable Popup"}</label>
                    <select value={settingsState.promo_enabled || "0"} onChange={e => setSettingsState({ ...settingsState, promo_enabled: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })}>
                      <option value="0" style={{background: "#1a1114"}}>{isRtl ? "معطل" : "Disabled"}</option>
                      <option value="1" style={{background: "#1a1114"}}>{isRtl ? "مفعل" : "Enabled"}</option>
                    </select>
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "مدة الظهور (ثواني)" : "Interval (Seconds)"}</label>
                    <input type="number" value={settingsState.promo_interval || "20"} onChange={e => setSettingsState({ ...settingsState, promo_interval: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="20" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "عنوان العرض (EN)" : "Promo Title (EN)"}</label>
                    <input type="text" value={settingsState.promo_title_en || ""} onChange={e => setSettingsState({ ...settingsState, promo_title_en: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="Special Offer" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "عنوان العرض (AR)" : "Promo Title (AR)"}</label>
                    <input type="text" value={settingsState.promo_title_ar || ""} onChange={e => setSettingsState({ ...settingsState, promo_title_ar: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, textAlign: "right" })} placeholder="عرض خاص" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "نص العرض (EN)" : "Promo Text (EN)"}</label>
                    <textarea rows={3} value={settingsState.promo_text_en || ""} onChange={e => setSettingsState({ ...settingsState, promo_text_en: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "نص العرض (AR)" : "Promo Text (AR)"}</label>
                    <textarea rows={3} value={settingsState.promo_text_ar || ""} onChange={e => setSettingsState({ ...settingsState, promo_text_ar: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, textAlign: "right" })} />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8, gridColumn: "span 2" })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة العرض (اختياري)" : "Promo Image URL (Optional)"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="text" value={settingsState.promo_image_url || ""} onChange={e => setSettingsState({ ...settingsState, promo_image_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "promo_image_url")} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Access */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "بيانات الدخول للوحة التحكم" : "Admin Dashboard Access"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "اسم المستخدم" : "Admin Username"}</label>
                    <input type="text" value={settingsState.admin_username || ""} onChange={e => setSettingsState({ ...settingsState, admin_username: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="admin" />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "كلمة السر الجديدة" : "New Admin Password"}</label>
                    <input type="text" value={settingsState.admin_password || ""} onChange={e => setSettingsState({ ...settingsState, admin_password: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="••••••••" />
                  </div>
                </div>
                <p style={s({ fontSize: 11, color: "var(--text-muted)", marginTop: 12 })}>{isRtl ? "ملاحظة: سيتم تطبيق كلمة السر الجديدة فور حفظ الإعدادات." : "Note: The new password will be active as soon as you save settings."}</p>
              </div>

            </div>
          </div>
              {/* Save Button for Settings */}
              <div style={s({ borderTop: "1px solid var(--border)", paddingTop: 32, marginTop: 16, display: "flex", justifyContent: "flex-end" })}>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      const res = await fetch("/api/settings", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(settingsState),
                      });
                      if (res.ok) {
                        notify(isRtl ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully");
                        // Clear client-side cache and re-fetch
                        router.refresh();
                        setTimeout(() => window.location.reload(), 1000); // Forced reload to ensure settings are picked up everywhere
                      } else {
                        notify(isRtl ? "فشل الحفظ" : "Save failed", "error");
                      }
                    } catch (e) {
                      notify(isRtl ? "خطأ في الاتصال" : "Network error", "error");
                    } finally {
                      setIsSaving(false);
                    }
                  }} 
                  className="btn btn-primary" 
                  disabled={isSaving}
                  style={s({ padding: "12px 40px", fontSize: 15, opacity: isSaving ? 0.7 : 1 })}
                >
                  {isSaving ? "..." : (isRtl ? "حفظ كافة الإعدادات" : "Save All Settings")}
                </button>
              </div>

            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="anim-fade-up">
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "مراجعات العملاء" : "Client Reviews"}</h2>
              <button onClick={() => setEditingReview({ client_name: "", client_name_ar: "", comment: "", comment_ar: "", rating: 5, approved: 1 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>+ {isRtl ? "إضافة مراجعة" : "Add Review"}</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "العميل" : "Client"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "المراجعة" : "Review"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "الحالة" : "Status"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev: any) => (
                    <tr key={rev.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? (rev.client_name_ar || rev.client_name) : rev.client_name}</div>
                        <div style={s({ color: "var(--pink)", fontSize: 12, marginTop: 4 })}>{"★".repeat(rev.rating)}</div>
                      </td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        {isRtl ? (rev.comment_ar || rev.comment) : rev.comment}
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <span style={s({ padding: "4px 10px", borderRadius: 20, fontSize: 10, background: rev.approved ? "rgba(145,205,255,0.12)" : "rgba(255,255,255,0.1)", color: rev.approved ? "#91cdff" : "var(--text-muted)" })}>
                          {rev.approved ? (isRtl ? "معتمد" : "Approved") : (isRtl ? "بانتظار الاعتماد" : "Pending")}
                        </span>
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          {!rev.approved && (
                            <button onClick={async () => {
                              const res = await fetch("/api/reviews", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: rev.id, approved: 1 })
                              });
                              if (res.ok) {
                                setReviews(reviews.map(r => r.id === rev.id ? { ...r, approved: 1 } : r));
                                notify(isRtl ? "تم الاعتماد" : "Approved");
                              }
                            }} style={s({ background: "none", border: "none", color: "#4dff88", cursor: "pointer", fontSize: 13 })}>{isRtl ? "اعتماد" : "Approve"}</button>
                          )}
                          <button onClick={() => setEditingReview(rev)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "حذف هذه المراجعة؟" : "Delete this review?")) {
                              const res = await fetch(`/api/reviews?id=${rev.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setReviews(reviews.filter(r => r.id !== rev.id));
                                notify(isRtl ? "تم الحذف" : "Deleted");
                              }
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && <tr><td colSpan={4} style={s({ padding: 20, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا توجد مراجعات" : "No reviews found."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
  </main>

      {/* Booking Details Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 })}>
          <div onClick={e => e.stopPropagation()} style={s({ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 24, padding: isMobile ? 20 : 40, maxWidth: isMobile ? "95vw" : 500, width: "100%", textAlign: isRtl ? "right" : "left" })}>
            <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, marginBottom: 28 })}>{t("admin.bookingDetails")}</h3>
            {[
              [t("admin.client"), selected.client_name], 
              [t("contact.form.mobile"), selected.mobile], 
              [isRtl ? "موعد المناسبة" : "Event Date", selected.event_date || "—"],
              [t("contact.form.package"), selected.package],
              [isRtl ? "طريقة الدفع" : "Payment Method", getPaymentMethodLabel(selected)],
              [t("contact.form.email"), selected.email||"—"], 
              [t("contact.form.eventType"), selected.event_type],
              [isRtl ? "الموقع" : "Location", selected.venue_location || "—"],
              [isRtl ? "ملاحظات" : "Notes", selected.notes || "—"]
            ].map(([l, v]) => (
              <div key={l as string} style={s({ display: "flex", gap: 16, marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <span style={s({ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", width: 100, flexShrink: 0 })}>{l}</span>
                <span style={s({ fontSize: 14, color: "var(--text)" })}>{v}</span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => setSelected(null)}>{isRtl ? "إغلاق" : "Close"}</button>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {editingPackage && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setEditingPackage(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: 650, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{editingPackage.id ? (isRtl ? "تعديل الباقة" : "Edit Package") : (isRtl ? "باقة جديدة" : "New Package")}</h3>
              <button onClick={() => setEditingPackage(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم الباقة (إنجليزي)" : "Package Name (EN)"}</label>
                  <input type="text" value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم الباقة (عربي)" : "Package Name (AR)"}</label>
                  <input type="text" value={editingPackage.name_ar || ""} onChange={e => setEditingPackage({...editingPackage, name_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "السعر (SAR)" : "Price (SAR)"}</label>
                <input type="number" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: Number(e.target.value)})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الوصف (إنجليزي)" : "Description (EN)"}</label>
                  <textarea rows={3} value={editingPackage.description || ""} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الوصف (عربي)" : "Description (AR)"}</label>
                  <textarea rows={3} value={editingPackage.description_ar || ""} onChange={e => setEditingPackage({...editingPackage, description_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              {/* Features Editor */}
              <div style={s({ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 })}>
                <label style={s({ display: "block", fontSize: 14, fontWeight: 600, color: "var(--pink)", marginBottom: 16, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المميزات (Features)" : "Package Features"}</label>
                <div style={s({ display: "flex", flexDirection: "column", gap: 12 })}>
                  {(editingPackage.features || []).map((feat: string, idx: number) => (
                    <div key={idx} style={s({ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" })}>
                      <input 
                        type="text" 
                        placeholder={isRtl ? "الميزة بالإنجليزي..." : "Feature in EN..."}
                        value={feat} 
                        onChange={e => {
                          const newF = [...(editingPackage.features || [])];
                          newF[idx] = e.target.value;
                          setEditingPackage({...editingPackage, features: newF});
                        }} 
                        style={s({ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", fontSize: 13 })} 
                      />
                      <input 
                        type="text" 
                        placeholder={isRtl ? "الميزة بالعربي..." : "Feature in AR..."}
                        value={(editingPackage.features_ar || [])[idx] || ""} 
                        onChange={e => {
                          const newFAr = [...(editingPackage.features_ar || [])];
                          newFAr[idx] = e.target.value;
                          setEditingPackage({...editingPackage, features_ar: newFAr});
                        }} 
                        style={s({ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", fontSize: 13 })} 
                      />
                      <button onClick={() => {
                        const newF = [...(editingPackage.features || [])];
                        const newFAr = [...(editingPackage.features_ar || [])];
                        newF.splice(idx, 1);
                        newFAr.splice(idx, 1);
                        setEditingPackage({...editingPackage, features: newF, features_ar: newFAr});
                      }} style={s({ background: "rgba(255,0,0,0.1)", color: "#ff4d4d", border: "none", borderRadius: 6, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" })}>
                        <span className="icon" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      setEditingPackage({
                        ...editingPackage,
                        features: [...(editingPackage.features || []), ""],
                        features_ar: [...(editingPackage.features_ar || []), ""]
                      });
                    }}
                    style={s({ padding: "8px", background: "transparent", border: "1px dashed var(--border)", color: "var(--text-dim)", borderRadius: 6, cursor: "pointer", fontSize: 13, marginTop: 4 })}
                  >
                    {isRtl ? "+ إضافة ميزة جديدة" : "+ Add Feature"}
                  </button>
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setEditingPackage(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    const method = editingPackage.id ? "PATCH" : "POST";
                    const url = editingPackage.id ? `/api/packages/${editingPackage.id}` : "/api/packages";
                    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingPackage) });
                    setIsSaving(false);
                    setEditingPackage(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: isSaving ? 0.5 : 1 })}
                  disabled={isSaving}
                >
                  {isSaving ? "..." : (isRtl ? "حفظ" : "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Add Modal */}
      {addingGalleryImage && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setAddingGalleryImage(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: isMobile ? "95vw" : 500, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>إضافة صورة للمعرض</h3>
              <button onClick={() => setAddingGalleryImage(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الصورة" : "Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={addingGalleryImage.image_url} readOnly style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder={isRtl ? "سيظهر الرابط هنا..." : "URL will appear here..."} />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px", flexShrink: 0 }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const blob = await compressImage(file);
                        const formData = new FormData();
                        formData.append("file", blob, file.name);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) {
                          setAddingGalleryImage({...addingGalleryImage, image_url: data.url});
                          notify(isRtl ? "تم رفع الصورة" : "Image uploaded");
                        } else {
                          notify(isRtl ? "خطأ في الرفع" : "Upload failed", "error");
                        }
                      } catch (err) {
                        notify(isRtl ? "خطأ في الاتصال" : "Connection error", "error");
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
                {addingGalleryImage.image_url && <div style={{ marginTop: 12, height: 120, backgroundImage: `url(${addingGalleryImage.image_url})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", borderRadius: 8, backgroundColor: "rgba(0,0,0,0.1)" }} />}
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان" : "Title"}</label>
                <input type="text" value={addingGalleryImage.title} onChange={e => setAddingGalleryImage({...addingGalleryImage, title: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف" : "Category"}</label>
                <input type="text" value={addingGalleryImage.category} onChange={e => setAddingGalleryImage({...addingGalleryImage, category: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} placeholder="e.g., Wedding, Portrait, Commercial" />
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setAddingGalleryImage(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    if (!addingGalleryImage.image_url) return;
                    setIsSaving(true);
                    await fetch('/api/gallery', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addingGalleryImage) });
                    setIsSaving(false);
                    setAddingGalleryImage(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: (!addingGalleryImage.image_url || isSaving) ? 0.5 : 1 })}
                  disabled={!addingGalleryImage.image_url || isSaving}
                >
                  {isSaving || isUploading ? "..." : "إضافة"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Modal */}
      {editingPost && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setEditingPost(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: 800, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{editingPost.id ? "تعديل المقال" : "مقال جديد"}</h3>
              <button onClick={() => setEditingPost(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان (إنجليزي)" : "Title (EN)"}</label>
                  <input type="text" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان (عربي)" : "Title (AR)"}</label>
                  <input type="text" value={editingPost.title_ar || ""} onChange={e => setEditingPost({...editingPost, title_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف (إنجليزي)" : "Category (EN)"}</label>
                  <input type="text" value={editingPost.category || ""} onChange={e => setEditingPost({...editingPost, category: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف (عربي)" : "Category (AR)"}</label>
                  <input type="text" value={editingPost.category_ar || ""} onChange={e => setEditingPost({...editingPost, category_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "صورة المقال" : "Featured Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={editingPost.image_url || ""} readOnly style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder={isRtl ? "سيظهر الرابط هنا..." : "URL will appear here..."} />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px", flexShrink: 0 }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      try {
                        const blob = await compressImage(file);
                        const formData = new FormData();
                        formData.append("file", blob, file.name);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) {
                          setEditingPost({...editingPost, image_url: data.url});
                          notify(isRtl ? "تم رفع الصورة" : "Image uploaded");
                        } else {
                          notify(isRtl ? "خطأ في الرفع" : "Upload failed", "error");
                        }
                      } catch (err) {
                        notify(isRtl ? "خطأ في الاتصال" : "Connection error", "error");
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
                {editingPost.image_url && <div style={{ marginTop: 12, height: 160, backgroundImage: `url(${editingPost.image_url})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 8 }} />}
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المحتوى (إنجليزي)" : "Content (EN)"}</label>
                  <textarea rows={8} value={editingPost.content || ""} onChange={e => setEditingPost({...editingPost, content: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", resize: "vertical" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المحتوى (عربي)" : "Content (AR)"}</label>
                  <textarea rows={8} value={editingPost.content_ar || ""} onChange={e => setEditingPost({...editingPost, content_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", resize: "vertical" })} />
                </div>
              </div>

              <label style={s({ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <input type="checkbox" checked={editingPost.published === 1} onChange={e => setEditingPost({...editingPost, published: e.target.checked ? 1 : 0})} style={{ width: 16, height: 16 }} />
                <span style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? "نشر المقال (يظهر للزوار)" : "Publish (Visible to visitors)"}</span>
              </label>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setEditingPost(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    const method = editingPost.id ? "PATCH" : "POST";
                    const url = editingPost.id ? `/api/blog/${editingPost.id}` : "/api/blog";
                    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingPost) });
                    setIsSaving(false);
                    setEditingPost(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: isSaving ? 0.5 : 1 })}
                  disabled={isSaving}
                >
                  {isSaving || isUploading ? "..." : "حفظ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div style={s({ position: "fixed", bottom: 24, [isRtl ? 'left' : 'right']: 24, zIndex: 10000, background: notification.type === 'error' ? '#ff4d4d' : 'var(--pink)', color: '#fff', padding: "12px 24px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", fontWeight: 700, display: "flex", alignItems: "center", gap: 12 })}>
          <span className="icon">{notification.type === 'error' ? 'error' : 'check_circle'}</span>
          {notification.message}
        </div>
      )}

      <style>{`
        @media(max-width:1100px){
          .admin-grid { grid-template-columns: 1fr !important; }
        }
        .anim-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <style>{`.anim-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Team Modal */}
      {editingTeamMember && (
        <div style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 })}>
          <div className="anim-fade-up" style={s({ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", width: "100%", maxWidth: isMobile ? "95vw" : 600, maxHeight: "90vh", overflowY: "auto", padding: isMobile ? 16 : 32 })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontSize: 20, fontWeight: 700 })}>{editingTeamMember.id ? (isRtl ? "تعديل عضو" : "Edit Member") : (isRtl ? "إضافة عضو" : "Add Member")}</h3>
              <button onClick={() => setEditingTeamMember(null)} style={s({ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" })}>
                <span className="icon">close</span>
              </button>
            </div>

            <form onSubmit={saveTeamMember} style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الاسم (EN)" : "Name (EN)"}</label>
                  <input required type="text" value={editingTeamMember.name || ""} onChange={e => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الاسم (AR)" : "Name (AR)"}</label>
                  <input required type="text" value={editingTeamMember.name_ar || ""} onChange={e => setEditingTeamMember({ ...editingTeamMember, name_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المسمى الوظيفي (EN)" : "Role (EN)"}</label>
                  <input type="text" value={editingTeamMember.role || ""} onChange={e => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المسمى الوظيفي (AR)" : "Role (AR)"}</label>
                  <input type="text" value={editingTeamMember.role_ar || ""} onChange={e => setEditingTeamMember({ ...editingTeamMember, role_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الصورة الشخصية" : "Profile Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={editingTeamMember.image_url || ""} onChange={e => setEditingTeamMember({ ...editingTeamMember, image_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setEditingTeamMember({ ...editingTeamMember, image_url: data.url });
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: isMobile ? 24 : 12, width: "100%", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <button type="button" onClick={() => setEditingTeamMember(null)} className="btn btn-outline">{isRtl ? "إلغاء" : "Cancel"}</button>
                <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary">
                  {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ البيانات" : "Save Member")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Service Modal */}
      {editingService && (
        <div style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 })}>
          <div className="anim-fade-up" style={s({ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", width: "100%", maxWidth: isMobile ? "95vw" : 600, maxHeight: "90vh", overflowY: "auto", padding: isMobile ? 16 : 32 })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontSize: 20, fontWeight: 700 })}>{editingService.id ? (isRtl ? "تعديل خدمة" : "Edit Service") : (isRtl ? "إضافة خدمة" : "Add Service")}</h3>
              <button onClick={() => setEditingService(null)} style={s({ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" })}>
                <span className="icon">close</span>
              </button>
            </div>

            <form onSubmit={saveService} style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (EN)" : "Title (EN)"}</label>
                  <input required type="text" value={editingService.title || ""} onChange={e => setEditingService({ ...editingService, title: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (AR)" : "Title (AR)"}</label>
                  <input required type="text" value={editingService.title_ar || ""} onChange={e => setEditingService({ ...editingService, title_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (EN)" : "Description (EN)"}</label>
                  <textarea rows={3} value={editingService.desc || ""} onChange={e => setEditingService({ ...editingService, desc: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الوصف (AR)" : "Description (AR)"}</label>
                  <textarea rows={3} value={editingService.desc_ar || ""} onChange={e => setEditingService({ ...editingService, desc_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صورة الخدمة" : "Service Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={editingService.image_url || ""} onChange={e => setEditingService({ ...editingService, image_url: e.target.value })} style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} placeholder="https://..." />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setEditingService({ ...editingService, image_url: data.url });
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: isMobile ? 24 : 12, width: "100%", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <button type="button" onClick={() => setEditingService(null)} className="btn btn-outline">{isRtl ? "إلغاء" : "Cancel"}</button>
                <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary">
                  {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ البيانات" : "Save Service")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {editingReview && (
        <div style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 })}>
          <div className="anim-fade-up" style={s({ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", width: "100%", maxWidth: isMobile ? "95vw" : 600, maxHeight: "90vh", overflowY: "auto", padding: isMobile ? 16 : 32 })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontSize: 20, fontWeight: 700 })}>{editingReview.id ? (isRtl ? "تعديل مراجعة" : "Edit Review") : (isRtl ? "إضافة مراجعة" : "Add Review")}</h3>
              <button onClick={() => setEditingReview(null)} style={s({ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" })}>
                <span className="icon">close</span>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const method = editingReview.id ? "PATCH" : "POST";
                  const url = "/api/reviews";
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingReview)
                  });
                  if (res.ok) {
                    notify(isRtl ? "تم الحفظ بنجاح" : "Saved successfully");
                    setEditingReview(null);
                    // Refresh reviews list
                    const rRes = await fetch("/api/reviews?all=true");
                    const rData = await rRes.json();
                    setReviews(rData);
                  }
                } catch (e) {
                  notify(isRtl ? "خطأ في الحفظ" : "Save failed", "error");
                } finally {
                  setIsSaving(false);
                }
              }} 
              style={s({ display: "flex", flexDirection: "column", gap: 24 })}
            >
              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "اسم العميل (EN)" : "Client Name (EN)"}</label>
                  <input required type="text" value={editingReview.client_name || ""} onChange={e => setEditingReview({ ...editingReview, client_name: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "اسم العميل (AR)" : "Client Name (AR)"}</label>
                  <input required type="text" value={editingReview.client_name_ar || ""} onChange={e => setEditingReview({ ...editingReview, client_name_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المراجعة (EN)" : "Review (EN)"}</label>
                  <textarea rows={4} required value={editingReview.comment || ""} onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المراجعة (AR)" : "Review (AR)"}</label>
                  <textarea rows={4} required value={editingReview.comment_ar || ""} onChange={e => setEditingReview({ ...editingReview, comment_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "التقييم (1-5)" : "Rating (1-5)"}</label>
                  <input type="number" min="1" max="5" value={editingReview.rating || 5} onChange={e => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div style={s({ display: "flex", alignItems: "flex-end", paddingBottom: 12 })}>
                  <label style={s({ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" })}>
                    <input type="checkbox" checked={editingReview.approved === 1} onChange={e => setEditingReview({...editingReview, approved: e.target.checked ? 1 : 0})} style={{ width: 18, height: 18 }} />
                    <span style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? "معتمد (يظهر بالموقع)" : "Approved (Visible on site)"}</span>
                  </label>
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: isMobile ? 24 : 12, width: "100%", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <button type="button" onClick={() => setEditingReview(null)} className="btn btn-outline">{isRtl ? "إلغاء" : "Cancel"}</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ المراجعة" : "Save Review")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Blog Modal */}
      {editingPost && (
        <div style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 })}>
          <div className="anim-fade-up" style={s({ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", width: "100%", maxWidth: isMobile ? "95vw" : 900, maxHeight: "90vh", overflowY: "auto", padding: isMobile ? 16 : 32 })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontSize: 20, fontWeight: 700 })}>{editingPost.id ? (isRtl ? "تعديل مقال" : "Edit Post") : (isRtl ? "مقال جديد" : "New Post")}</h3>
              <button onClick={() => setEditingPost(null)} style={s({ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" })}>
                <span className="icon">close</span>
              </button>
            </div>

            <form onSubmit={savePost} style={s({ display: "flex", flexDirection: "column", gap: 24 })}>
              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (EN)" : "Title (EN)"}</label>
                  <input required type="text" value={editingPost.title || ""} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "العنوان (AR)" : "Title (AR)"}</label>
                  <input required type="text" value={editingPost.title_ar || ""} onChange={e => setEditingPost({ ...editingPost, title_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الرابط المختصر (Slug)" : "Slug"}</label>
                  <input required type="text" value={editingPost.slug || ""} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "صورة الغلاف (Image URL)" : "Cover Image"}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={editingPost.image_url || ""} onChange={e => setEditingPost({ ...editingPost, image_url: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                    <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                      <span className="icon">upload</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const blob = await compressImage(file);
                          const formData = new FormData();
                          formData.append("file", blob, file.name);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          const data = await res.json();
                          if (data.url) {
                            setEditingPost({ ...editingPost, image_url: data.url });
                            notify(isRtl ? "تم رفع الصورة" : "Image uploaded");
                          } else {
                            notify(isRtl ? "خطأ في الرفع" : "Upload failed", "error");
                          }
                        } catch (err) {
                          notify(isRtl ? "خطأ في الاتصال" : "Connection error", "error");
                        } finally {
                          setIsUploading(false);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "مقتطف (EN)" : "Excerpt (EN)"}</label>
                  <textarea rows={2} value={editingPost.excerpt || ""} onChange={e => setEditingPost({ ...editingPost, excerpt: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "مقتطف (AR)" : "Excerpt (AR)"}</label>
                  <textarea rows={2} value={editingPost.excerpt_ar || ""} onChange={e => setEditingPost({ ...editingPost, excerpt_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "الكاتب" : "Author"}</label>
                  <input required type="text" value={editingPost.author || ""} onChange={e => setEditingPost({ ...editingPost, author: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "وقت القراءة (EN)" : "Read Time (EN)"}</label>
                  <input type="text" value={editingPost.read_time || ""} onChange={e => setEditingPost({ ...editingPost, read_time: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "وقت القراءة (AR)" : "Read Time (AR)"}</label>
                  <input type="text" value={editingPost.read_time_ar || ""} onChange={e => setEditingPost({ ...editingPost, read_time_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 })}>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المحتوى (EN)" : "Content (EN)"}</label>
                  <textarea rows={8} value={editingPost.content || ""} onChange={e => setEditingPost({ ...editingPost, content: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} />
                </div>
                <div>
                  <label style={s({ display: "block", fontSize: 12, color: "var(--text-dim)", marginBottom: 8 })}>{isRtl ? "المحتوى (AR)" : "Content (AR)"}</label>
                  <textarea rows={8} value={editingPost.content_ar || ""} onChange={e => setEditingPost({ ...editingPost, content_ar: e.target.value })} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: "right" })} />
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: isMobile ? 24 : 12, width: "100%", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <button type="button" onClick={() => setEditingPost(null)} className="btn btn-outline">{isRtl ? "إلغاء" : "Cancel"}</button>
                <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary">
                  {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ المقال" : "Save Post")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {editingReview && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setEditingReview(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: isMobile ? "95vw" : 500, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: isMobile ? 16 : 32 })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{editingReview.id ? (isRtl ? "تعديل المراجعة" : "Edit Review") : (isRtl ? "إضافة مراجعة" : "Add Review")}</h3>
              <button onClick={() => setEditingReview(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم العميل (إنجليزي)" : "Client Name (EN)"}</label>
                <input type="text" value={editingReview.client_name || ""} onChange={e => setEditingReview({...editingReview, client_name: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم العميل (عربي)" : "Client Name (AR)"}</label>
                <input type="text" value={editingReview.client_name_ar || ""} onChange={e => setEditingReview({...editingReview, client_name_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المراجعة (إنجليزي)" : "Review (EN)"}</label>
                <textarea rows={3} value={editingReview.comment || ""} onChange={e => setEditingReview({...editingReview, comment: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المراجعة (عربي)" : "Review (AR)"}</label>
                <textarea rows={3} value={editingReview.comment_ar || ""} onChange={e => setEditingReview({...editingReview, comment_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التقييم (1-5)" : "Rating (1-5)"}</label>
                <input type="number" min="1" max="5" value={editingReview.rating || 5} onChange={e => setEditingReview({...editingReview, rating: Number(e.target.value)})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setEditingReview(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    const method = editingReview.id ? "PATCH" : "POST";
                    const url = editingReview.id ? `/api/reviews/${editingReview.id}` : "/api/reviews";
                    const body = editingReview.id ? JSON.stringify(editingReview) : JSON.stringify({...editingReview, approved: 1});
                    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
                    if(res.ok) {
                      setEditingReview(null);
                      router.refresh();
                    } else {
                      notify(isRtl ? "فشل الحفظ" : "Save failed", "error");
                    }
                    setIsSaving(false);
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: isSaving ? 0.5 : 1 })}
                  disabled={isSaving}
                >
                  {isSaving ? "..." : (isRtl ? "حفظ" : "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
