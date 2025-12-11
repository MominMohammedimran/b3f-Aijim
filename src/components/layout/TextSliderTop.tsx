import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Christmas Sale - Grab",
  "Any 2 — Oversized Tees",
  "₹1000 & Enjoy",
  "Free shipping",
];

export default function TextSliderTop() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto slide every 3 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Show based on time rule (ODD-MINUTES)
  useEffect(() => {
    const updateVisibility = () => {
      const minutes = new Date().getMinutes();

      // ⭐ Visible only on odd minutes (1,3,5,7…)
      setIsVisible(minutes % 3 === 0);
//change minutes % 2 === 0 for even minutes % 3 ===0  odd
    };

    updateVisibility();
    const interval = setInterval(updateVisibility, 15000); // check every 15 sec

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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1], // smoother curve
          }}
          className="bg-black py-2 flex sm:gap-6 items-center justify-center relative overflow-hidden shadow-md"
        >
          <button
            onClick={prevSlide}
            className="text-white p-1 hover:bg-white/20 rounded-full absolute left-2 sm:left-4 "
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-white font-semibold text-sm sm:text-md uppercase px-8 text-center tracking-wide">
            {messages[index]}
          </span>

          <button
            onClick={nextSlide}
            className="text-white p-1 hover:bg-white/20 rounded-full absolute right-2 sm:right-4 "
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
