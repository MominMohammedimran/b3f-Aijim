import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, Filter, SortAsc, ShoppingCart, Search as SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PriceRangeFilter from '../components/ui/PriceRangeFilter';
import { products } from '../lib/data';
import { Product } from '../lib/types';
import { Button } from '@/components/ui/button';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose
} from '@/components/ui/drawer';

type SortOption = 'default' | 'price-low-high' | 'price-high-low';
type FilterCategory = string | null;

const SearchNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  const queryParam = queryParams.get('query');
  
  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
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

  const handleProductClick = (product: Product) => {
    navigate(`/product/details/${product.code}`);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const FilterSidebar = () => (
    <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
      <h3 className="text-lg font-bold mb-6 text-foreground">FILTERS</h3>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-foreground">CATEGORIES</h4>
        <div className="space-y-2">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 rounded transition-all ${
                selectedCategory === category 
                  ? 'bg-accent text-accent-foreground font-bold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-foreground">PRICE RANGE</h4>
        <PriceRangeFilter
          minPrice={minProductPrice}
          maxPrice={maxProductPrice}
          onChange={handlePriceRangeChange}
        />
      </div>

      {/* Clear Filters */}
      <Button 
        onClick={() => {
          setSelectedCategory(null);
          setSortOption('default');
          setPriceRange({ min: minProductPrice, max: maxProductPrice });
          setSearchQuery('');
          navigate('/search');
        }}
        variant="outline"
        className="w-full"
      >
        CLEAR ALL
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link to="/" className="mr-4">
                  <ArrowLeft size={24} className="text-foreground hover:text-accent transition-colors" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">SEARCH</h1>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sort Button - Desktop */}
                <div className="relative hidden md:block">
                  <Button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    variant="outline"
                    className="bg-accent/20 border-accent text-accent font-bold hover:bg-accent hover:text-accent-foreground shadow-glow"
                  >
                    <SortAsc size={16} className="mr-2" />
                    SORT
                  </Button>
                  
                  {isSortOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-glow-strong overflow-hidden z-50">
                      {[
                        { value: 'default', label: 'Default' },
                        { value: 'price-low-high', label: 'Price: Low to High' },
                        { value: 'price-high-low', label: 'Price: High to Low' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value as SortOption)}
                          className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                            sortOption === option.value ? 'bg-accent text-accent-foreground font-bold' : 'text-foreground'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter Button - Desktop */}
                <Button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  variant="outline" 
                  className="hidden md:flex bg-primary/20 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground shadow-glow"
                >
                  <Filter size={16} className="mr-2" />
                  FILTER
                </Button>

                {/* Mobile Filter Drawer */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="md:hidden bg-primary/20 border-primary text-primary font-bold">
                      <Filter size={16} />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[90vh]">
                    <DrawerHeader>
                      <DrawerTitle className="text-xl font-bold">FILTERS & SORT</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6 overflow-y-auto">
                      <FilterSidebar />
                      
                      {/* Mobile Sort */}
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3 text-foreground">SORT BY</h4>
                        <div className="space-y-2">
                          {[
                            { value: 'default', label: 'Default' },
                            { value: 'price-low-high', label: 'Price: Low to High' },
                            { value: 'price-high-low', label: 'Price: High to Low' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value as SortOption)}
                              className={`block w-full text-left px-3 py-2 rounded transition-all ${
                                sortOption === option.value 
                                  ? 'bg-accent text-accent-foreground font-bold' 
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for streetwear, hoodies, tees..."
                  className="w-full pl-12 pr-12 py-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent font-medium"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            {isFilterOpen && (
              <aside className="hidden md:block w-80 sticky top-40 h-fit">
                <FilterSidebar />
              </aside>
            )}

            {/* Products Grid */}
            <main className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl font-bold text-foreground mb-2">NO PRODUCTS FOUND</p>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-muted-foreground">
                      Showing {currentProducts.length} of {filteredProducts.length} products
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {currentProducts.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="group cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                          <div className="relative aspect-square overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            
                            {/* Quick Add to Cart */}
                            <button className="absolute top-3 right-3 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                              <ShoppingCart size={16} />
                            </button>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                              {product.name.toUpperCase()}
                            </h3>
                            <p className="text-lg font-bold text-accent">
                              ₹{product.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                      <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                      >
                        PREVIOUS
                      </Button>
                      
                      <span className="text-foreground font-medium">
                        {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                      >
                        NEXT
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchNew;