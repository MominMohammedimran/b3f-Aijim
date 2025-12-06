import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {

  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
      
      {/* Logo */}
      <motion.img
        src="/aijim-uploads/aijim.svg"
        alt="AIJIM"
        className="w-40 sm:w-52 md:w-60 mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Center-Out Progress Bar */}
      <div className="relative w-60 h-1.5 bg-neutral-700 rounded-full overflow-hidden flex">
        
        {/* Left half */}
        <motion.div
          className="bg-yellow-400 h-full w-1/2 origin-right"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* Right half */}
        <motion.div
          className="bg-yellow-400 h-full w-1/2 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </div>

      {/* Text */}
      <motion.p
        className="mt-1 text-lg tracking-[0.05em] font-light"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        READY ✔️
      </motion.p>
    </div>
  );
}
