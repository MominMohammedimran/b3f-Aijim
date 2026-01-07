import React, { useState, useEffect } from "react";
import { Truck, RotateCcw, Shield } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useBanners } from "@/context/BannerContext"; // Import the custom hook

const NewHero = () => {
  const { banners, loading } = useBanners(); // Use the context
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;

    const updateBanner = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setCurrentBanners(banners.mobile.length > 0 ? banners.mobile : banners.desktop);
      } else {
        setCurrentBanners(banners.desktop.length > 0 ? banners.desktop : banners.mobile);
      }
    };

    updateBanner();
    window.addEventListener("resize", updateBanner);
    return () => window.removeEventListener("resize", updateBanner);
  }, [banners, loading]);

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={!loading && currentBanners.length > 1}
        speed={1200}
        allowTouchMove={false}
        className="w-full md:w-[90vw] lg:w-[85vw] h-full sm:mt-15 object-cover mt-8"
      >
        {loading ? (
          <SwiperSlide>
            <div className="w-full h-full sm:h-full md:h-[70vh] lg:h-[75vh] bg-gray-300 animate-pulse"></div>
          </SwiperSlide>
        ) : currentBanners.length > 0 ? (
          currentBanners.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                alt={`Banner image ${index + 1}`}
                className="w-full object-cover h-full sm:h-[70vh] md:h-[70vh] lg:h-[75vh] sm:mb-6"
                loading="eager"
              />
            </SwiperSlide>
          ))
        ) : (
           <SwiperSlide>
             <div className="w-full h-full sm:h-full md:h-[70vh] lg:h-[75vh] bg-gray-200 flex items-center justify-center p-4 text-center">
                <p className="text-3xl font-bold text-gray-100">Buy any 2 T-shirt for ₹1000 only!</p>
             </div>
           </SwiperSlide>
        )}
      </Swiper>

      <div className="bg-white absolute bottom-0 left-0 right-0 h-6 z-10 pt-1 pb-1 md:h-8 md:pt-3 md:pb-3 flex items-center">
        <Marquee gradient={false} speed={5} pauseOnHover className="w-full">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase text-black font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] px-4 whitespace-nowrap"
            >
              <Truck size={18} className="mr-3" /> FREE SHIPPING
              &nbsp;&nbsp;&nbsp;
              <RotateCcw size={18} className="mr-3" /> EASY RETURNS
              &nbsp;&nbsp;&nbsp;
              <Shield size={18} className="mr-3" /> SECURE PAYMENTS
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default NewHero;