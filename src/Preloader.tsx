import React, { useEffect, useState } from "react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Wait until resources are loaded, then trigger fade
    const handleLoaded = () => {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 600); // delay before removing
      }, 800);
    };

    if (document.readyState === "complete") handleLoaded();
    else window.addEventListener("load", handleLoaded);

    return () => window.removeEventListener("load", handleLoaded);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 🔥 Logo with Neon Pulse */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute inset-0 blur-3xl bg-yellow-400/20 rounded-full animate-glow"></div>
        <img
          src="/aijim-uploads/aijim.svg"
          alt="AIJIM Logo"
          className="relative w-32 h-32 object-contain animate-logo-pulse"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* ⚡ Loading Bar */}
      <div className="w-48 h-[3px] bg-gray-800 rounded-full overflow-hidden mt-6 shadow-inner">
        <div className="h-full w-full bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 animate-slide" />
      </div>

      {/* 🧍 Tagline */}
      <p className="mt-4 text-[11px] tracking-[3px] uppercase text-gray-400 font-semibold italic">
        redefining streetwear
      </p>

      {/* ✨ Styles */}
      <style>
        {`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-30%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,255,0,0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 12px rgba(255,255,0,0.7)); }
        }
        .animate-slide { animation: slide 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-logo-pulse { animation: logoPulse 2s ease-in-out infinite; }
      `}
      </style>
    </div>
  );
}
