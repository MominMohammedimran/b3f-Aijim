import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const parts = [
    { id: "down", clip: "inset(0 0 79% 0)", anim: { y: [ -80, 0 ] } }, // top 20%
    { id: "up", clip: "inset(20% 0 60% 0)", anim: { y: [ 80, 0 ] } },  // 2nd 20%
    { id: "left", clip: "inset(39% 0 41% 0)", anim: { x: [ -80, 0 ] } }, // 3rd 20%
    { id: "right", clip: "inset(59% 0 21% 0)", anim: { x: [ 80, 0 ] } }, // 4th 20%
    { id: "center", clip: "inset(80% 0 0 0)", anim: { scale: [0.8, 1] } }, // last 20%
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
