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
    <div>
      <form onSubmit={onSubmit} className="relative mb-4 animate-fade-in">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full pl-10 pr-8 py-2 border rounded-lg text-lg font-semibold text-gray-800"
        />

        {searchQuery && !showChip && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X size={18} className="text-gray-600 hover:text-black" />
          </button>
        )}
      </form>

      {showChip && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-2 bg-gray-200 text-black px-3 py-1 rounded-none text-md font-semibold">
            {searchQuery}
            <button onClick={removeChip}>
              <X size={14} className="hover:text-red-500" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
