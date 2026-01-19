import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DesignHeader: React.FC = () => {
  return (
    <div className="flex flex-cols items-center gap-10  mt-10 py-5">
      <nav className="flex items-center gap-2 pt-6 text-white text-sm sm:text-base">
          <Link to="/" className="opacity-70 hover:opacity-100 transition">
            Home
          </Link>
      
          <span className="opacity-60">/</span>
      
          <Link to="/products" className="opacity-70 hover:opacity-100 transition">
            Products
          </Link>
      
          <span className="opacity-60">/</span>
      
          <span className="font-semibold line-clamp-1">
          Design Your Product
          </span>
        </nav>
    
    </div>
  );
};

export default DesignHeader;
