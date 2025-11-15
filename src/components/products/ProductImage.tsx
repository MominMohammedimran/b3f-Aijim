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

  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);

  const thumbRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const pinchDistance = useRef<number | null>(null);

  // 🔄 Auto-slide on mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (!open && window.innerWidth < 1024 && imgs.length > 1) {
        setIdx((i) => (i + 1) % imgs.length);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [imgs.length, open]);

  // 👆 Swipe gestures only change image, no fade blink
  const handleTouchStart = (e: any) => {
    if (e.touches.length === 1) {
      touchStart.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: any) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;

    if (Math.abs(delta) > 50) {
      if (delta > 0) prev();
      else next();
    }
    touchStart.current = null;
  };

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  // 🔄 Scroll thumbnails when clicking
  const scrollThumbIntoView = (i: number) => {
    const container = thumbRef.current;
    if (!container) return;

    const thumb = container.children[i] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  // SLIDER VARIANTS (side-by-side)
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -150 : 150,
      opacity: 0,
    }),
  };

  return (
    <>
      {/* MAIN IMAGE */}
      <div className="w-full flex flex-col items-center">
        <div
          className="relative w-full h-[55vh] lg:h-[80vh] overflow-hidden bg-neutral-900"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={1}>
            <motion.img
              key={idx}
              src={imgs[idx]}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* ZOOM BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow"
          >
            <ZoomIn className="text-black" size={18} />
          </button>

          {/* COUNTER */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded">
            {idx + 1} / {imgs.length}
          </div>

          {/* ARROWS */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* THUMBNAILS */}
        {imgs.length > 1 && (
          <div className="relative w-full mt-3 px-2">
            <div
              ref={thumbRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            >
              {imgs.map((thumb, i) => (
                <img
                  key={i}
                  src={thumb}
                  onClick={() => {
                    setIdx(i);
                    scrollThumbIntoView(i);
                  }}
                  className={`h-14 w-14 rounded-md object-cover transition-all cursor-pointer border ${
                    idx === i ? "border-yellow-400 scale-105" : "border-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN VIEW */}
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
              className="max-w-[95vw] max-h-[90vh] object-contain"
            />

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={26} />
            </button>

            {/* COUNTER */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1 rounded">
              {idx + 1} / {imgs.length}
            </div>

            {/* FULLSCREEN ARROWS */}
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronRight size={32} />
              </button>
            </>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImage;
