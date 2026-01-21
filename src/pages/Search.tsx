import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Product } from "../lib/types";
import { Button } from "@/components/ui/button";
import SearchBox from "../components/search/SearchBox";
import Pagination from "../components/search/Pagination";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";
import FilterPopup from "../components/search/FilterPopup";
import SortPopup from "../components/search/SortPopup";

type SortOption = "default" | "price-low-high" | "price-high-low";
const allAvailableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  const queryParam = queryParams.get("query");

  const [searchQuery, setSearchQuery] = useState(queryParam || "");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);

  const [tempSelectedSizes, setTempSelectedSizes] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam
  );
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from("products").select("*");
      if (selectedCategory) query = query.eq("category", selectedCategory);

      const { data, error } = await query;
      if (error) throw error;

      const transformed: Product[] = (data || []).map((item: any) => {
        const rawVariants = Array.isArray(item.variants) ? item.variants : [];
        const variants = rawVariants
          .filter(
            (v) => v && typeof v === "object" && "size" in v && "stock" in v
          )
          .map((v) => ({
            size: String((v as any).size),
            stock: Number((v as any).stock),
          }));

        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

        return {
          id: item.id,
          productId: item.id,
          code: item.code || `PROD-${item.id.slice(0, 8)}`,
          name: item.name,
          description: item.description || "",
          price: item.price,
          originalPrice: item.original_price || item.price,
          discountPercentage: item.discount_percentage || 0,
          image: item.image || "",
          images: Array.isArray(item.images)
            ? item.images.filter((img) => typeof img === "string")
            : [],
          category: item.category || "",
          stock: totalStock,
          variants: variants,
          tags: Array.isArray(item.tags)
            ? item.tags.filter((t) => typeof t === "string")
            : [],
          inStock: totalStock > 0,
        };
      });

      setAllProducts(transformed);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

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

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.some(
          (cat) => p.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        (p.variants || []).some((v) =>
          selectedSizes.includes(v.size?.toUpperCase())
        )
      );
    }

    switch (sortOption) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [allProducts, searchQuery, selectedSizes, selectedCategories, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/search?query=${encodeURIComponent(searchQuery)}`
        : "/search"
    );
    setSelectedCategory(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    navigate("/search");
  };

  const CUSTOM_DESIGN_CODES = [
    "CUSTOM-CAP-001",
    "CUSTOM-MUG-001",
    "CUSTOM-TSHIRT-001",
  ];
  
  const handleProductClick = (product: Product) => {
    const code = product.code;
  
    const isCustomDesignProduct = CUSTOM_DESIGN_CODES.includes(code) 
  
    if (isCustomDesignProduct) {
      navigate(`/customization/${code}`, { replace: true });
    } else {
      navigate(`/product/${code}`);
    }
  };
  

  const toggleTempSize = (size: string) =>
    setTempSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const toggleTempCategory = (category: string) =>
    setTempSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

  const applyFilter = () => {
    setSelectedSizes(tempSelectedSizes);
    setSelectedCategories(tempSelectedCategories);
    setIsFilterPopupOpen(false);
  };

  const clearFilter = () => {
    setTempSelectedSizes([]);
    setTempSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setIsFilterPopupOpen(false);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category))
  ).filter(Boolean);

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "Search | AIJIM",
          description: "Search your desired products. ",
        }}
      />
      <div className="container-custom mt-12 pb-28">
        <nav className="flex items-center gap-2 pt-10 mt-10  mb-5 text-white text-sm sm:text-base">
                                        <Link to="/" className="opacity-70 hover:opacity-100 transition">
                                          Home
                                        </Link>
                                    
                                       <span className="opacity-60">/</span>
                                     
                                    
                                        <span className="font-semibold line-clamp-1">
                                       
                                        Search
                                        </span>
                                      </nav>

        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={(q) => setSearchQuery(DOMPurify.sanitize(q))}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
        />

        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading products...</p>
        ) : currentProducts.length > 0 ? (
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

        {(isFilterPopupOpen || isSortPopupOpen) && (
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => {
              setIsFilterPopupOpen(false);
              setIsSortPopupOpen(false);
            }}
          />
        )}

        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setIsFilterPopupOpen(false)}
          tempSelectedSizes={tempSelectedSizes}
          toggleTempSize={toggleTempSize}
          uniqueCategories={uniqueCategories}
          tempSelectedCategories={tempSelectedCategories}
          toggleTempCategory={toggleTempCategory}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
          allAvailableSizes={allAvailableSizes}
        />

        <SortPopup
          isOpen={isSortPopupOpen}
          onClose={() => setIsSortPopupOpen(false)}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

<div
  className="
    fixed bottom-14 left-0 w-full z-50 
    bg-black/95 backdrop-blur 
    flex justify-around 
    border border-yellow-400/40
 
    safe-area-inset-bottom
  "
>
  <Button
    className="
      text-yellow-400 w-full rounded-none bg-transparent 
      border-r border-yellow-400/30
      flex items-center justify-center gap-2
      py-3
      text-sm font-semibold tracking-wide
      transition-all duration-200
      hover:bg-red-600
       hover:text-white
      active:scale-95
    "
    onClick={() => {
      setTempSelectedSizes(selectedSizes);
      setTempSelectedCategories(selectedCategories);
      setIsFilterPopupOpen(true);
      setIsSortPopupOpen(false);
    }}
  >
    <SlidersHorizontal size={16} />
    Filter
  </Button>

  <Button
    className="
      text-yellow-400 w-full rounded-none bg-transparent 
      border-l border-yellow-400/30
      flex items-center justify-center gap-2
      py-3
      text-sm font-semibold tracking-wide
      transition-all duration-200
      hover:bg-red-600
       hover:text-white
      active:scale-95
    "
    onClick={() => {
      setIsSortPopupOpen(true);
      setIsFilterPopupOpen(false);
    }}
  >
    <ArrowUpDown size={16} />
    Sort
  </Button>
</div>
      </div>
    </Layout>
  );
};

export default Search;
