import React from 'react';

interface DualSidedIndicatorProps {
  isDualSided: boolean;
  activeProduct: string;
  productView: string;
  designComplete: { front: boolean; back: boolean };
}

const DualSidedIndicator: React.FC<DualSidedIndicatorProps> = ({
  isDualSided,
  activeProduct,
  productView,
  designComplete,
}) => {
  if (!isDualSided || activeProduct !== 'tshirt') return null;

  return (
    <div className="mt-2 text-center">
      <span className="text-blue-400 font-medium">
        Currently designing: {productView === 'front' ? 'Front Side' : 'Back Side'}
        {productView === 'front' && designComplete.front && ' ✅'}
        {productView === 'back' && designComplete.back && ' ✅'}
      </span>
    </div>
  );
};

export default DualSidedIndicator;
