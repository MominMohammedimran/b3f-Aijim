import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function ProductDescription({ desc }: { desc: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-2 p-4 border border-gray-700 rounded-none bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full"
      >
        <h3 className="text-lg font-semibold   text-yellow-400">Product Details</h3>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {open && (
        <div className="mt-3  space-y-2 text-sm text-gray-300  leading-relaxed">
          <h3 className="font-medium text-sm leading-relaxed">
            {desc}
            </h3>
        </div>
      )}
    </div>
  );
}

export default ProductDescription;