import React, { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface OrderRelatedProductsProps {
  excludeItems?: any[]; 
}

const OrderRelatedProducts: React.FC<OrderRelatedProductsProps> = ({ excludeItems = [] }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversalProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("category", "Tshirt")
          .order("created_at", { ascending: false })
          .limit(15);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversalProducts();
  }, []);

  const purchasedCodes = excludeItems.map((item) => item.product?.code || item.code);
  const filteredProducts = products.filter((p) => !purchasedCodes.includes(p.code));

  if (loading) return (
    <div className="flex justify-center py-12 bg-black"><Loader2 className="w-6 h-6 animate-spin text-yellow-500" /></div>
  );

  if (filteredProducts.length === 0) return null;

  return (
    <section className="py-10 border-t border-gray-900 bg-black relative group">
      <div className="container-custom relative px-8"> {/* Increased padding for arrows */}
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">
          More Similar Products
        </h2>

        {/* Relative wrapper for Swiper and Buttons */}
        <div className="relative px-2"> 
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            loop={filteredProducts.length > 4}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            // Connect Swiper to the custom button classes
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="mySwiper"
          >
            {filteredProducts.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="pb-4">
                  <ProductCard
                    product={item}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      navigate(`/product/${item.code}`);
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- LEFT ARROW --- */}
          <button className="custom-prev absolute left-[-30px] top-1/2 -translate-y-1/2 z-50 bg-black/90 border border-gray-800 text-white p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all opacity-0 group-hover:opacity-100 disabled:hidden flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* --- RIGHT ARROW --- */}
          <button className="custom-next absolute right-[-30px] top-1/2 -translate-y-1/2 z-50 bg-black/90 border border-gray-800 text-white p-2 rounded-full hover:bg-yellow-500 hover:text-black transition-all opacity-0 group-hover:opacity-100 disabled:hidden flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderRelatedProducts;