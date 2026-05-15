"use client";
import { useEffect, useState } from "react";

export default function CinematicScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Parallax zoom for background images
    const bgImages = document.querySelectorAll<HTMLElement>("[data-parallax]");
    bgImages.forEach((img) => {
      const speed = parseFloat(img.getAttribute("data-parallax") || "0.1");
      const rect = img.parentElement?.getBoundingClientRect();
      if (rect) {
        const offset = (window.innerHeight - rect.top) * speed;
        img.style.transform = `scale(${1 + speed}) translateY(${offset}px)`;
      }
    });
  }, [scrollY]);

  return null;
}
