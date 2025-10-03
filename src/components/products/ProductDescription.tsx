import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function ProductDescription({ desc }: { desc: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-md bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full"
      >
        <h3 className="text-lg font-semibold text-white">Product Details</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {open && (
        <div className="mt-3  space-y-2 text-sm text-gray-300  leading-relaxed">
          {desc.split("\n").map((line, i) => {
            if (!line.trim()) return null;
            return (
              <p key={i} className="flex items-start gap-2">
              
                <span>
                  {line.includes(":") ? (
                    <>
                      <span className="font-bold text-white">
                        {line.split(":")[0]}:
                      </span>{" "}
                      <span>{line.split(":").slice(1).join(":")}</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductDescription;