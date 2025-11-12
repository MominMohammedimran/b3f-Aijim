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

  // 🌀 Auto-slide (for mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!open && window.innerWidth < 1024) {
        setIdx((i) => (i + 1) % imgs.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [imgs.length, open]);

  // 👆 Swipe + Pinch Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
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
      {/* 🖼 Main Image + Thumbnails (All Devices) */}
      <div className="w-full flex flex-col items-center">
        {/* Main Image */}
        <div
          className="relative w-full h-[70vh] lg:h-[80vh] overflow-hidden bg-neutral-900 cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <motion.img
            key={idx}
            src={imgs[idx]}
            alt={name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{
              transform: `scale(${scale})`,
              transition: "transform 0.25s ease-out",
            }}
          />

          {/* 🔍 Zoom Button */}
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

        {/* 🖼 Thumbnail Gallery (All Devices) */}
        {imgs.length > 1 && (
          <div className="flex gap-3 mt-3 overflow-x-auto justify-center w-full px-2 scrollbar-hide">
            {imgs.map((thumb, i) => (
              <img
                key={i}
                src={thumb}
                alt={`thumb-${i}`}
                onClick={() => setIdx(i)}
                className={`h-20 w-20 object-cover rounded-md border ${
                  idx === i ? "border-white scale-105" : "border-gray-600"
                } transition-all duration-300 cursor-pointer hover:opacity-90`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🔍 Fullscreen Zoom View */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
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
              className="absolute top-3 right-4"
            >
              <X size={26} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImage;
