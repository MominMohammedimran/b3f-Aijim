import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "LOADING",
  "PREPARING YOUR EXPERIENCE",
  "CURATING STYLES",
  "FINISHING TOUCHES",
  "READY ✔️",
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < MESSAGES.length) {
        setStep(index);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 200);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <motion.img
        src="/aijim-uploads/aijim.svg"
        alt="AIJIM"
        className="w-44 sm:w-56 md:w-64 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        loading="eager"
      />

      <motion.div
        className="h-1.5 w-56 bg-gray-800 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${((step + 1) / MESSAGES.length) * 100}%` }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-yellow-400 h-full"></div>
      </motion.div>

      <motion.p
        key={step}
        className="text-sm mt-4 tracking-[0.15em] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {MESSAGES[step]}
      </motion.p>
    </div>
  );
}
