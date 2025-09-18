
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, FileLock, RefreshCcw, AtSign, FileText, Truck, UsersRound, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-black text-white border-t border-gray-800">
      <div className="container-custom py-12">
        {/* Main Footer Content */}
        <div className="grid  grid-cols-1 md:grid-cols-2 gap-8 mb-8 sm:leading-snug md:leading-relaxed">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center ">
              <img src="/aijim-uploads/aijim.png" alt="Aijim Logo" className="w-9 h-7" />
              <h3 className="text-3xl font-semibold text-white font-sans bg-clip-text text-transparent font-mono">
                AIJIM
              </h3>
            </div>
            <p className="text-gray-200  font-medium text-m leading-relaxed   tracking-wide">
  Your trusted partner — <span className="font-semibold text-white">Aijim</span>. From timeless T-shirts to bold new releases, 
  we turn your ideas into standout styles with premium quality and fast delivery.
</p>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-200 font-bold">Follow us :</span>
              <Link 
                to="https://www.instagram.com/b3f_prints?igsh=aG9nNzVleDdqZXA" 
                className="text-red-600 hover:text-red-800 transition-colors transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 leading-relaxed  md:leading-relaxed tracking-wide">
            <h4 className="text-lg font-semibold text-white  mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
               <a href="/privacy-policy" className="text-sm font-normal sm:text-m md:text-m lg:text-m  flex items-center hover:text-yellow-400 transition-colors">
            <FileLock size={16} className="mr-2 group-hover:text-blue-400" />
            <span className="text-m font-medium ">Privacy Policy</span>
           </a>
        <a href="/terms-conditions" className="text-sm font-normal  sm:text-m md:text-m lg:text-m flex items-center  tracking-wide hover:text-yellow-400 transition-colors">
              <FileText size={16} className="mr-2 group-hover:text-blue-400" />

              <span className="text-m font-medium " >Terms Service</span>
          </a>
              <Link to="/cancellation-refund" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-200  font-medium text-sm sm:text-m md:text-m lg:text-m  hover:text-yellow-400 transition-colors  flex items-center group">
                <RefreshCcw size={14} className="mr-2 text-m " />
                Refund Policy
              </Link>
              <Link to="/shipping-delivery" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-200 font-medium text-sm sm:text-m md:text-m lg:text-m hover:text-yellow-400 transition-colors flex items-center group">
                <Truck size={14} className="mr-2" />
                Shipping Info
              </Link>
              <Link to="/about-us" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-200 font-medium text-sm sm:text-m md:text-m lg:text-m  hover:text-yellow-400 transition-colors  flex items-center group">
                <UsersRound size={14} className="mr-2" />
                About Us
              </Link>
              <Link to="/contact-us"  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-gray-200 font-medium text-sm sm:text-m md:text-m lg:text-m hover:text-yellow-400 transition-colors  flex items-center group ">
                <AtSign size={14} className="mr-2 " />
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Information
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 group">
                <MapPin className="text-blue-400 mt-1 flex-shrink-0 group-hover:text-blue-300 transition-colors" size={16} />
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    1/128 Opposite Ap Transco Colony<br />
                    Gooty Gooty RS, Ananthapur<br />
                    Andhra Pradesh 515402
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Mail className="text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors" size={16} />
                <a 
                  href="mailto:b3fprintingsolutions@gmail.com" 
                  className="text-gray-300 text-sm hover:text-blue-400 transition-colors"
                >
                  b3fprintingsolutions@gmail.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <Phone className="text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors" size={16} />
                <div className="text-gray-300 text-sm">
                  <a href="tel:7672080881" className="hover:text-blue-400 transition-colors">7672080881</a>
                  <span className="mx-2">|</span>
                  <a href="tel:9581319687" className="hover:text-blue-400 transition-colors">9581319687</a>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA 
            <div className="mt-6 p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg border border-green-700/30">
              <h5 className="font-semibold text-green-400 mb-2 flex items-center">
                <Phone size={16} className="mr-2" />
                Join Our WhatsApp Community
              </h5>
              <p className="text-gray-300 text-xs mb-3">
                Get exclusive updates, catalogs, and special offers.
              </p>
              <a 
                href="https://wa.me/917672080881?text=I%20want%20to%20join%20ur%20community%20please%20add%20me%20and%20send%20me%20catalogue."
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-md transition-colors transform hover:scale-105"
              >
                Join Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                  <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div> */}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center ">
            {/* Copyright */}
            <div className="text-center md:text-left pb-2">
              <p className="text-gray-200 text-m font-semibold flex items-center justify-center md:justify-start">
                © 2025 Aijim. Made with 
                <Heart size={14} className="text-red-500 mx-1" />
                in India
              </p>
            </div>
            
            {/* Back to Top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-gray-400 hover:text-white text-sm font-semibold flex items-center space-x-1 space-y-2 transition-colors group mb-4"
            >
              <span>Back to Top</span>
              <svg width="12" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-y-[-2px] transition-transform">
                <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
