import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

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
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const imgs = [image, ...additionalImages].filter(Boolean);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  const handleWheel = (e: React.WheelEvent) => {
    if (!open) return;
    setZoom((z) => Math.min(Math.max(1, z - e.deltaY * 0.001), 3));
  };

  return (
    <>
      <div className="relative w-full flex flex-col items-center">
        {/* Main Image */}
        <div className="relative w-full bg-black overflow-hidden rounded-none shadow-lg flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={name}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="w-full h-[65vh] sm:h-[75vh] md:h-[85vh] lg:h-[90vh] object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
              onClick={() => setOpen(true)}
            />
          </AnimatePresence>

          {/* Navigation arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:flex bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Zoom icon */}
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-3 right-3 bg-white/80 p-2 rounded-full shadow hover:bg-white"
          >
            <ZoomIn className="text-blue-600" size={18} />
          </button>

          {/* Mobile thumbnails (top-right) */}
          {imgs.length > 1 && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 lg:hidden">
              {imgs.map((thumb, i) => (
                <motion.div
                  key={i}
                  onClick={() => setIdx(i)}
                  whileHover={{ scale: 1.05 }}
                  className={`cursor-pointer border rounded-sm overflow-hidden transition-all ${
                    i === idx
                      ? "border-yellow-400 scale-105"
                      : "border-gray-700 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`thumb-${i}`}
                    className="object-cover w-12 h-12 sm:w-14 sm:h-14"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop thumbnails (below image) */}
        {imgs.length > 1 && (
          <div className="hidden lg:flex flex-row flex-wrap justify-center gap-3 mt-4">
            {imgs.map((thumb, i) => (
              <motion.div
                key={i}
                onClick={() => setIdx(i)}
                whileHover={{ scale: 1.08 }}
                className={`cursor-pointer border rounded-sm overflow-hidden transition-all ${
                  i === idx
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-gray-700 opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={thumb}
                  alt={`thumb-${i}`}
                  className="object-fit w-20 h-20 lg:w-[150px] lg:h-[150px] hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom View */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheel={handleWheel}
          >
            <motion.img
              src={imgs[idx]}
              alt="preview"
              style={{ scale: zoom, x, y }}
              drag={zoom > 1}
              dragConstraints={{
                left: -500,
                right: 500,
                top: -500,
                bottom: 500,
              }}
              transition={{ type: "spring", stiffness: 120 }}
              className="max-w-[95vw] max-h-[90vh] object-contain"
            />

            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 hover:text-white text-white/60 p-3 rounded-full"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-6 top-1/2 -translate-y-1/2 hover:text-white text-white/60 p-3 rounded-full"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="absolute top-8 right-8 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow"
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
