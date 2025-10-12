import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
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
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  const touchStart = useRef<number | null>(null);
  const pinchDistance = useRef<number | null>(null);

  // 🌀 Auto-slide for mobile only
  useEffect(() => {
    const timer = setInterval(() => {
      if (!open && window.innerWidth < 1024) {
        setIdx((i) => (i + 1) % imgs.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [imgs.length, open]);

  // 👆 Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
      // start pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDistance.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistance.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(Math.max((dist / pinchDistance.current) * lastScale, 1), 3);
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastScale(scale);
      pinchDistance.current = null;
    }
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 50 && scale === 1) {
      if (delta > 50) prev();
      else next();
    }
    touchStart.current = null;
  };

  // 🔁 Double Tap Zoom
  const handleDoubleTap = () => {
    const now = Date.now();
    if (doubleTap && now - doubleTap < 300) {
      setZoomed((z) => !z);
      setScale(zoomed ? 1 : 2);
      setLastScale(zoomed ? 1 : 2);
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
        {/* 💻 Large Screen Grid */}
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
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 w-full h-full object-cover select-none transform ${
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.2s ease-out",
              }}
            />
          </AnimatePresence>

          {/* 🔍 Zoom Icon */}
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
          >
            <ZoomIn className="text-black" size={18} />
          </button>

          {/* 🔢 Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded">
            {idx + 1} / {imgs.length}
          </div>
        </div>
      </div>

      {/* 🔍 Fullscreen Zoom View */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center touch-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              src={imgs[idx]}
              alt={`zoom-${idx}`}
              className="max-w-[95vw] max-h-[90vh] object-contain select-none"
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.2s ease-out",
              }}
            />

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-1 rounded">
              {idx + 1} / {imgs.length}
            </div>

            {/* Arrows */}
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

            {/* Close */}
            <button
              onClick={() => {
                setOpen(false);
                setZoomed(false);
                setScale(1);
                setLastScale(1);
              }}
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
