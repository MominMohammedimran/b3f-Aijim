import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X,ChevronDown} from 'lucide-react';
import Layout from '../components/layout/Layout';
import PriceRangeFilter from '../components/ui/PriceRangeFilter';
import { products } from '../lib/data';
import { Product } from '../lib/types';
import { Button } from '@/components/ui/button';
import SearchBox from '../components/search/SearchBox';
import CategoryFilter from '../components/search/CategoryFilter';
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const minProductPrice = Math.min(...products.map(product => product.price));
  const maxProductPrice = Math.max(...products.map(product => product.price));

  const uniqueCategories = [...new Set(products.map(product => product.category))];

  useEffect(() => {
    window.scrollTo(0, 0);

    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    } else if (queryParam && !selectedCategory) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(queryParam.toLowerCase()) ||
        product.category.toLowerCase().includes(queryParam.toLowerCase())
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

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
  }, [categoryParam, queryParam, priceRange, sortOption, selectedCategory]);

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

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
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
          <h1 className="text-2xl font-bold">Search</h1>
        </div>

        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
        />

        <CategoryFilter
          categories={uniqueCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryClick}
        />

        {(searchQuery || categoryParam || selectedCategory) && (
          <>
            <ProductGrid
              products={currentProducts}
              onProductClick={handleProductClick}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
          </>
        )}
      </div>

      {/* Sticky Filter & Sort Buttons */}
      <div className="fixed bottom-12 left-0 right-0 z-50  bg-black border-t border-gray-200 py-0 flex justify-around ">
        <Button
          onClick={() => setIsFilterPopupOpen(true)}
          className="bg-gray-900 text-white uppercase font-semibold border-r border-gray-200 rounded-none shadow-lg w-1/2 hover:bg-gray-900 "
        >
          Filter <ChevronDown size={18} />
        </Button>
        <Button
          onClick={() => setIsSortPopupOpen(true)}
          className="bg-gray-900  text-white uppercase font-semibold px-6  rounded-none shadow-lg w-1/2 hover:bg-gray-900"
        >
          Sort <ChevronDown size={18} />
        </Button>
      </div>

      {/* Filter Popup */}
      {isFilterPopupOpen && (
        <div className="fixed bottom-12 inset-0 bg-black/70 z-50 flex justify-center items-end">
          <div className="bg-gray-900 text-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filter</h2>
              <button onClick={() => setIsFilterPopupOpen(false)}>
                <X size={24} className="text-gray-300 hover:text-white" />
              </button>
            </div>

            <h3 className="font-semibold mb-2">Price Range</h3>
            <PriceRangeFilter
              minPrice={0}
              maxPrice={maxProductPrice}
              onChange={handlePriceRangeChange}
            />

            <div className="mt-6 flex justify-between gap-4">
              <Button
                variant="outline"
                className="w-1/2 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => {
                  setPriceRange({ min: 0, max: maxProductPrice });
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
              {["default", "price-low-high", "price-high-low"].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option as SortOption);
                    setIsSortPopupOpen(false);
                  }}
                  className={`w-full px-4 py-2 rounded-md border ${
                    sortOption === option
                      ? "bg-yellow-400 text-black font-bold"
                      : "border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  {option === "default"
                    ? "Default"
                    : option === "price-low-high"
                    ? "Price: Low to High"
                    : "Price: High to Low"}
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