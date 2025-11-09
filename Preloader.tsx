import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [zoomOut, setZoomOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 3000;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(step);
      }
    };

    const frame = requestAnimationFrame(step);

    // Wait slightly longer than 3s to ensure we render 100%
    const exitTimeout = setTimeout(() => {
      setProgress(100); // ensure 100% visible
      setTimeout(() => {
        setZoomOut(true);
        setTimeout(onComplete, 1000); // fade-out delay
      }, 300); // small delay to show full bar before zoom out
    }, duration + 200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(exitTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!zoomOut && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: zoomOut ? 0 : 1, scale: zoomOut ? 0.9 : 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black"
        >
          {/* Logo */}
          <motion.img
            src="/aijim-uploads/aijim.png"
            alt="AIJIM Logo"
            className="w-44 h-44 object-contain mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: [0.9, 1.05, 1] }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Progress Bar */}
          <div className="w-64 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-300 via-white to-gray-400"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
                                   }
