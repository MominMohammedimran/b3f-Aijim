import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Mail, HandCoins ,Heart,Phone} from "lucide-react";
import Marquee from "react-fast-marquee";

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { name: "Our Story", href: "/about-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Terms & Condition", href: "/terms-conditions" },
    { name: "Cancellation & Returns", href: "/cancellation-refund" },
    { name: "Shipping Info", href: "/shipping-delivery" },
    { name: "Track Orders", href: "/orders" },
  ];
 const getWhatsappMessage = () => {
    return encodeURIComponent(
      `Hello, I need help with my order` 
        
    );
  };
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 mt-10   pb-24 sm:pb-12">
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
      <div className="max-w-full  text-center mt-10">
        {/* Logo */}
        <img
          src="/aijim-uploads/aijim.svg"
          alt="AIJIM Logo"
          className="h-12 mx-auto cursor-pointer mb-4"
          onClick={() => navigate("/")}
        />

        {/* Tagline */}
        <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-90 mx-auto">
          Premium oversized streetwear that defines your style.  
          Comfort meets attitude in every piece we create.
        </p>

        {/* Social Icons */}
       {/* Social Icons */}
<div className="flex justify-center space-x-4 mt-8">

  {/* Instagram (Gradient) */}
  <a
    href="https://www.instagram.com/aijim.shop?igsh=ZWlnMXl1YzNkYjlx"
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 flex items-center justify-center rounded-full 
               bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500
               text-white shadow-md hover:shadow-pink-400/40 transform
               transition-all duration-300 hover:-translate-y-1 hover:scale-105"
  >
    <Instagram className="h-6 w-6" />
  </a>

  {/* Gmail */}
  <a
    href="mailto:aijim.official@gmail.com"
    className="w-12 h-12 flex items-center justify-center rounded-full 
               bg-gradient-to-br from-red-700 to-red-500
                text-white shadow-md hover:shadow-red-400/40
               transform transition-all duration-300 hover:-translate-y-1
               hover:scale-105"
  >
    <Mail className="h-6 w-6" />
  </a>

  {/* WhatsApp */}
  <a
    href={`https://wa.me/917672080888?text=${getWhatsappMessage()}`}
    target="_blank"
    rel="noopener noreferrer"
    className="w-12 h-12 flex items-center justify-center rounded-full 
               bg-green-600 text-white shadow-md hover:shadow-green-400/40
               transform transition-all duration-300 hover:-translate-y-1 
               hover:scale-105"
  >
    <Phone className="h-6 w-6 " />
  </a>

</div>


        {/* Divider */}
        <div className="border-t border-gray-800 my-6 w-90 mx-1" />

        {/* Copyright */}
        <p className="text-xs md:text-md lg:text-md text-gray-400 font-medium">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">AIJIM Clothing</span> ® — Made with ❤️ in India.
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
              className="text-[12px] sm:text-[15px] text-gray-300 hover:text-yellow-400 transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
