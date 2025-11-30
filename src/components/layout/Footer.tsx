import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Mail, HandCoins, Heart, Phone } from "lucide-react";
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
  ];
  const getWhatsappMessage = () => {
    return encodeURIComponent(`Hello, I need help with my order`);
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
          loading="lazy"
        />

        {/* Tagline */}
        <p className="text-sm p-1 text-gray-400 font-medium leading-relaxed max-w-90 mx-auto">
          Aijim is built on the idea that clothing should feel premium without
          costing thousands. Designed for everyday confidence, crafted with
          long-lasting materials and minimalist detail.
        </p>

        {/* Social Icons */}
        {/* Social Icons */}
        <div className="flex justify-center gap-5 mt-10">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/aijim.shop?igsh=ZWlnMXl1YzNkYjlx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Aijim on Instagram"
            className="
      w-10 h-10 flex items-center justify-center rounded-full
      bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500
      text-white shadow-lg shadow-pink-500/20
      hover:shadow-pink-500/40
      transition-all duration-300 hover:-translate-y-1 hover:scale-110
    "
          >
            <Instagram className="h-4 w-4" aria-label="Instagram" />
          </a>

          {/* Gmail */}
          <a
            href="mailto:aijim.official@gmail.com"
            aria-label="Send Mail to Aijim"
            className="
     w-10 h-10 flex items-center justify-center rounded-full
      bg-gradient-to-br from-red-600 to-red-400
      text-white shadow-lg shadow-red-500/20
      hover:shadow-red-500/40
      transition-all duration-300 hover:-translate-y-1 hover:scale-110
    "
          >
            <Mail className="h-4 w-4" aria-label="Email Aijim" />
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/917672080881?text=${getWhatsappMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Aijim on WhatsApp"
            className="
      w-10 h-10 flex items-center justify-center rounded-full
      bg-gradient-to-br from-green-600 to-green-500
      text-white shadow-lg shadow-green-500/20
      hover:shadow-green-500/40
      transition-all duration-300 hover:-translate-y-1 hover:scale-110
    "
          >
            <Phone className="h-4 w-4" aria-label="WhatsApp Aijim" />
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6 w-90 mx-1" />

        {/* Copyright */}
        <p className="text-xs md:text-md lg:text-md text-gray-400 font-medium">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">AIJIM Clothing</span> ® —
          Made with ❤️ in India.
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
