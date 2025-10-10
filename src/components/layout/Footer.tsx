import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { Instagram, Mail, Facebook, Twitter,Truck,HandCoins } from "lucide-react";
import Marquee from "react-fast-marquee"

const Footer = () => {
  const footerSections = [
    {
      title: "ABOUT",
      links: [
        { name: "Our Story", href: "/about-us" },
        { name: "Privacy Policy", href: "/privacy-policy" },
         { name: "Customer Care", href: "/contact-us" },
      ],
    },
    {
      title: "HELP",
      links: [
        { name: "Terms & Condition", href: "/terms-conditions" },
        { name: "Cancellation & Returns", href: "/cancellation-refund" },
        { name: "Shipping Info", href: "/shipping-delivery" },
        {name:"Track Orders",href:"/orders"},
      ],
    },
    
    
  ];
  const navigate=useNavigate();

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
            </div>
            <div className="border-b w-full border-gray-800 text-center  mt-5 ">
          <p className="w-full text-[12px] lg:text-[18px] text-white font-medium">
            © {new Date().getFullYear()} <span className="font-semibold">AIJIM</span> ® —  
            Made with love in India
          </p>
        </div>
          </div>
           

          {/* Quick Links */}
          <div className="grid grid-cols-2 ">
          {footerSections.map((section) => (
           
            <div key={section.title} >
              <h3 className="text-sm lg:text-md font-semibold underline cursor-text uppercase tracking-widest text-white mb-0">
                {section.title}
              </h3>
              <ul className="space-y-0">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      onClick={()=>{
                        window.scrollTo({
                          top:0,
                          behavior:'smooth'
                        })
                      }}
                      className="text-xs lg:text-sm text-white/90 font-semibold  hover:text-yellow-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          
          ))}
          </div>
          

          {/* Newsletter */}
          
            
        

        {/* Bottom Bar */}
       
        </div>
        
      </div>

    
    </footer>
  );
};

export default Footer;