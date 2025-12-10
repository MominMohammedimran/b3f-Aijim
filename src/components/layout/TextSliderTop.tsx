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

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    const updateVisibility = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      setIsVisible(minutes % 10 < 8);
    };

    updateVisibility();
    const interval = setInterval(updateVisibility, 30000);
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
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="bg-black py-2 flex sm:gap-6 items-center justify-center relative overflow-hidden"
        >

          {/* Left Arrow — close on md/lg, far on mobile */}
          <button
            onClick={prevSlide}
            className="
              text-white p-1 hover:bg-white/20 rounded-full
              absolute
              left-2 sm:left-4 sm:-translate-x-20
            "
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Message */}
          <span className="text-white font-semibold text-sm sm:text-md uppercase px-8 text-center">
            {messages[index]}
          </span>

          {/* Right Arrow — close on md/lg, far on mobile */}
          <button
            onClick={nextSlide}
            className="
              text-white p-1 hover:bg-white/20 rounded-full
              absolute
              right-2 sm:left-4 sm:translate-x-20
            "
          >
            <ChevronRight className="h-5 w-5" />
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
