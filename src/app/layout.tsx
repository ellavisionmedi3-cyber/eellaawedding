import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

export const revalidate = 30; // Revalidate layouts/settings from database every 30 seconds
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/layout/ScrollReveal";
import CinematicScroll from "@/components/layout/CinematicScroll";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import connectToDatabase, { SiteSetting } from "@/lib/db";
import GlobalAudioPlayer from "@/components/layout/GlobalAudioPlayer";
import PromoPopup from "@/components/layout/PromoPopup";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eellaawedding.com"),
  title: { template: "%s | Ella Media", default: "Ella Media | Female-Only Wedding Photography Saudi Arabia" },
  description: "Saudi Arabia's premier female-only wedding photography studio. Cinematic, editorial, and deeply private.",
  openGraph: {
    title: "Ella Media",
    description: "Saudi Arabia's premier female-only wedding photography studio.",
    url: "https://eellaawedding.com",
    siteName: "Ella Media",
    locale: "ar_SA",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings: Record<string, string> = {};
  
  try {
    await connectToDatabase();
    const dbSettings = await SiteSetting.find().lean();
    dbSettings.forEach((s: any) => { settings[s.key] = s.value; });
  } catch (e) {
    console.error("Database connection failed during build/render:", e);
    // Use defaults
  }

  const fontEn = settings.font_en || "Playfair Display";
  const fontAr = settings.font_ar || "Tajawal";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontEn.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;1,400&family=${fontAr.replace(/ /g, '+')}:wght@400;500;700;800&display=swap`;

  return (
    <html lang="ar" dir="rtl" className={`${playfair.variable} ${manrope.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        <link rel="stylesheet" href={fontUrl} />
        <style>{`
          :root {
            --font-display-en: "${fontEn}", "Playfair Display", serif;
            --font-display-ar: "${fontAr}", "Tajawal", sans-serif;
          }
          [dir="ltr"] body, [dir="ltr"] input, [dir="ltr"] button, [dir="ltr"] textarea {
            font-family: var(--font-display-en);
          }
          [dir="rtl"] body, [dir="rtl"] input, [dir="rtl"] button, [dir="rtl"] textarea {
            font-family: var(--font-display-ar);
          }
          [dir="ltr"] .font-display { font-family: var(--font-display-en); }
          [dir="rtl"] .font-display { font-family: var(--font-display-ar); }
          [dir="ltr"] :root { --wa-left: auto; --wa-right: 32px; }
          [dir="rtl"] :root { --wa-left: 32px; --wa-right: auto; }
        `}</style>
      </head>
      <body style={{ position: "relative", minHeight: "100vh" }}>
        <SettingsProvider settings={settings}>
          <LanguageProvider>
            <Navbar />
            <main className="anim-fade-in">
              {children}
            </main>
            <Footer />
            
            <ScrollReveal />
            <CinematicScroll />

            {/* Cinematic Global Background */}
            <div data-parallax="0.05" style={{
              position: "fixed", inset: 0, zIndex: -1,
              backgroundImage: `url('${settings.global_bg_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN"}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.1, filter: "grayscale(100%) brightness(0.8)",
              pointerEvents: "none",
              transition: "transform 0.2s ease-out"
            }} />
            {/* Film Grain Texture */}
            <div style={{
              position: "fixed", inset: 0, zIndex: -1,
              backgroundImage: "url('https://www.transparenttextures.com/patterns/film-grain.png')",
              opacity: 0.12, pointerEvents: "none", mixBlendMode: "overlay"
            }} />

            {/* WhatsApp FAB */}
            <a 
              href={`https://wa.me/${settings.social_whatsapp || "966500000000"}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="whatsapp-fab"
              style={{
                position: "fixed", 
                bottom: 32, 
                left: "var(--wa-left, auto)",
                right: "var(--wa-right, 32px)",
                width: 56, 
                height: 56,
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                background: "#25D366", // Official WhatsApp Green
                color: "#fff", 
                zIndex: 90,
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              aria-label="WhatsApp"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            
            <GlobalAudioPlayer />
            <PromoPopup />
          </LanguageProvider>
        </SettingsProvider>
        <style>{`.whatsapp-fab:hover { transform: scale(1.1) !important; }`}</style>
      </body>
    </html>
  );
}
