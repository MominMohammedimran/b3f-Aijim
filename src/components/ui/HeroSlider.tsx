import Slider from "react-slick";
import { useState, useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ✅ Custom Prev Arrow component
// ✅ Custom Prev Arrow (always visible, transparent white bg)
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="slick-prev z-50"
    onClick={onClick}
    style={{ display: "block" }} // ensures it's always visible
  >
    <ChevronLeft className="absolute top-1/2 left-8 -translate-y-1/2 w-8 h-8 text-white bg-white bg-opacity-30 rounded-full p-2 cursor-pointer hover:text-black transition" />
  </div>
);

// ✅ Custom Next Arrow (optional same style for matching look)
const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="slick-next z-50"
    onClick={onClick}
    style={{ display: "block" }}
  >
    <ChevronRight className="absolute top-1/2 right-8 -translate-y-1/2 w-8 h-8 text-white bg-white bg-opacity-30 rounded-full p-2 cursor-pointer hover:text-black transition" />
  </div>
);


const heroSlides = [
  {
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/Aijim_00001.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL0FpamltXzAwMDAxLnBuZyIsImlhdCI6MTc1MzI3MjcyMiwiZXhwIjoyMDY4NjMyNzIyfQ.c0jF9sRGnb3212FFz3vC1GJM-jiOJvZqZ9N3lYXGoNo",
    alt: "Oversized T-Shirts",
    showText: true,
  },
  {
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/23july2025banner1.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci8yM2p1bHkyMDI1YmFubmVyMS53ZWJwIiwiaWF0IjoxNzUzMjczMTA0LCJleHAiOjE4MTYzNDUxMDR9.-CjRWuSmZenapSUUSEATflnXBeA6aUlQfX1ySyiCoFU",
    alt: "Slide 2",
    showText: false,
  },
  {
    src: "https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/banner/23july2025banner1.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL2Jhbm5lci8yM2p1bHkyMDI1YmFubmVyMS53ZWJwIiwiaWF0IjoxNzUzMjczMTA0LCJleHAiOjE4MTYzNDUxMDR9.-CjRWuSmZenapSUUSEATflnXBeA6aUlQfX1ySyiCoFU",
    alt: "Slide 3",
    showText: false,
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className="relative mb-4 bg-gradient-to-br from-gray-900 to-black rounded-none overflow-hidden">
      <Slider ref={sliderRef} {...settings}>
        {heroSlides.map((slide, i) => (
          <div key={i} className="relative">
            <img
              src={slide.src}
              alt={slide.alt}
              className={`w-full h-[350px] sm:h-[400px]  object-cover transition-opacity duration-700 ${
                i === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
            {i === 0 && currentSlide === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center p-6">
                <div className="bg-black bg-opacity-70 p-4 rounded-lg mb-4 animate-fade-in">
                  <h1 className="text-xl md:text-4xl font-bold text-white mb-2">
                    OVERSIZED PRINTED T-SHIRTS
                  </h1>
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-4">
                    BUY MORE, SAVE MORE
                  </h2>
                  <div className="flex justify-center space-x-2 text-lg md:text-xl">
                    <span className="text-yellow-400 font-bold">2 AT ₹999</span>
                    <span className="text-white">|</span>
                    <span className="text-yellow-400 font-bold">3 AT ₹1199</span>
                  </div>
                </div>
              </div>
            )}

        

          </div>
          
        ))}
        
         {/* Clickable Progress Bars */}
     
      </Slider>

      {/* Clickable Progress Bars */}
      <div className="flex absolute bottom-4 left-1/2 -translate-x-1/2 justify-center items-center space-x-2 w-[50%]">
            {heroSlides.map((_, i) => (
          <div
            key={i}
            onClick={() => sliderRef.current?.slickGoTo(i)}
            className="w-full h-1 bg-gray-700 rounded-none overflow-hidden cursor-pointer group"
          >
            {i === currentSlide && (
              <div
                key={currentSlide}
                className="h-full bg-white animate-slide-progress"
              ></div>
            )}
          </div>
        ))}
      </div>

      
    </div>
    
  );
}
