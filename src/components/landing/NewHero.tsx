import React, { useState, useEffect } from "react";
import { Truck, RotateCcw, Shield } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const NewHero = () => {
  const bannerMobile = [
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-mobile-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1tb2JpbGUtYmFubmVyLTAwMS53ZWJwIiwiaWF0IjoxNzYzNTQ1MjA3LCJleHAiOjE3OTUwODEyMDd9.G2BkqoUb1aPI3VSD2iy7VDRVSk3rjxwbWmotEV0YluI",
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-mobile-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1tb2JpbGUtYmFubmVyLTAwMS53ZWJwIiwiaWF0IjoxNzYzNTQ1MjA3LCJleHAiOjE3OTUwODEyMDd9.G2BkqoUb1aPI3VSD2iy7VDRVSk3rjxwbWmotEV0YluI",
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-mobile-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1tb2JpbGUtYmFubmVyLTAwMS53ZWJwIiwiaWF0IjoxNzYzNTQ1MjA3LCJleHAiOjE3OTUwODEyMDd9.G2BkqoUb1aPI3VSD2iy7VDRVSk3rjxwbWmotEV0YluI",
  ];

  const bannerLargeScreens = [
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-desktop-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1kZXNrdG9wLWJhbm5lci0wMDEud2VicCIsImlhdCI6MTc2MzU0NTE4NCwiZXhwIjoxNzk1MDgxMTg0fQ.h-mRicJnUv-G5tLc4pRCtVcNZu18rBB_8_mwjxw7tY4",
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-desktop-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1kZXNrdG9wLWJhbm5lci0wMDEud2VicCIsImlhdCI6MTc2MzU0NTE4NCwiZXhwIjoxNzk1MDgxMTg0fQ.h-mRicJnUv-G5tLc4pRCtVcNZu18rBB_8_mwjxw7tY4",
    "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/Aijim-desktop-banner-001.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci9BaWppbS1kZXNrdG9wLWJhbm5lci0wMDEud2VicCIsImlhdCI6MTc2MzU0NTE4NCwiZXhwIjoxNzk1MDgxMTg0fQ.h-mRicJnUv-G5tLc4pRCtVcNZu18rBB_8_mwjxw7tY4",
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
        className="w-full h-full"
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
                md:mb-8
                mb-6 // Large desktop
              "
              loading="eager"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 mt-5"></div>

      {/* Trust Messages */}
      <div className="bg-white absolute bottom-0 left-0 right-0 h-6 z-10 pt-1 pb-1 mt-5 md:h-8 md:pt-3 md:pb-3 flex items-center">
        <Marquee gradient={false} speed={5} pauseOnHover className="w-full">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase text-black font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] px-4 whitespace-nowrap"
            >
              <Truck size={18} className="mr-3" /> FREE SHIPPING &nbsp;&nbsp;&nbsp;
              <RotateCcw size={18} className="mr-3" /> EASY RETURNS &nbsp;&nbsp;&nbsp;
              <Shield size={18} className="mr-3" /> SECURE PAYMENTS
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default NewHero;
