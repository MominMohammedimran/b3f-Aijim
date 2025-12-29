import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight,TreePine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "New Year Sale - Grab",
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

          <span className="text-white font-semibold text-sm sm:text-md uppercase px-8 text-center flex items-center gap-2">
  {index === 0 && <TreePine className="w-4 h-4 text-white" />}
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
