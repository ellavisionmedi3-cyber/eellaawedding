import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact & Booking | Secure Your Wedding Date",
  description:
    "Exclusively for female celebrations. Let us capture the artistry of your grand entrance with our signature luxury photography style.",
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContactForm />
    </Suspense>
  );
}
