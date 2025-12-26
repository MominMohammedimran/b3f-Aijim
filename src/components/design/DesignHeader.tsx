import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DesignHeader: React.FC = () => {
  return (
    <div className="flex flex-cols items-center gap-10  mt-10 py-5">
      <Link
        to="/"
        className="flex items-center text-white hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1" size={20} />
        <span className="text-xl  font-medium">Back</span>
      </Link>
      <h1 className="flex text-xl md:text-2xl font-bold text-white hidden">
        Design Your Product
      </h1>
    </div>
  );
};

export default DesignHeader;
