import { ChevronDown, ChevronUp, Dot } from "lucide-react";
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

  // Group dynamically
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
      if (!currentSection) currentSection = { title: "Details", content: [] };
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
    <div className="mt-4 mb-5 p-5 border border-gray-800 rounded-none bg-black transition-all duration-500">
      <h3 className="text-md font-semibold text-yellow-400 uppercase tracking-[1px] mb-4 border-b border-yellow-500/40 pb-2">
        Product Description
      </h3>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="border-b border-gray-800 pb-3 last:border-none"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(i)}
              className="flex justify-between items-center w-full text-left group"
            >
              <span className="text-yellow-300 text-sm font-semibold uppercase tracking-wide transition-all group-hover:text-yellow-400">
                {section.title}
              </span>
              {openSections[i] ? (
                <ChevronUp className="w-4 h-4 text-yellow-400 transition-transform group-hover:rotate-180" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-hover:-rotate-180" />
              )}
            </button>

            {/* Section Content */}
            <AnimatePresence>
              {openSections[i] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3 pl-2 text-sm font-medium text-gray-300 leading-relaxed space-y-1"
                >
                  {section.content.map((line, j) => (
                    <motion.p
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.05 }}
                      className="flex items-start gap-2 text-gray-300 text-xs "
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
