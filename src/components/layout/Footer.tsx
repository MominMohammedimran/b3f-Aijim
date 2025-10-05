import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Facebook, Twitter,Truck,HandCoins } from "lucide-react";
import Marquee from "react-fast-marquee"

const Footer = () => {
  const footerSections = [
    {
      title: "ABOUT",
      links: [
        { name: "Our Story", href: "/about-us" },
        { name: "Privacy Policy", href: "/privacy-policy" },
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
    {
      title: "CONTACT",
      links: [
        { name: "Customer Care", href: "/contact-us" },
      
      ],
    },
  ];

  return (
    <footer className="bg-gray-950 h-auto text-gray-300 border-t border-gray-800">
      {/* 🔥 Marquee Bar */}
       <div className="bg-white h-6  pt-1 pb-1  md:h-8 md:pt-3 md:pb-3 flex items-center ">
                    <Marquee gradient={false} speed={50} pauseOnHover={true} className="w-full">
                      {Array.from({ length:22 }).map((_, i) => (
                        <span key={i} className="flex items-center uppercase text-black font-semibold text-[11px] sm:text-[12px] md:text-[13px] lg:text-[15px] px-4 whitespace-nowrap">
                             | <HandCoins size={20} className="ml-10 mr-4 "/>REWARD POINTS FOR EACH SUCCESSFUL ORDER PLACED   
                        </span>
                      ))}
                    </Marquee>
                  </div>
      

      <div className="w-full mx-auto px-6 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-3">
          {/* Brand Section */}
          <div>
            <img
              src="/aijim-uploads/aijim.svg"
              alt="AIJIM Logo"
              className="h-12 mb-4"
            />
            <p className="text-sm font-medium italic leading-tight text-foreground">
              Premium oversized streetwear that defines your style.  
              Comfort meets attitude in every piece we create.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              {[Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full bg-gray-700 hover:bg-accent hover:text-white transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
           <div className="border-b w-full border-gray-800 text-center  ">
          <p className="w-full text-[12px] text-white font-medium">
            © {new Date().getFullYear()} <span className="font-semibold">AIJIM</span> ® —  
            Made with love in India
          </p>
        </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 lg:grid-cols-3">
          {footerSections.map((section) => (
           
            <div key={section.title} >
              <h3 className="text-sm font-semibold underline cursor-text uppercase tracking-widest text-white mb-0">
                {section.title}
              </h3>
              <ul className="space-y-0">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      onClick={()=>{
                        window.scrollTop({
                          top:0,
                          behavior:'smooth'
                        })
                      }}
                      className="text-xs text-white/90 font-semibold italic hover:text-white transition-colors"
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