import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const letters = "AIJIM".split("");

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [zoomOut, setZoomOut] = useState(false);

  useEffect(() => {
    const exitTimeout = setTimeout(() => {
      setZoomOut(true);
      setTimeout(onComplete, 1500);
    }, 3000); // delay before exit

    return () => clearTimeout(exitTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!zoomOut && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: zoomOut ? 0 : 1, scale: zoomOut ? 0.9 : 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black"
        >
          <div className="flex flex-col items-center space-y-0">
            {/* Logo */}
            <motion.img
              src="/aijim-uploads/aijim.svg"
              alt="AIJIM Logo"
              className="w-68 h-50 object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: [0.9, 1.05, 1] }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* AIJIM Letters Reveal
            <div className="flex gap-3">
              {letters.map((char, i) => (
                <motion.span
                  key={i}
                  className="text-[72px] font-extrabold bg-clip-text text-transparent g-wider"
                  style={{
                    
                   backgroundImage:
  "linear-gradient(90deg, #cfcfcf, #ffffff, #c0c0c0, #e6e6e6, #a9a9a9)",
// silver
                    WebkitTextFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: i * 0.25,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>*/}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
