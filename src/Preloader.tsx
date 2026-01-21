import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const steps = [
  "LOADING…",

   "LAUNCHED 🚀",
  
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
 
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
  
    const interval = setInterval(() => {
      current += 1;
      setProgress(current);
  
      if (current >= 100) clearInterval(interval);
    }, 60); // speed
  
    return () => clearInterval(interval);
  }, []);
  


  useEffect(() => {
    document.body.style.overflow = "hidden";
  const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 500);
   const timer = setTimeout(() => {
      onComplete();
      document.body.style.overflow = "";
    }, 2000);
  return () => {
      clearInterval(interval);
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.img
          src="/aijim-uploads/aijim.svg"
          alt="AIJIM"
          className="w-40 sm:w-52 md:w-60 mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: "easeOut",
          }}
        />

        {/* Progress Bar */}
 <div className="relative w-60 h-3 bg-neutral-700 rounded-full overflow-hidden">
  <motion.div
    className="bg-yellow-400 h-full flex items-center justify-end pr-1"
    animate={{ width: `${progress}%` }}
    transition={{ ease: "linear", duration: 0.05 }}
  >
    {progress > 5 && (
      <span className="text-[10px] font-semibold text-black select-none">
        {progress}%
      </span>
    )}
  </motion.div>
</div>




        {/* Step Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="mt-1 text-lg tracking-[0.05em] font-light"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
