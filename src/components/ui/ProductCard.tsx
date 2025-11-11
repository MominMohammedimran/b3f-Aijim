import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/lib/types";
import Layout from "@/components/layout/Layout";
import { Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";

interface ProductsProps {
  products: Product[];
  loading?: boolean;
}

const Products: React.FC<ProductsProps> = ({ products, loading = false }) => {
  const [sort, setSort] = useState<"default" | "low" | "newest">("default");
  const [openMenu, setOpenMenu] = useState<"hot" | "edition" | "all" | null>(
    null
  );
  const navigate = useNavigate();

  // Sorting logic
  const sortProducts = useMemo(() => {
    const sorter = (list: Product[]) => {
      if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
      if (sort === "newest") return [...list].sort((a, b) => b.id.localeCompare(a.id));
      return list;
    };
    return sorter;
  }, [sort]);

  // Sort dropdown
  const SortDropdown = ({ section }: { section: "hot" | "edition" | "all" }) => (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenMenu(openMenu === section ? null : section)}
        className="flex items-center gap-1 py-0.5 bg-white font-bold text-black text-xs rounded-none"
      >
        Sort <ChevronDown size={15} />
      </Button>

      {openMenu === section && (
        <ul
          className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-10 text-sm"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {["default", "low", "newest"].map((opt) => (
            <li key={opt}>
              <button
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  sort === opt ? "font-bold" : ""
                }`}
                onClick={() => {
                  setSort(opt as any);
                  setOpenMenu(null);
                }}
              >
                {opt === "default"
                  ? "Default"
                  : opt === "low"
                  ? "Price: Low to High"
                  : "Newest First"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Horizontal section for Hot or Edition products
  const HorizontalSection = ({
    title,
    tag,
    sectionKey,
  }: {
    title: string;
    tag: string;
    sectionKey: "hot" | "edition";
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
      if (!ref.current) return;
      const distance = 250;
      ref.current.scrollBy({
        left: dir === "left" ? -distance : distance,
        behavior: "smooth",
      });
    };

    // Auto-scroll every few seconds
    useEffect(() => {
      const interval = setInterval(() => {
        if (!ref.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        ref.current.scrollBy({
          left: isEnd ? -scrollWidth : 250,
          behavior: "smooth",
        });
      }, 3500);
      return () => clearInterval(interval);
    }, []);

    const filtered = sortProducts(products.filter((p) => p.tags?.includes(tag)));
    if (!filtered.length) return null;

    return (
      <section className="mb-10 px-4 relative">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg mb-1 font-bold">{title}</h2>
          <SortDropdown section={sectionKey} />
        </div>

        <div className="relative">
          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Carousel */}
          <div
            ref={ref}
            className="overflow-x-auto no-scrollbar scroll-smooth flex gap-4 snap-x snap-mandatory"
          >
            {filtered.map((p) => (
              <div
                key={p.id}
                className="snap-start flex-shrink-0 w-[160px] sm:w-[195px] md:w-[210px] h-[310px]"
              >
                <ProductCard
                  product={p}
                  onClick={() => navigate(`/product/details/${p.code}`)}
                />
              </div>
            ))}
          </div>

          {/* Right Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    );
  };

  return (
    <Layout>
      <div className="bg-black text-white py-16 mt-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold mb-3 pt-4 px-4">
            AIJIM Collections
          </h1>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
            </div>
          ) : (
            <>
              {/* 🔥 Hot Selling Section */}
              <HorizontalSection title="🔥 Hot Selling" tag="hot" sectionKey="hot" />

              {/* 🛍 All Products */}
              <section className="px-4 mt-10">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold">🛍 All Products</h2>
                  <SortDropdown section="all" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sortProducts(products).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => navigate(`/product/details/${p.code}`)}
                      className="w-full"
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
