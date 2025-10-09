import React, { useState, useEffect } from "react";
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

  // 🌀 Auto-scroll for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % imgs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imgs.length]);

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  return (
    <>
      <div className="relative w-full overflow-hidden">
        {/* 💎 Large Screen Grid (2-column layout like Rare Rabbit) */}
        <div className="hidden lg:grid grid-cols-2 gap-0 auto-rows-[300px]">
          {imgs.map((img, i) => (
            <motion.div
              key={i}
              className={`overflow-hidden cursor-zoom-in rounded-none ${
                i % 3 === 0 ? "row-span-2 h-[300px]" : "h-[300px]"
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setIdx(i);
                setOpen(true);
              }}
            >
              <img
                src={img}
                alt={`${name}-${i}`}
                className="w-full h-full object-cover rounded-none transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>

        {/* 📱 Mobile Auto Slider */}
        <div className="relative lg:hidden h-[70vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={() => setOpen(true)}
            />
          </AnimatePresence>

          {/* 🔢 Numbered Navigation (1 2 3 4 ...) */}
          {imgs.length > 1 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3.5 bg-black/20  px-3 py-0 rounded-none text-white text-xs font-semibold tracking-widest">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`transition-all duration-200 ${
                    i === idx
                      ? "text-white shadow  scale-110 underline underline-offset-4"
                      : "text-white/40   "
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* 🔍 Zoom icon */}
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white"
          >
            <ZoomIn className="text-gray-800" size={18} />
          </button>
        </div>
      </div>

      {/* 🔍 Fullscreen Zoom View */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              src={imgs[idx]}
              alt={`zoom-${idx}`}
              className="max-w-[95vw] max-h-[90vh] object-contain rounded-md"
            />

            {/* Image counter (2 / 6) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/60 px-4 py-1 rounded-sm">
              {idx + 1} / {imgs.length}
            </div>

            {/* ⬅️➡️ Arrows only in zoom */}
            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-6 top-1/2 -translate-x-1/2 text-white/70 hover:text-white p-3"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-8 right-2 p-2 rounded-full"
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
