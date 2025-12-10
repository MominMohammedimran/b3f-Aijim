import React, { useState, useEffect } from "react";
import { Truck, RotateCcw, Shield } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const NewHero = () => {
  const bannerMobile = [
    "/aijim-uploads/banner/mobile/All-five-tshirts.jpg",
    "/aijim-uploads/banner/mobile/White-blue-combo.jpg",
    "/aijim-uploads/banner/mobile/Beige-olivegreen-combo.jpg",
   ,
  ];

  const bannerLargeScreens = [
    "/aijim-uploads/banner/desktop/All-five-tshirts.jpg",
     "/aijim-uploads/banner/desktop/All-five-tshirts.jpg",
      "/aijim-uploads/banner/desktop/All-five-tshirts.jpg",

  ];

  const [banners, setBanners] = useState(bannerMobile);

  useEffect(() => {
    const updateBanner = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setBanners(bannerMobile);
      } else {
        setBanners(bannerLargeScreens);
      }
    };

    updateBanner();
    window.addEventListener("resize", updateBanner);
    return () => window.removeEventListener("resize", updateBanner);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Banner Carousel */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={banners.length > 1}
        speed={1200}
        allowTouchMove={false}
        className="w-full md:w-[70vw] lg:w-[70vw] h-full sm:mt-10  object-fill"
      >
        {banners.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`AIJIM lifestyle banner ${index + 1}`}
              className="
                w-full
                object-fill
                h-full     // Mobile height
                sm:h-[50vh]   // Tablet height
                md:h-[70vh]   // Laptop / small desktop
                lg:h-[75vh] 
                sm:mb-6
                // Large desktop
              "
              loading="eager"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Overlay */}
      

      {/* Trust Messages */}
      <div className="bg-white absolute bottom-0 left-0 right-0 h-6 z-10 pt-1 pb-1 mt-2 md:h-8 md:pt-3 md:pb-3 flex items-center">
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
