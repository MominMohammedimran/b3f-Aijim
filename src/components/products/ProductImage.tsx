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

  // 🌀 Auto-scroll (mobile only)
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % imgs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imgs.length]);

  // 👉 Swipe detection
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - startX.current;
    if (deltaX > 50) prev();
    if (deltaX < -50) next();
    startX.current = null;
  };

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  return (
    <>
      <div className="relative w-full overflow-hidden">
        {/* 💻 Large Screen Grid (2 columns like RareRabbit) */}
        <div className="hidden lg:grid grid-cols-2 gap-0 auto-rows-[400px]">
          {imgs.map((img, i) => (
            <motion.div
              key={i}
              className="overflow-hidden cursor-zoom-in"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setIdx(i);
                setOpen(true);
              }}
            >
              <img
                src={img}
                alt={`${name}-${i}`}
                className="w-full h-[400px] object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>

        {/* 📱 Mobile Slider with Swipe + Numbers */}
        <div
          className="relative lg:hidden h-[70vh] overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={name}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 1.0}}             className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* 🔢 Number Navigation (1 2 3 4 ...) */}
          {imgs.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 bg-black/30 px-3 py-1 rounded-sm text-white text-xs font-semibold tracking-wider">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`transition-all duration-200 ${
                    i === idx
                      ? "text-white underline underline-offset-4 scale-110"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔍 Fullscreen Zoom (desktop only) */}
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
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-md"
            />

            {/* 🧭 Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-1 rounded-md">
              {idx + 1} / {imgs.length}
            </div>

            {/* ⬅️➡️ Arrows (only in zoom mode) */}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            {/* ❌ Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 text-white"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImage;
