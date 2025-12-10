import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
   "Chritsmas Sale - Grab",
  "Buy any 2 — Oversized Tees",
  "₹1000 ",
  "Free shipping",
];

export default function TextSliderTop() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-slide messages every 3 seconds
  useEffect(() => {
    if (!isVisible) return; // pause auto-slide when hidden

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

 
  useEffect(() => {
    const updateVisibility = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      // 5 minutes visible, 5 minutes hidden
      setIsVisible(minutes % 10 < 4);
    };

    updateVisibility(); // initial check
    const interval = setInterval(updateVisibility, 1000 * 30); // check every 30s
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="slider"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="bg-black py-2 flex items-center justify-center relative overflow-hidden"
        >
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 text-white p-1 hover:bg-white/20 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Slide Text */}
          <span className="text-white font-semibold text-sm sm:text-md uppercase px-8 text-center">
            {messages[index]}
          </span>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 text-white p-1 hover:bg-white/20 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
