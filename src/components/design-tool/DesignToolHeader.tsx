import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductSelector from '../design/ProductSelector';

interface DesignToolHeaderProps {
  products: any;
  activeProduct: string;
  isDualSided: boolean;
  onProductSelect: (productId: string) => void;
}

const DesignToolHeader: React.FC<DesignToolHeaderProps> = ({
  products,
  activeProduct,
  isDualSided,
  onProductSelect,
}) => {
  return (
    <>
      <div className="flex flex-cols items-center gap-10 mb-6 mt-10">
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1" size={20} />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="flex text-xl  md:text-2xl font-bold text-gray-800">Design Your Product</h1>
      </div>
      <ProductSelector
        products={products}
        activeProduct={activeProduct}
        isDualSided={isDualSided}
        onProductSelect={onProductSelect}
      />
    </>
  );
};

export default DesignToolHeader;
