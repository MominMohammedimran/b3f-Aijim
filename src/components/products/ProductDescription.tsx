import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function ProductDescription({ desc }: { desc: string }) {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Parse description into sections
  const lines = desc.split("\n");
  const sections: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.endsWith(":")) {
      if (current) sections.push(current);
      current = { title: trimmed.replace(":", "").trim(), items: [] };
    } else if (trimmed.startsWith("-")) {
      if (current) current.items.push(trimmed.replace(/^-/, "").trim());
    } else {
      if (current) current.items.push(trimmed);
    }
  });
  if (current) sections.push(current);

  return (
    <div className="space-y-0 mt-10">
      {sections.map((sec, i) => {
        const isOpen = openSections[i] ?? false;

        return (
          <div
            key={i}
            className="p-3 rounded-nonebg-gradient-to-br from-black via-gray-900 to-black border border-gray-600 shadow-md"
          >
            {/* Header (clickable) */}
            <button
              onClick={() => toggleSection(i)}
              className="flex justify-between items-center w-full text-left"
            >
              <h4 className="text-sm sm:text-lg font-bold text-white">
                {sec.title}
              </h4>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-yellow-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-yellow-300" />
              )}
            </button>

            {/* Collapsible content */}
            {isOpen && (
              <ul className="space-y-1 mt-2">
                {sec.items.map((item, j) => {
                  const [heading, ...rest] = item.split(":");
                  return (
                    <li
                      key={j}
                      className="flex items-start text-xs sm:text-base"
                    >

                      <span>
                        <span className="font-geist font-semibold text-white">
                          {heading.trim()}
                        </span>
                        {rest.length > 0 && (
                          <span className="text-gray-00 font-neue-montreal font-medium">
                            : {rest.join(":").trim()}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProductDescription;
