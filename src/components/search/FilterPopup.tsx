import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  tempSelectedSizes: string[];
  toggleTempSize: (size: string) => void;
  uniqueCategories: string[];
  tempSelectedCategories: string[];
  toggleTempCategory: (category: string) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  allAvailableSizes: string[];
};

const FilterPopup = ({
  isOpen,
  onClose,
  tempSelectedSizes,
  toggleTempSize,
  uniqueCategories,
  tempSelectedCategories,
  toggleTempCategory,
  applyFilter,
  clearFilter,
  allAvailableSizes,
}: FilterPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed w-full bottom-16 mb-7 left-1/2 -translate-x-1/2 z-50 bg-black p-5 rounded shadow-lg w-[90%] max-w-md text-yellow-400">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Filter By</h2>
        <X className="cursor-pointer" size={20} onClick={onClose} />
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-1">Category</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {uniqueCategories.map((cat) => (
            <Button
              key={cat}
              variant={
                tempSelectedCategories.includes(cat) ? "default" : "outline"
              }
              size="sm"
              className={
                tempSelectedCategories.includes(cat)
                  ? "bg-red-500 text-white"
                  : "text-yellow-400 border-yellow-400"
              }
              onClick={() => toggleTempCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        {tempSelectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tempSelectedCategories.map((cat) => (
              <div
                key={"sel-cat-" + cat}
                className="flex items-center bg-yellow-400 text-black px-2 py-1 rounded-full text-xs"
              >
                {cat}
                <X
                  size={14}
                  className="ml-1 cursor-pointer"
                  onClick={() => toggleTempCategory(cat)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-1">Sizes</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {allAvailableSizes.map((size) => (
            <Button
              key={size}
              variant={tempSelectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              className={
                tempSelectedSizes.includes(size)
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-yellow-400 border-yellow-400"
              }
              onClick={() => toggleTempSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
        {tempSelectedSizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tempSelectedSizes.map((size) => (
              <div
                key={"sel-size-" + size}
                className="flex items-center bg-red-500 text-white px-2 py-1 gap-3 rounded-none text-xs"
              >
                {size}
                <X
                  size={14}
                  className="ml-1 cursor-pointer"
                  onClick={() => toggleTempSize(size)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Button
          className="text-black bg-yellow-400 hover:bg-yellow-500"
          onClick={applyFilter}
        >
          Apply
        </Button>
        <Button
          className="text-black bg-yellow-400 hover:bg-yellow-500"
          onClick={clearFilter}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default FilterPopup;
