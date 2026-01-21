import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  clearSearch,
}) => {
  const [showChip, setShowChip] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    handleSearch(e);
    if (searchQuery.trim()) setShowChip(true);
  };

  const removeChip = () => {
    clearSearch();
    setShowChip(false);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="relative mb-4 animate-fade-in"
      >
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products..."
          className="
            w-full pl-11 pr-10 py-3 
            rounded-xl 
            border border-gray-300 
            text-[18px] font-semibold text-gray-800
            shadow-sm
            transition-all duration-300
            focus:outline-none 
            focus:ring-2 focus:ring-yellow-400 
            focus:border-yellow-400
            hover:shadow-md
          "
        />

        {searchQuery && !showChip && (
          <button
            type="button"
            onClick={clearSearch}
            className="
              absolute right-3 top-1/2 -translate-y-1/2 
              p-1 rounded-full
              hover:bg-gray-200 transition
            "
          >
            <X size={18} className="text-gray-500 hover:text-black" />
          </button>
        )}
      </form>

      {showChip && (
        <div className="mt-2 flex gap-2 flex-wrap animate-fade-in">
          <span
            className="
              inline-flex items-center gap-2 
              bg-red-600 text-white 
              px-4 py-1.5 
              rounded-none 
              text-sm font-semibold
              shadow-sm
            "
          >
            {searchQuery}
            <button
              onClick={removeChip}
              className="hover:text-red-500 transition"
            >
              <X size={14} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
