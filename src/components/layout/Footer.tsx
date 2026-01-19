import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Mail, HandCoins, Heart, Phone } from "lucide-react";
import Marquee from "react-fast-marquee";
import { useSettings } from "@/context/SettingsContext"; // Import the useSettings hook

const Footer = () => {
  const navigate = useNavigate();
  const { settings, loading } = useSettings(); // Use the hook to get settings

  const footerLinks = [
    { name: "Our Story", href: "/about-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Terms & Condition", href: "/terms-conditions" },
    { name: "Cancellation & Returns", href: "/cancellation-refund" },
    { name: "Shipping Info", href: "/shipping-delivery" },
    { name: "Track Using AWB", href: "/track-package" },
    { name: "Feedback ", href: "/feedback" },
    { name: "Articles", href: "/articles" },
  ];

  const getWhatsappMessage = () => {
    return encodeURIComponent(`Hello, I need help with my order`);
  };

  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 mt-10 pb-24 sm:pb-12">
      {/* 🔥 Reward Marquee */}
      <div className="bg-white text-black border-b border-gray-300 py-1 md:py-2 flex items-center">
        <Marquee gradient={false} speed={45} pauseOnHover>
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase font-semibold text-[11px] sm:text-[13px] lg:text-[15px] px-6 whitespace-nowrap"
            >
              <HandCoins className="text-yellow-800 mr-3" size={18} />
              REWARD POINTS FOR EACH SUCCESSFUL ORDER PLACED
            </span>
          ))}
        </Marquee>
      </div>

      {/* 🖤 Main Footer */}
      <div className="max-w-full text-center mt-10">
        {/* Logo */}
        <div className="group w-fit mx-auto mb-4">
  <img
    src="/aijim-uploads/aijim.svg"
    alt="AIJIM Logo"
    loading="lazy"
    onClick={() => navigate("/")}
    className="
      h-12 mx-auto cursor-pointer
      transition-transform duration-300 ease-out
      group-hover:scale-110
      active:scale-95
    "
  />
</div>



        {/* Tagline / Site Description */}
        
  {loading ? (
    <span className="animate-pulse text-gray-400">Loading...</span>
  ) : (
    <p className="text-sm p-1 text-gray-300 font-medium leading-relaxed max-w-90 mx-auto">
    { settings?.site_description || 'Aijim is built on the idea the clothing should feel premium without casting thousands.'}
  </p>
  )}
       

        <div className="flex justify-center gap-8 mt-10">
  {/* Instagram */}
  <a
    href="https://www.instagram.com/aijim.shop?igsh=ZWlnMXl1YzNkYjlx"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Visit Aijim on Instagram"
    className="
      group w-12 h-12 flex items-center justify-center rounded-full
      border border-gray-700 text-purple-500
      bg-transparent
      shadow-md
      transition-all duration-300
      hover:bg-gradient-to-br hover:from-pink-500 hover:via-purple-500 hover:to-orange-500
      hover:text-white hover:shadow-purple-500/40 hover:-translate-y-1 hover:scale-110
    "
  >
    <Instagram className="h-5 w-5" />
  </a>

  {/* Gmail */}
  <a
    href={`mailto:${settings?.contact_email}`}
    aria-label="Send Mail to Aijim"
    className="
      group w-12 h-12 flex items-center justify-center rounded-full
      border border-gray-700 text-red-500
      bg-transparent
      shadow-md
      transition-all duration-300
      hover:bg-red-500
      hover:text-white hover:shadow-red-500/40 hover:-translate-y-1 hover:scale-110
    "
  >
    <Mail className="h-5 w-5" />
  </a>

  {/* WhatsApp */}
  <a
    href={`https://wa.me/${settings?.contact_phone}?text=${getWhatsappMessage()}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Aijim on WhatsApp"
    className="
      group w-12 h-12 flex items-center justify-center rounded-full
      border border-gray-700 text-green-500
      bg-transparent
      shadow-md
      transition-all duration-300
      hover:bg-green-500
      hover:text-white hover:shadow-green-500/40 hover:-translate-y-1 hover:scale-110
    "
  >
    <Phone className="h-5 w-5" />
  </a>
</div>


        {/* Divider */}
        <div className="border-t border-gray-800 my-6 w-90 mx-1" />

        {/* Copyright */}
        <p className="text-xs md:text-sm lg:text-sm text-gray-300 font-medium tracking-wide">
  © {new Date().getFullYear()}{" "}
  <span className="
    font-semibold 
    text-white 
    bg-gradient-to-r from-yellow-300 via-white to-yellow-300
    bg-clip-text text-transparent
    animate-pulse
  ">
    {settings?.site_name || "AIJIM Clothing"}
  </span>{" "}
  ® — Made with{" "}
  <span className="inline-block animate-bounce">❤️</span>{" "}
  in{" "}
  <span className="text-yellow-400 font-semibold">India</span>.
</p>


        {/* Footer Links (centered row) */}
        <div className="flex flex-wrap justify-center items-center gap-x-7 gap-y-3 mt-10 px-2 pb-5">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="relative group text-[12px] sm:text-[15px] text-gray-300 hover:text-yellow-400 transition-colors duration-200"
            >
              {link.name}
              <span className="absolute left-0 bottom-[-4px] h-[2px] w-0 bg-yellow-400 rounded-full transition-all duration-600 group-hover:w-full"></span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
