import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400); // smooth fade-out
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      >
        {/* Logo */}
        <motion.img
          src="/aijim-uploads/aijim.svg"
          alt="AIJIM Logo"
          className="w-44 sm:w-56 md:w-64 h-auto mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Progress Bar BELOW Image */}
        <div className="relative w-56 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-xs sm:text-sm tracking-[3px] text-gray-400 font-semibold uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading AIJIM... {progress}%
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
