import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImageProps {
  image: string;
  name: string;
  additionalImages?: string[];
}

const ProductImage: React.FC<ProductImageProps> = ({
  image,
  name,
  additionalImages = [],
}) => {
  const imgs = [image, ...additionalImages].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [doubleTap, setDoubleTap] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);

  // 🌀 Auto-slide (only on mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!open && window.innerWidth < 1024) {
        setIdx((i) => (i + 1) % imgs.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [imgs.length, open]);

  // 👆 Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
    touchStart.current = null;
  };

  // 🔁 Double Tap Zoom on Mobile
  const handleDoubleTap = () => {
    const now = Date.now();
    if (doubleTap && now - doubleTap < 300) {
      setZoomed((z) => !z);
    } else {
      setDoubleTap(now);
    }
  };

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  return (
    <>
      {/* 🖼 Main Container */}
      <div className="w-full relative">
        {/* 💻 Grid for Large Screens (2-column layout) */}
        <div className="hidden lg:grid grid-cols-2 gap-0">
          {imgs.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden cursor-zoom-in group"
              onClick={() => {
                setIdx(i);
                setOpen(true);
              }}
            >
              <img
                src={img}
                alt={`${name}-${i}`}
                className="w-full h-[80vh] object-cover transition-transform duration-[1800ms] group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* 📱 Mobile Auto-Slide */}
        <div
          className="lg:hidden relative h-[70vh] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={name}
              initial={{ scale: 1, x: 0 }}
             
              transition={{
                duration: zoomed ? 0.7 : 4,
                ease: zoomed ? "easeOut" : "easeInOut",
              }}
              className={`absolute inset-0 w-full h-full object-cover select-none ${
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onDoubleClick={() => setZoomed((z) => !z)}
            />
          </AnimatePresence>

          {/* 🔢 Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded">
            {idx + 1} / {imgs.length}
          </div>
        </div>
      </div>

      {/* 🔍 Fullscreen Zoom View */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              src={imgs[idx]}
              alt={`zoom-${idx}`}
              className="max-w-[95vw] max-h-[90vh] object-contain select-none"
            />

            {/* Image Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-1 rounded">
              {idx + 1} / {imgs.length}
            </div>

            {/* Arrows (only in zoom mode) */}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow"
            >
              <X size={22} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImage;
