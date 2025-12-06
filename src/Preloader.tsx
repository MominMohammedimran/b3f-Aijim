import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  
  "PREPARING YOUR EXPERIENCE",
  "READY"
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timings = [ 500, 500]; // delays for each step
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < STEPS.length) {
        setStep(current);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, timings[current]);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <motion.img
        src="/aijim-uploads/aijim.svg"
        alt="AIJIM"
        className="w-44 sm:w-56 md:w-64 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        loading="eager"
      />

      {/* Progress Bar */}
      <div className="h-1.5 w-56 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-yellow-400"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Steps Text List */}
      <div className="mt-5 flex flex-col items-center gap-2 text-sm tracking-[0.12em] text-gray-300">
        {STEPS.slice(0, step + 1).map((text, index) => (
          <motion.p
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className={index === step ? "font-semibold text-white" : "opacity-20 text-gray-400"}
          >
            {text}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
