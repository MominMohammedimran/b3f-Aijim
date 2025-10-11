import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProductDescriptionProps {
  desc?: string;
}

const ProductDescription = ({ desc }: ProductDescriptionProps) => {
  const defaultDescription = `
Neck: Ribbed crew neck for structure and comfort  
Color: High-saturation printing for bold impact  
Design ID: Aijim_00001  

Style It With:  
Layer it over jeans, cargos, or joggers for a casual streetwear vibe.  
Perfect for daily wear, college hangouts, or relaxed weekends.  

Care Instructions:  
🧺 Machine wash cold with similar colors  
🚫 Avoid direct ironing on print  
🌤 Dry in shade to retain print vibrancy  
🧵 Do not bleach or wring  

Limited Edition Drop:  
Only a few pieces available – once sold out, they’re gone for good.
  `;

  const text = (desc && desc.trim().length > 20 ? desc : defaultDescription)
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  // --- Group text into sections dynamically ---
  const sections: { title: string; content: string[] }[] = [];
  let currentSection: { title: string; content: string[] } | null = null;

  text.forEach((line) => {
    const isHeader =
     line.toLowerCase().includes("style it with") ||
                line.toLowerCase().includes("care instructions") ||
                line.toLowerCase().includes("designed by aijim") ||
                line.toLowerCase().includes("limited edition drop") ||
                line.toLowerCase().includes("key features");

    if (isHeader) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line, content: [] };
    } else {
      if (!currentSection) {
        currentSection = { title: "Details", content: [] };
      }
      currentSection.content.push(line);
    }
  });
  if (currentSection) sections.push(currentSection);

  const [openSections, setOpenSections] = useState(
    sections.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})
  );

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mt-4 p-4 border border-gray-700 rounded-md bg-gradient-to-b from-black via-gray-900 to-black shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300">
      <h3 className="text-lg  font-semibold text-yellow-400 uppercase tracking-wide mb-2">
        Product Details
      </h3>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <div
            key={i}
            className="border-b border-gray-800 pb-2 last:border-none"
          >
            {/* Header */}
            <button
              onClick={() => toggleSection(i)}
              className="flex justify-between items-center w-full text-left"
            >
              <span className="text-yellow-400 text-sm font-semibold underline underline-offset-4 decoration-yellow-400 text-[15px] uppercase tracking-wide">
                {section.title}
              </span>
              {openSections[i] ? (
                <ChevronUp className="w-4 h-4 text-yellow-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Content */}
            <AnimatePresence>
              {openSections[i] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="mt-2 text-sm font-medium text-gray-200 leading-relaxed space-y-1"
                >
                  {section.content.map((line, j) => (
                    <p
                      key={j}
                      className="text-gray-300  text-sm font-medium flex items-start gap-1.5"
                    >
                       {line}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDescription;
