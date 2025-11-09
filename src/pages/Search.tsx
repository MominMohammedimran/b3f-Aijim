import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Product } from '../lib/types';
import { Button } from '@/components/ui/button';
import SearchBox from '../components/search/SearchBox';
import Pagination from '../components/search/Pagination';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ui/ProductCard'; // ✅ Using ProductCard directly

type SortOption = 'default' | 'price-low-high' | 'price-high-low';
type FilterCategory = string | null;

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const queryParam = queryParams.get('query');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFilterCategories, setSelectedFilterCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // ✅ Load all products
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error loading products:', error);
      else setAllProducts(data || []);
    }
    loadProducts();
  }, []);

  const uniqueCategories = [...new Set(allProducts.map((p) => p.category))];
  const allAvailableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // ✅ Filtering and sorting logic
  useEffect(() => {
    let filtered = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedFilterCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedFilterCategories.some(
          (cat) => p.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // ✅ Size filtering (includes out-of-stock)
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) => {
        const variants =
          typeof p.variants === 'string'
            ? JSON.parse(p.variants)
            : Array.isArray(p.variants)
            ? p.variants
            : [];
        return variants.some((v) =>
          selectedSizes.includes(v.size?.toUpperCase())
        );
      });
    }

    switch (sortOption) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedFilterCategories,
    selectedSizes,
    sortOption,
    allProducts,
  ]);

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

  const handleProductClick = (product: Product) => {
    if (product.code.includes('TSHIRT-PRINT') || product.code.includes('MUG-PRINT')) {
      navigate(`/design-tool`);
    } else {
      navigate(`/product/details/${product.code}`);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleFilterCategory = (category: string) => {
    setSelectedFilterCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // ✅ Dim out-of-stock sizes but still clickable
  const isSizeOutOfStock = (size: string) => {
    return !allProducts.some((p) => {
      const variants =
        typeof p.variants === 'string'
          ? JSON.parse(p.variants)
          : Array.isArray(p.variants)
          ? p.variants
          : [];
      return variants.some(
        (v) =>
          v.size?.toUpperCase() === size &&
          Number(v.stock) > 0
      );
    });
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

        {/* ✅ Product display using ProductCard */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-6">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10">
            No products found for your selection.
          </p>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </div>

      {/* ✅ Bottom Filter/Sort Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-50 bg-black/50 border-t border-gray-200 flex justify-around">
        <Button
          onClick={() => setIsFilterPopupOpen(true)}
          className="bg-gray-900 text-white uppercase font-semibold border-r border-gray-200 rounded-none shadow-lg w-1/2 hover:bg-gray-900"
        >
          Filter <ChevronDown size={18} />
        </Button>
        <Button
          onClick={() => setIsSortPopupOpen(true)}
          className="bg-gray-900 text-white uppercase font-semibold rounded-none shadow-lg w-1/2 hover:bg-gray-900"
        >
          Sort <ChevronDown size={18} />
        </Button>
      </div>

      {/* ✅ Filter Popup */}
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

            {/* ✅ Size Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Size</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {allAvailableSizes.map((size) => {
                  const outOfStock = isSizeOutOfStock(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-5 py-2 rounded-full border font-semibold transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-yellow-400 text-black border-yellow-400 scale-105'
                          : outOfStock
                          ? 'border-gray-600 text-gray-400 bg-gray-800 cursor-pointer'
                          : 'border-gray-600 text-white hover:bg-gray-800'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                *Dimmed sizes are out of stock but can be pre-booked.
              </p>
            </div>

            {/* ✅ Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-lg">Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleFilterCategory(category)}
                    className={`px-4 py-2 rounded-md border font-semibold text-sm ${
                      selectedFilterCategories.includes(category)
                        ? 'bg-yellow-400 text-black border-yellow-400'
                        : 'border-gray-600 text-white hover:bg-gray-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Filter Footer */}
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

      {/* ✅ Sort Popup */}
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
              {['default', 'price-low-high', 'price-high-low'].map((option) => (
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
