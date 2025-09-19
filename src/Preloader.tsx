import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const parts = [
    { id: "down", clip: "inset(0 0 74% 0)", anim: { y: [ -5, 0 ] } }, // top 20%
    { id: "up", clip: "inset(18% 0 50% 0)", anim: { y: [ 10, 0 ] } },  // 2nd 20%
    { id: "left", clip: "inset(32% 0 30% 0)", anim: { x: [ -10, 0 ] } }, // 3rd 20%
    { id: "right", clip: "inset(54% 0 10% 0)", anim: { x: [ 5, 0 ] } }, // 4th 20%
    ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      <div className="relative w-72 h-72">
        {parts.map((part, i) => (
          <motion.img
            key={part.id}
            src="/aijim-uploads/aijim.svg" // your logo
            alt="AIJIM Logo"
            style={{
              position: "absolute",
              inset: 0,
              clipPath: part.clip, // mask only a slice
            }}
            initial={{ opacity: 0, ...part.anim }}
            animate={{ opacity: 1, ...Object.fromEntries(Object.keys(part.anim).map(k => [k, 0])) }}
            transition={{ delay: i * 0.3, duration: 1, ease: "easeOut" }}
            onAnimationComplete={i === parts.length - 1 ? onComplete : undefined}
          />
        ))}
      </div>
    </div>
  );
}
