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
    <div className="relative w-full overflow-hidden">
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
      <div className="bg-white absolute bottom-0 left-0 right-0 h-6 z-10 flex items-center">
        <Marquee gradient={false} speed={35} pauseOnHover className="w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase text-black font-semibold text-[11px] sm:text-[13px] px-4 whitespace-nowrap"
            >
              <Truck size={16} className="mr-1" /> FREE SHIPPING
              &nbsp;&nbsp;&nbsp;
              <RotateCcw size={16} className="mr-1" /> EASY RETURNS
              &nbsp;&nbsp;&nbsp;
              <Shield size={16} className="mr-1" /> SECURE PAYMENTS
            </span>
          ))}
        </Marquee>
      </div>
      <div className="absolute bottom-6 left-0 right-0 h-6 z-10 bg-red-600 py-1 flex items-center border-b border-gray-600">
        <Marquee gradient={false} speed={80} pauseOnHover className="w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase text-white font-semibold text-[12px] sm:text-[14px] px-4 whitespace-nowrap"
            >
              "Every T-shirt tells a story — built from hustle. #
              <span className="font-bold ">AIJIM</span>”
            </span>
          ))}
        </Marquee>
      </div>

      {/* Animation */}
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
        `}
      </style>
    </div>
  );
};

export default NewHero;
