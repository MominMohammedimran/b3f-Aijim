import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

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
  /* ------------ state ------------ */
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  /* ------------ data ------------ */
  const imgs = [image, ...additionalImages].filter(Boolean);

  /* ------------ swipe helpers ------------ */
  const startX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (delta < -50) next(); // swipe left
    if (delta > 50) prev();  // swipe right
    startX.current = null;
  };

  /* ------------ navigation ------------ */
  const next = () => setIdx((i) => (i + 1) % imgs.length);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);

  /* ------------ render ------------ */
  return (
    <>
      {/* viewer */}
      <div
  className="relative w-full h-[54vh] sm:h-[65vh] overflow-hidden bg-black shadow-lg flex items-center justify-center"
  onTouchStart={onTouchStart}
  onTouchEnd={onTouchEnd}
>
  <img
    src={imgs[idx]}
    alt={name}
    loading="lazy"
    className="w-full h-full object-cover"
  />


        {/* navigation arrows - visible on md+ screens */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* progress dots */}
        {imgs.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
            {imgs.map((_, i) => (
              <div
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded cursor-pointer transition-all ${
                  i === idx ? 'w-8 bg-yellow-400' : 'w-3 bg-gray-500/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* magnify icon */}
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow hover:bg-white"
          aria-label="Zoom"
        >
          <ZoomIn className="text-blue-600" size={18} />
        </button>
      </div>

      {/* full‑screen preview */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <img
            src={imgs[idx]}
            alt="preview"
            loading="lazy"
            className="max-w-[95vw] max-h-[90vh] object-contain"
          />
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow"
            aria-label="Close full preview"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      )}
    </>
  );
};

export default ProductImage;
