import React from "react";
import {Link,useNavigate} from "react-router-dom"
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, RotateCcw,Tag, Shield } from "lucide-react";
import Marquee from "react-fast-marquee";
const NewHero = () => {

  return (
    <div className="relative h-[70vh] mt-4 overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={"https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/paymentproofs/Banner/aijim-main-banner-001.png"}
          alt="AIJIM lifestyle - model wearing oversized streetwear"
          className="w-full h-full object-cover object-center"
          loading='eager'
        
              />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Hero Content 
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
            OVERSIZED
            <span className="block text-accent">PERFECTION</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
            Premium streetwear that defines your style. Comfort meets attitude in every piece.
          </p>
          
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white font-bold text-lg px-12 py-6 rounded-none transition-all duration-300 hover:scale-105"
            >
              SHOP NOW
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>/*}

      {/* Trust Signals Banner */}

      
      <div className="bg-white absolute bottom-0 left-0 right-0 h-6  z-10 bottom justify-center  pt-1 pb-1  md:h-8 md:pt-3 md:pb-3 flex items-center ">
                    <Marquee gradient={false} speed={5} pauseOnHover={true} className="w-full">
                      {Array.from({ length:14 }).map((_, i) => (
                        <span key={i} className="flex items-center uppercase  text-black font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] px-4 whitespace-nowrap">
                             <Truck size={18}className="mr-3"/>FREE SHIPPING  &nbsp;&nbsp;&nbsp;
                             <RotateCcw size={18}className="mr-3 "/>EASY RETURNS&nbsp;&nbsp;&nbsp;
                              <Shield size={18}className=" mr-3 "/>SECURE PAYMENTS
                              </span>
                      ))}
                    </Marquee>
                  </div>
      
    </div>
  );
};

export default NewHero;
