import React from "react";
import { Link,useNavigate } from "react-router-dom";
import  {motion }from 'framer-motion';
import { Instagram, Mail, Facebook, Twitter,Truck,HandCoins,Download } from "lucide-react";
import Marquee from "react-fast-marquee"
import{usePWAInstall} from '@/hooks/usePWAInstall'
import InstallAppButton from '../InstallAppButton'
const Footer = () => {
  const navigate=useNavigate();
  const footerSections = [
    {
      title: "ABOUT",
      links: [
        { name: "Our Story", href: "/about-us" },
     //   { name: "Privacy Policy", href: "/privacy-policy" },
         { name: "Contact Us", href: "/contact-us" },
      ],
    },
    {
      title: "HELP",
      links: [
        { name: "Terms & Condition", href: "/terms-conditions" },
        { name: "Cancellation & Returns", href: "/cancellation-refund" },
        //{ name: "Shipping Info", href: "/shipping-delivery" },
       // {name:"Track Orders",href:"/orders"},
      ],
    },
    
    
  ];
 

  return (
    <footer className="bg-black w-full not-italic h-auto mt-3 mb-20 pb-5 text-gray-300 border-t border-gray-800">
      {/* 🔥 Marquee Bar */}
       <div className="bg-white h-6  pt-1 pb-1  md:h-8 md:pt-3 md:pb-3 flex items-center ">
                    <Marquee gradient={false} speed={50} pauseOnHover={true} className="w-full">
                      {Array.from({ length:22 }).map((_, i) => (
                        <span key={i} className="flex items-center uppercase text-black font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] px-4 whitespace-nowrap">
                             | <HandCoins size={20} className="ml-10 mr-4 text-yellow-900"/>REWARD POINTS FOR EACH SUCCESSFUL ORDER PLACED   
                        </span>
                      ))}
                    </Marquee>
                  </div>
      

      <div className="w-full mx-auto px-3 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-5 py-3">
          {/* Brand Section */}
          <div >
            <img
              src="/aijim-uploads/aijim.svg"
              alt="AIJIM Logo"
              className="h-12 m-auto mb-4 pr-4"
              onClick={()=>{
              navigate("/");
              }}
            />
            <p className="text-sm w-full  font-medium items-center justify-center leading-relaxed text-foreground">
              Premium oversized streetwear that defines your style.  
              Comfort meets attitude in every piece we create.
            </p>

            {/* Social Icons */}
             <div className="flex space-x-4 mt-6 items-center justify-center">
              <a
                href="https://www.instagram.com/aijim.shop?igsh=ZWlnMXl1YzNkYjlx"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-yellow-500 text-white hover:text-black transition-all duration-300 transform hover:-translate-y-1"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="mailto:aijim.official@gmail.com"
                className="p-2 rounded-full bg-gray-800 hover:bg-yellow-500 text-white hover:text-black transition-all duration-300 transform hover:-translate-y-1"
              >
                <Mail className="h-5 w-5" />
              </a>
            
            {/*<InstallAppButton/>*/}
            
            </div>
            <div className="border-b w-full border-gray-800 text-center  mt-5 ">
          <p className="w-full text-[12px] lg:text-[18px] text-white font-medium">
            © {new Date().getFullYear()} <span className="font-semibold">AIJIM</span> ® —  
            Made with love in India
          </p>
        </div>

          </div>

           

          {/* Quick Links */}
          
    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mt-8 px-4 sm:px-6">
      {footerSections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="group relative flex flex-col items-center space-y-1 text-center sm:text-left"
        >
          {/* --- Section Title --- */}
          <h3 className="text-lg sm:text-xl font-semiboldbold tracking-[3px] uppercase text-ceter text-white/95 transition-all duration-300 group-hover:text-yellow-400">
            {section.title}
          </h3>

          {/* --- Accent Line --- */}
          <div className="h-[1.5px] w-16 bg-gradient-to-r from-yellow-500 to-transparent mb-2 rounded-full"></div>

          {/* --- Section Links --- */}
          <ul className="flex flex-col items-center pt-2 space-y-2  mt-2 w-full">
            {section.links.map((link: any) => (
              <li key={link.name} className="w-full">
                <Link
                  to={link.href}
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="relative inline-block text-[15px] font-medium text-white/80 hover:text-yellow-400 transition-all duration-300 group/link"
                >
                  {link.name}
                  <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-yellow-400 transition-all duration-300 group-hover/link:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* --- Divider between columns --- */}
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-[1px] bg-gradient-to-b from-transparent via-gray-700 to-transparent"></div>
        </motion.div>
      ))}
    </div>



          
            
        

        {/* Bottom Bar */}
       
        </div>
        
      </div>

    
    </footer>
  );
};

export default Footer;