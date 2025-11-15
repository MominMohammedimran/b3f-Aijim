import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

interface ProductDescriptionProps {
  desc?: string;
}

const ProductDescription = ({ desc }: ProductDescriptionProps) => {
  const defaultDescription = `
Timeless Style Meets Modern Craftsmanship.
This elegant beige oversized T-shirt offers a refined look with premium comfort. Featuring intricate front embroidery, it is the perfect blend of youth style and classic charm for those who appreciate subtle sophistication.

DETAILS
✔️ 100% Pure Cotton: Ultra-soft, breathable fabric ensuring maximum comfort throughout the day.
✔️ Oversized Youth Fit: Relaxed yet stylish silhouette tailored for a trendy, youthful vibe.
✔️ Weight: 240 GSM: High-quality cotton providing durability and a luxurious feel.
✔️ Front Embroidery: Detailed embroidery that adds a tactile, premium finish.
✔️ Colour: Soft beige base pairing effortlessly with any outfit.
✔️ Made in India: Crafted with attention to detail by skilled artisans.

ARTWORK FEATURES
- High-quality thread embroidery for crisp, refined aesthetic.
- Designed to combine understated style with youthful energy.
- Embroidery adds texture and character for a standout look.

WASH CARE
- Turn inside out and wash with cold water.
- Use gentle detergents; avoid bleach or dry cleaning.
- Do not iron directly over the embroidery.
- Dry in shade for long-lasting color and print.
`;

  // ✅ Use product description if available, else fallback
  const text = useMemo(() => {
    const finalText = desc && desc.trim().length > 20 ? desc : defaultDescription;
    return finalText.trim().split(/\n+/).map((line) => line.trim()).filter(Boolean);
  }, [desc]);

  // ✅ Group by sections like DETAILS, ARTWORK FEATURES, etc.
  const sections = useMemo(() => {
    const grouped: { title: string; content: string[] }[] = [];
    let current: { title: string; content: string[] } | null = null;

    text.forEach((line) => {
      const isHeader =
        line.match(/^(story|details|artwork features|wash care|limited edition|style it with)/i);

      if (isHeader) {
        if (current) grouped.push(current);
        current = { title: line.trim(), content: [] };
      } else {
        if (!current) current = { title: "Story", content: [] };
        current.content.push(line);
      }
    });

    if (current) grouped.push(current);
    return grouped;
  }, [text]);

  const [openSections, setOpenSections] = useState(
    sections.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})
  );

  const toggleSection = (index: number) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <div className="mt-4 mb-6 p-2 pb-2 border border-gray-800 bg-black rounded-none transition-all duration-500">
      <h3 className="text-md font-semibold text-yellow-400 uppercase tracking-[1px] mb-4 border-b border-yellow-500/40 pb-2">
        Product Description
      </h3>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="border-b border-gray-800 pb-2 last:border-none"
          >
            <button
              onClick={() => toggleSection(i)}
              className="flex justify-between items-center w-full text-left group"
            >
              <span className="text-yellow-300 text-sm border-b border-yellow-400 font-semibold uppercase tracking-wide group-hover:text-yellow-400 transition">
                {section.title}
              </span>
              {openSections[i] ? (
                <ChevronUp className="w-4 h-4 text-yellow-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {openSections[i] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 pl-1 text-gray-300 text-sm leading-relaxed space-y-1"
                >
                  {section.content.map((line, j) => (
                    <motion.p
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.03 }}
                      className="text-xs flex items-start gap-2"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductDescription;
