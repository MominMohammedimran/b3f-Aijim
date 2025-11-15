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
          className="relative w-full h-[55vh] lg:h-[80vh] overflow-hidden bg-black"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
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
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ARROWS */}
          {media.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2  p-2 rounded-none text-gray-400 hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2  p-2 rounded-none text-gray-400 hover:text-white"
              >
                <ChevronRight size={24} />
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
          <div className="w-full mt-3 relative">
            {/* Left Scroll Arrow */}
            <button
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full z-10"
              onClick={() =>
                thumbRef.current?.scrollBy({ left: -120, behavior: "smooth" })
              }
            >
              <ChevronLeft className="text-white" size={18} />
            </button>

            <div
              ref={thumbRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-8 p-2"
              onTouchStart={onThumbTouchStart}
              onTouchEnd={onThumbTouchEnd}
            >
              {media.map((m, i) => (
                <div key={i} className="flex-shrink-0">
                  {isVideo(m) ? (
                    <video
                      src={m}
                      className={`h-14 w-14 rounded-xl border object-cover ${
                        idx === i
                          ? "border-yellow-400 scale-105"
                          : "border-gray-600"
                      }`}
                      muted
                    />
                  ) : (
                    <img
                      src={m}
                      onClick={() => setIdx(i)}
                      className={`h-16 w-16 rounded object-cover cursor-pointer border ${
                        idx === i
                          ? "border-yellow-400 scale-105"
                          : "border-gray-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right Scroll Arrow */}
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full z-10"
              onClick={() =>
                thumbRef.current?.scrollBy({ left: 120, behavior: "smooth" })
              }
            >
              <ChevronRight className="text-white" size={18} />
            </button>
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
