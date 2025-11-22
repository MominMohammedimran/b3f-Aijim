import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { Product } from "../lib/types";
import { Button } from "@/components/ui/button";
import SearchBox from "../components/search/SearchBox";
import Pagination from "../components/search/Pagination";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";
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

  const handleProductClick = (product: Product) => {
    if (
      product.code.includes("TSHIRT-PRINT") ||
      product.code.includes("MUG-PRINT")
    ) {
      navigate(`/design-tool`);
    } else {
      navigate(`/product/${product.code}`);
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
      <div className="container-custom mt-16 pb-28">
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

        {/* Overlay */}
        {(isFilterPopupOpen || isSortPopupOpen) && (
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => {
              setIsFilterPopupOpen(false);
              setIsSortPopupOpen(false);
            }}
          />
        )}

        {/* Filter Popup */}
        {isFilterPopupOpen && !isSortPopupOpen && (
          <div className="fixed w-full bottom-16 mb-5 left-1/2 -translate-x-1/2 z-50 bg-black p-5 rounded shadow-lg w-[90%] max-w-md text-yellow-400">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Filter By</h2>
              <X
                className="cursor-pointer"
                size={20}
                onClick={() => setIsFilterPopupOpen(false)}
              />
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-1">Category</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={
                      tempSelectedCategories.includes(cat)
                        ? "default"
                        : "outline"
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
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-1">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {allAvailableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={
                      tempSelectedSizes.includes(size) ? "default" : "outline"
                    }
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
            </div>

            <div className="flex justify-between mt-4">
              <Button
                className="text-black bg-yellow-400 hover:bg-yellow-500"
                onClick={applyFilter}
              >
                Apply
              </Button>
              <Button
                className="text-black bg-yellow-400 hover:bg-yellow-500 "
                onClick={clearFilter}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Sort Popup */}
        {isSortPopupOpen && !isFilterPopupOpen && (
          <div className="w-full fixed bottom-16 mb-5 left-1/2 -translate-x-1/2 z-50 bg-black p-5 rounded shadow-lg w-[90%] max-w-xs text-yellow-400">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Sort By</h2>
              <X
                className="cursor-pointer"
                size={20}
                onClick={() => setIsSortPopupOpen(false)}
              />
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
                  setIsSortPopupOpen(false);
                }}
              >
                Default
              </Button>
              <Button
                variant={
                  sortOption === "price-low-high" ? "default" : "outline"
                }
                size="sm"
                className={
                  sortOption === "price-low-high"
                    ? "bg-red-500 text-white"
                    : "text-yellow-400 border-yellow-400"
                }
                onClick={() => {
                  setSortOption("price-low-high");
                  setIsSortPopupOpen(false);
                }}
              >
                Price: Low to High
              </Button>
              <Button
                variant={
                  sortOption === "price-high-low" ? "default" : "outline"
                }
                size="sm"
                className={
                  sortOption === "price-high-low"
                    ? "bg-red-500 text-white"
                    : "text-yellow-400 border-yellow-400"
                }
                onClick={() => {
                  setSortOption("price-high-low");
                  setIsSortPopupOpen(false);
                }}
              >
                Price: High to Low
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Sticky Filter & Sort Bar */}
        <div className="fixed bottom-12 left-0 w-full bg-black z-50 flex justify-around border-t border-yellow-400">
          <Button
            className="text-yellow-400 w-full rounded-none bg-black border-r border-yellow-400 hover:bg-black/60"
            onClick={() => {
              setTempSelectedSizes(selectedSizes);
              setTempSelectedCategories(selectedCategories);
              setIsFilterPopupOpen(true);
              setIsSortPopupOpen(false);
            }}
          >
            Filter
          </Button>
          <Button
            className="text-yellow-400 w-full bg-black rounded-none border-yellow-400 hover:bg-black/60"
            onClick={() => {
              setIsSortPopupOpen(true);
              setIsFilterPopupOpen(false);
            }}
          >
            Sort
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
