import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortOption = "default" | "price-low-high" | "price-high-low";

type SortPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
};

const SortPopup = ({
  isOpen,
  onClose,
  sortOption,
  setSortOption,
}: SortPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="w-full fixed bottom-16 mb-7 left-1/2 -translate-x-1/2 z-50 bg-black p-5 rounded shadow-lg w-[90%] max-w-md text-yellow-400">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Sort By</h2>
        <X className="cursor-pointer" size={20} onClick={onClose} />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant={sortOption === "default" ? "default" : "outline"}
          size="sm"
          className={
            sortOption === "default"
              ? "bg-red-500 text-white"
              : "text-yellow-400 border-yellow-400"
          }
          onClick={() => {
            setSortOption("default");
            onClose();
          }}
        >
          Default
        </Button>
        <Button
          variant={sortOption === "price-low-high" ? "default" : "outline"}
          size="sm"
          className={
            sortOption === "price-low-high"
              ? "bg-red-500 text-white"
              : "text-yellow-400 border-yellow-400"
          }
          onClick={() => {
            setSortOption("price-low-high");
            onClose();
          }}
        >
          Price: Low to High
        </Button>
        <Button
          variant={sortOption === "price-high-low" ? "default" : "outline"}
          size="sm"
          className={
            sortOption === "price-high-low"
              ? "bg-red-500 text-white"
              : "text-yellow-400 border-yellow-400"
          }
          onClick={() => {
            setSortOption("price-high-low");
            onClose();
          }}
        >
          Price: High to Low
        </Button>
      </div>
    </div>
  );
};

export default SortPopup;
