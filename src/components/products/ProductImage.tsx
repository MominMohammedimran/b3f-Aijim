import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn,Share2} from "lucide-react";
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
  const media = [image, ...additionalImages].filter(Boolean);

  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  const thumbRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Swipe for main image
  const onTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: any) => {
    if (!touchStartX.current) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 50) prev();
    if (delta < -50) next();

    touchStartX.current = null;
  };

  const next = () => setIdx((i) => (i + 1) % media.length);
  const prev = () => setIdx((i) => (i - 1 + media.length) % media.length);

  const isVideo = (src: string) =>
    src.endsWith(".mp4") || src.endsWith(".mov") || src.includes("video");

  // Thumbnail swipe
  const onThumbTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onThumbTouchEnd = (e: any) => {
    if (!touchStartX.current) return;

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    const container = thumbRef.current;
    if (!container) return;

    if (Math.abs(delta) > 40) {
      container.scrollBy({
        left: delta > 0 ? -120 : 120,
        behavior: "smooth",
      });
    }
    touchStartX.current = null;
  };

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
         className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-black object-contain hover:scale-[1.02] transition-all duration-300"

          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* SHARE BUTTON */}
  
          <AnimatePresence initial={false}>
            <motion.div
              key={idx}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {isVideo(media[idx]) ? (
                <video
                  src={media[idx]}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  src={media[idx]}
                  className="w-full h-full object-cover"
                  alt={name}
                  loading="eager"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ARROWS */}
          {media.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2  p-1 rounded-none  text-gray-400 hover:bg-red-600 hover:text-white"
              >
                <ChevronLeft size={23} />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2  p-1 rounded-none text-gray-400 hover:bg-red-600 hover:text-white"
              >
                <ChevronRight size={23} />
              </button>
            </>
          )}

          {/* ZOOM */}
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow"
          >
            <ZoomIn className="text-black" size={18} />
          </button>

          {/* COUNTER */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded">
            {idx + 1} / {media.length}
          </div>
        </div>

        {/* THUMBNAILS WITH SWIPE + ARROWS */}
        {media.length > 1 && (
  <div className="w-full mt-3 relative ">
    <div className="bg-black/90 rounded-xl relative overflow-hidden border border-white/10">

      {/* Left Arrow */}
      <button
        aria-label="Scroll thumbnails left"
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-red-600 backdrop-blur rounded-none z-10 transition"
        onClick={() =>
          thumbRef.current?.scrollBy({ left: -140, behavior: "smooth" })
        }
      >
        <ChevronLeft className="text-white" size={18} />
      </button>

      {/* Thumbnails */}
      <div
        ref={thumbRef}
        className="flex gap-3 justify-center items-center overflow-x-auto overflow-y-hidden px-10 py-2 scrollbar-hide scroll-smooth"
        onTouchStart={onThumbTouchStart}
        onTouchEnd={onThumbTouchEnd}
      >
        {media.map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex-shrink-0"
          >
            {isVideo(m) ? (
              <video
                src={m}
                className={`h-14 w-14 rounded-lg border object-cover transition ${
                  idx === i
                    ? "border-yellow-400 ring-2 ring-yellow-400/40"
                    : "border-gray-700"
                }`}
                muted
              />
            ) : (
              <img
                src={m}
                loading="lazy"
                onClick={() => setIdx(i)}
                className={`h-16 w-16 rounded-lg object-cover cursor-pointer border transition ${
                  idx === i
                    ? "border-yellow-400 ring-2 ring-yellow-400/40"
                    : "border-gray-700 hover:border-yellow-300"
                }`}
              />
            )}

            {/* Active dot */}
            {idx === i && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        aria-label="Scroll thumbnails right"
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-red-600 backdrop-blur rounded-none z-10 transition"
        onClick={() =>
          thumbRef.current?.scrollBy({ left: 140, behavior: "smooth" })
        }
      >
        <ChevronRight className="text-white" size={18} />
      </button>
    </div>
  </div>
)}




      </div>

      {/* FULLSCREEN VIEW */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isVideo(media[idx]) ? (
              <video
                src={media[idx]}
                className="max-w-[95vw] max-h-[90vh]"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={media[idx]}
                className="max-w-[95vw] max-h-[90vh] object-contain"
              />
            )}

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X size={30} />
            </button>

            {/* FS Arrows */}
            <>
              <button
                onClick={prev}
                className="absolute left-1 top-1/2 -translate-y-1/2 text-white bg-gray-600/20 rounded-none p-1 hover:bg-red-600 hover:text-white"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-white bg-gray-600/20 rounded-none p-1 hover:bg-red-600 hover:text-white"
              >
                <ChevronRight size={22} />
              </button>
            </>
          </motion.div>
        )}
      </AnimatePresence>

      
    </>
  );
};

export default ProductImage;
