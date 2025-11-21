import React, { useRef } from "react";
import { Product } from "@/lib/types";
import { products } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RelatedProductsProps {
  product: Product;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ product }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-8 border-t border-gray-200">
      <div className="container-custom relative">
        <h2 className="text-2xl font-bold mb-6 underline">Related Products</h2>

        {/* Arrow Buttons */}
        <button
          aria-label="Scroll Left"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/1 z-10 bg-black/70 text-white backdrop-blur-md shadow rounded-none p-1 hover:bg-red-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          aria-label="Scroll Right"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/1 z-10 bg-black/70 text-white backdrop-blur-md shadow rounded-none p-1 hover:bg-red-500"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Horizontal Scrollable Row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2"
        >
          {relatedProducts.map((item) => (
            <div
              key={item.id}
              className="min-w-[180px] md:min-w-[220px] relative group cursor-pointer"
          onClick={() => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
  navigate(`/product/details/${item.code}`);
}}

            >
              <ProductCard product={item} />

              {/* Hover images preview */}
              {item.images && item.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="preview"
                      className="w-6 h-6 rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
