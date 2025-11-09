import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { products } from '../lib/data';
import { Product } from '../lib/types';
import { Button } from '@/components/ui/button';
import SearchBox from '../components/search/SearchBox';
import ProductGrid from '../components/search/ProductGrid';
import Pagination from '../components/search/Pagination';

type SortOption = 'default' | 'price-low-high' | 'price-high-low';
type FilterCategory = string | null;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const queryParam = queryParams.get('query');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFilterCategories, setSelectedFilterCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const uniqueCategories = [...new Set(products.map(product => product.category))];
  const availableSizes = Array.from(
    new Set(
      products.flatMap(p =>
        p.variants?.map(v => v.size.toUpperCase()) ||
        p.sizes?.map(s => s.size.toUpperCase()) ||
        []
      )
    )
  ).sort();

  useEffect(() => {
    window.scrollTo(0, 0);

    let filtered = [...products];

    // --- SEARCH LOGIC ---
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q))
      );
    }

    // --- CATEGORY FILTER (from URL or popup) ---
    if (selectedCategory) {
      filtered = filtered.filter(
        product => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedFilterCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedFilterCategories.some(cat =>
          product.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // --- SIZE FILTER (FIXED) ---
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => {
        const variants = product.variants || product.sizes || [];
        return variants.some(variant => {
          const size = variant.size?.toUpperCase?.();
          const stock = Number(variant.stock);
          return selectedSizes.includes(size) && stock > 0;
        });
      });
    }

    // --- SORT LOGIC ---
    switch (sortOption) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFilterCategories, selectedSizes, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSelectedCategory(null);
    } else {
      navigate('/search');
      setSelectedCategory(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    navigate('/search');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  const handleProductClick = (product: Product) => {
    if (product.code.includes('TSHIRT-PRINT') || product.code.includes('MUG-PRINT')) {
      navigate(`/design-tool`);
    } else {
      navigate(`/product/details/${product.code}`);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleFilterCategory = (category: string) => {
    setSelectedFilterCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Layout>
      <div className="container-custom mt-16">
        <div className="flex items-center mb-4 pt-8 animate-fade-in">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-xl font-semibold">Search</h1>
        </div>

        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
        />

        <ProductGrid products={currentProducts} onProductClick={handleProductClick} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </div>

      {/* Sticky Filter & Sort Buttons */}
      <div className="fixed bottom-14 left-0 right-0 z-50 bg-black/50 border-t border-gray-200 py-0 flex justify-around">
        <Button
          onClick={() => setIsFilterPopupOpen(true)}
          className="bg-gray-900 text-white uppercase font-semibold border-r border-gray-200 rounded-none shadow-lg w-1/2 hover:bg-gray-900"
        >
          Filter <ChevronDown size={18} />
        </Button>
        <Button
          onClick={() => setIsSortPopupOpen(true)}
          className="bg-gray-900 text-white uppercase font-semibold px-6 rounded-none shadow-lg w-1/2 hover:bg-gray-900"
        >
          Sort <ChevronDown size={18} />
        </Button>
      </div>

      {/* Filter Popup */}
      {isFilterPopupOpen && (
        <div
          className="fixed bottom-12 inset-0 bg-black/70 z-50 flex justify-center items-end"
          onClick={() => setIsFilterPopupOpen(false)}
        >
          <div
            className="bg-gray-900 text-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filter</h2>
              <button onClick={() => setIsFilterPopupOpen(false)}>
                <X size={24} className="text-gray-300 hover:text-white" />
              </button>
            </div>

            {/* Filter by Size */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Size</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-5 py-2 rounded-full border font-semibold transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-yellow-400 text-black border-yellow-400 scale-105"
                        : "border-gray-600 text-white hover:bg-gray-800"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Category */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleFilterCategory(category)}
                    className={`px-4 py-2 rounded-md border font-semibold text-sm ${
                      selectedFilterCategories.includes(category)
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "border-gray-600 text-white hover:bg-gray-800"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-1/2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => {
                  setSelectedSizes([]);
                  setSelectedFilterCategories([]);
                  setSelectedCategory(null);
                  setIsFilterPopupOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                className="w-1/2 bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                onClick={() => setIsFilterPopupOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Popup */}
      {isSortPopupOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-end">
          <div className="bg-gray-900 text-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Sort By</h2>
              <button onClick={() => setIsSortPopupOpen(false)}>
                <X size={24} className="text-gray-300 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              {['default', 'price-low-high', 'price-high-low'].map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option as SortOption);
                    setIsSortPopupOpen(false);
                  }}
                  className={`w-full px-4 py-2 rounded-md border ${
                    sortOption === option
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'border-gray-600 hover:bg-gray-800'
                  }`}
                >
                  {option === 'default'
                    ? 'Default'
                    : option === 'price-low-high'
                    ? 'Price: Low to High'
                    : 'Price: High to Low'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Search;
