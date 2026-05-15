"use client";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { getMediaUrl } from "@/lib/utils";

export default function GlobalAudioPlayer() {
  const settings = useSettings();
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // We get the direct media URL (not the embed preview) so we can play it in <audio>
  const videoUrl = settings?.hero_video_url || "";
  const audioSrc = getMediaUrl(videoUrl, false);

  // YouTube audio cannot be easily extracted to play in an invisible <audio> tag.
  const isYouTube = audioSrc.includes("youtube.com") || audioSrc.includes("youtu.be");

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed (likely browser autoplay policy):", e);
          setIsMuted(true);
        });
      }
    }
  }, [isMuted]);

  if (!audioSrc || isYouTube) return null;

  return (
    <>
      <audio ref={audioRef} src={audioSrc} loop playsInline />
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="audio-fab"
        style={{
          position: "fixed", 
          bottom: 104, // Right above WhatsApp
          left: "var(--wa-left, auto)",
          right: "var(--wa-right, 32px)",
          width: 48, 
          height: 48,
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: isMuted ? "rgba(0,0,0,0.5)" : "var(--pink)", 
          backdropFilter: "blur(8px)",
          border: isMuted ? "1px solid rgba(255,255,255,0.2)" : "none",
          color: "#fff", 
          zIndex: 90,
          boxShadow: isMuted ? "0 4px 15px rgba(0,0,0,0.3)" : "0 4px 15px rgba(223,169,186,0.4)",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        aria-label="Toggle Audio"
      >
        <span className="icon" style={{ fontSize: 20 }}>{isMuted ? "volume_off" : "volume_up"}</span>
      </button>
      <style>{`.audio-fab:hover { transform: scale(1.1); }`}</style>
    </>
  );
}
