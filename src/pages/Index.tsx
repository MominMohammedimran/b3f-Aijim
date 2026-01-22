import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/layout/Layout";
import ProductCard from "../components/ui/ProductCard";
import CategoryItem from "../components/ui/CategoryItem";
import Banner from "../components/ui/Banner";
import ProductVideoSection from "../components/ui/ProductVideoSection";
import { ScrollArea } from "../components/ui/scroll-area";
import { Product } from "../lib/types";
import { useIsMobile } from "../hooks/use-mobile";
import { useLocation } from "../context/LocationContext";
import { useWishlist } from "../context/WishlistContext";
import useSEO from "@/hooks/useSEO"; // ✅ using this
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

import NewHero from "@/components/layout/NewHero";

import { supabase } from "@/integrations/supabase/client";

import { useCart } from "../context/CartContext";
import { FeaturedArticles } from "@/components/articles/FeaturedArticles";
const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentLocation } = useLocation();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  // ----------------------------------------------------------------------
  // ✅ SEO HERE — dynamic with product list
  // ----------------------------------------------------------------------
  useSEO("/", {
    title: "AIJIM | Premium Fashion, Affordable Price",
    description: "Shop premium streetwear & custom printed T-shirts by AIJIM.",
    products, // <- works because I added products support for you
  });

  // ----------------------------------------------------------------------

  const [visibleCategories, setVisibleCategories] = useState<number>(4);
  const [startIndex, setStartIndex] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleResize = () => {
      if (window.innerWidth <= 640) setVisibleCategories(4);
      else if (window.innerWidth <= 1024) setVisibleCategories(4);
      else setVisibleCategories(6);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentLocation]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      let query = supabase.from("products").select("*");
      if (selectedCategory) query = query.eq("category", selectedCategory);

      const { data, error } = await query;
      if (error) throw error;

      const transformed: Product[] = (data || []).map((item: any) => {
        const rawSizes = Array.isArray(item.variants) ? item.variants : [];

        const normalizedSizes = rawSizes
          .filter(
            (s) =>
              typeof s === "object" && s !== null && "size" in s && "stock" in s
          )
          .map((s) => ({
            size: String(s.size),
            stock: Number(s.stock),
          }));

        const totalStock = normalizedSizes.reduce((sum, s) => sum + s.stock, 0);

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
          variants: normalizedSizes,
          tags: Array.isArray(item.tags)
            ? item.tags.filter((tag) => typeof tag === "string")
            : [],
          inStock: totalStock > 0,
        };
      });

      setProducts(transformed);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };
  const { cartItems } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleProductClick = (product: Product) => {
    window.scrollTo(0, 0);
    navigate(`/product/${product.code}`);
  };

  const featuredProducts = products.filter(
    (p) => Array.isArray(p.tags) && p.tags.includes("indexmainimage")
  );

  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint

      if (isMobile && featuredProducts.length > 2) {
        setShowArrows(true);
      } else if (!isMobile && featuredProducts.length > 4) {
        setShowArrows(true);
      } else {
        setShowArrows(false);
      }
    };

    updateVisibility();
    window.addEventListener("resize", updateVisibility);

    return () => window.removeEventListener("resize", updateVisibility);
  }, [featuredProducts]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      scroll("right");
    }, 3000); // 3 seconds auto-scroll

    return () => clearInterval(interval);
  }, []);

  // 🔔 Hourly toast reminder system (Works with Supabase cart)
  
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);


  return (
    <Layout>
      {/* No SEOHelmet needed */}
      <NewSEOHelmet
        pageSEO={{
          title: "AIJIM | Premium Fashion, Affordable Price",
          description:
            "Explore the latest trends and premium printed products by AIJIM.",
        }}
      />

      <NewHero />

      <div className="bg-black min-h-screen pt-5 text-white">
        <div className="container-custom mt-22 pt-2">
          {/*<HeroSlider />*/}

          {/* 🔥 Hot Selling 
      <div className="mb-4 mt-4 min-h-[60px] w-full   bg-gradient-to-br from-black via-gray-900 to-black
 p-4 pl-0 pr-0 shadow-md">
  <div className="flex items-center justify-evenly mb-2">
    <span className="bg-red-500 text-white px-3 py-1 mb-3 text-sm sm:text-m font-bold tracking-wide uppercase shadow">
       Hot Selling
    </span>
  </div>

  <div className="grid grid-cols-1  gap-6">
    {products
      .filter((product) => Array.isArray(product.tags) && product.tags.includes("indexmainimage"))
      .map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 0.08}s` }}
        >

          <div className="w-full  relative h-[290px]  bg-gray-900 overflow-hidden shadow-lg relative">
            <img
              src={product.image} // adjust to your actual field
              alt={product.name}
              onClick={() => handleProductClick(product)}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-3 mb-0 flex-wrap text-center mt-2">
            <span className=" text-white px-3 py-1 leading-relaxed text-md mb-0 sm:text-md font-bold tracking-wide uppercase shadow">
               {product.name}
             </span>

            
          </div>

          {/*<div className="flex justify-center">
            <Link
              to={`/product/${product.id}`}
              className=" px-2 py-1 text-m font-bold bg-white text-black hover:bg-gray-200 shadow transition"
            >
              Shop Now
            </Link>
            
          </div>}
        </div>
      ))}
  </div>
</div>*/}

          {/* Featured products */}
          <div className="relative mb-8">
            <h2 className="text-xl font-bold mb-5 text-left">
              Featured Products
            </h2>

            {loading ? (
              <p className="text-gray-400">Loading Products...</p>
            ) : featuredProducts.length > 0 ? (
              <div className="relative w-full">
                {showArrows && (
                  <button
                    aria-label="Scroll Left"
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
          bg-black/70 text-white px-1.5 py-1 shadow rounded-none
          hover:bg-black hover:text-yellow-400 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto no-scrollbar scroll-smooth gap-1.5 pb-2"
                >
                  {featuredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="min-w-[48%] sm:min-w-[28%] animate-fade-in"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <ProductCard
                        product={product}
                        onClick={handleProductClick}
                      />
                    </div>
                  ))}
                </div>

                {showArrows && (
                  <button
                    aria-label="Scroll Right"
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10
          bg-black/70 text-white px-1.5 py-1 shadow rounded-none
          hover:bg-black  hover:text-yellow-400 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No featured products available.
              </p>
            )}
          </div>

          <ProductVideoSection />

          <h2 className="text-xl font-extrabold text-white mt-6 mb-6 tracking-wide">
            All Products
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading products...</p>
          ) : (
            Object.entries(productsByCategory).map(([category, products]) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-white mt-4 mb-2 capitalize">{category}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                  {products.map((product, i) => (
                    <div
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <ProductCard product={product} onClick={handleProductClick} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
       
      </div>
    </Layout>
  );
};

export default Index;
