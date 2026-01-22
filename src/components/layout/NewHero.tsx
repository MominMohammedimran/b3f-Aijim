import React, { useState, useEffect } from "react";
import { Truck, RotateCcw, Shield } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { useBanners } from "@/context/BannerContext";
import { useNavigate } from "react-router-dom";
const bannerPaths: Record<number, string> = {
  0: "/",
  1: "/product/thunderstorm-design-hand-design-black-oversized-tshirt",
  2: "/product/fire-bird-spirit-phoenix-firebird-theme-firebird-design-beige-oversized-tshirt",
  3: "/product/village-essence-village-theme-village-design-royal-blue-oversized-tshirt",
};



const NewHero = () => {
  const { banners, loading } = useBanners();
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    if (loading) return;

    const updateBanner = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setCurrentBanners(
          banners.mobile.length > 0 ? banners.mobile : banners.desktop
        );
      } else {
        setCurrentBanners(
          banners.desktop.length > 0 ? banners.desktop : banners.mobile
        );
      }
    };

    updateBanner();
    window.addEventListener("resize", updateBanner);
    return () => window.removeEventListener("resize", updateBanner);
  }, [banners, loading]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        autoplay={{ delay: 3800, disableOnInteraction: false }}
        loop={!loading && currentBanners.length > 1}
        speed={1600}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}

        allowTouchMove={false}
        className="w-full h-full mt-3"
      >
        {loading ? (
          <SwiperSlide>
            <div className="w-full md:h-[70vh] lg:h-[75vh] bg-gray-300 animate-pulse" />
          </SwiperSlide>
        ) : currentBanners.length > 0 ? (
          currentBanners.map((img, index) => (
            <SwiperSlide key={index} className="relative">
              <img
  src={img}
  alt={`Banner ${index + 1}`}
  loading="eager"
  onClick={() => {
    if (activeIndex === 0) return;

    const path = bannerPaths[activeIndex] || "/";
    navigate(path);
  }}
  className={`w-full object-cover transition-transform duration-[4200ms] scale-110 
    ${activeIndex === 0 ? "cursor-default pointer-events-none" : "cursor-pointer"}
  `}
/>
 {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-6 mt-20 pt-18 hidden">
                <div className="max-w-2xl animate-fadeUp">
                  
                {activeIndex !== 0 && (
  <button
    onClick={() => {
      const path = bannerPaths[activeIndex] || "/shop";
      navigate(path);
    }}
    className="mt-0 px-7 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform duration-300"
  >
    Shop Now
  </button>
)}


                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="w-full md:h-[70vh] lg:h-[75vh] bg-gray-800 flex items-center justify-center">
              <p className="text-3xl font-bold text-white">
                Buy any 2 T-shirt for ₹1000 only!


              </p>
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Marquee */}
      
<div className="absolute bottom-6 left-0 right-0 z-20">
  <div className="bg-white/95 backdrop-blur-sm h-6 flex items-center shadow-sm border-t border-gray-200">
    <Marquee gradient={false} speed={32} pauseOnHover className="w-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="
            flex items-center gap-2 
            uppercase tracking-wide 
            text-black font-semibold 
            text-[11px] sm:text-[13px] 
            px-6 whitespace-nowrap
          "
        >
          <Truck size={15} /> Free Shipping
          <span className="opacity-40">•</span>
          <RotateCcw size={15} /> Easy Returns
          <span className="opacity-40">•</span>
          <Shield size={15} /> Secure Payments
        </span>
      ))}
    </Marquee>
  </div>
</div>

{/* Brand Story Marquee */}
<div className="absolute bottom-0 left-0 right-0 z-20">
  <div className="h-6 bg-gradient-to-r from-red-700 via-red-600 to-red-700 flex items-center shadow-lg">
    <Marquee gradient={false} speed={70} pauseOnHover className="w-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="
            flex items-center 
            uppercase tracking-widest 
            text-white font-semibold 
            text-[12px] sm:text-[14px] 
            px-8 whitespace-nowrap
          "
        >
          Every T-Shirt Tells A Story — Built From Hustle
          <span className="mx-2 opacity-70">•</span>
          <span
  className="
    font-bold text-white 
    inline-block
    animate-aijim-float
    drop-shadow-[0_0_8px_rgba(0,0,0,0.7)]
  "
>
  AIJIM
</span>


        </span>
      ))}
    </Marquee>
  </div>
</div>

  {/* Animations */}
<style>
  {`
    .animate-fadeUp {
      animation: fadeUp 1s ease forwards;
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* AIJIM floating animation */
    .animate-aijim-float {
      display: inline-block;
      animation: aijimFloat 1.2s ease-in-out infinite;
    }

    @keyframes aijimFloat {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-2px);
      }
      100% {
        transform: translateY(2px);
      }
    }
  `}
</style>

    </div>
  );
};

export default NewHero;
