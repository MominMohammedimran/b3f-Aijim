import React from 'react';

interface SizeGuideProps {
  size: string;
  getAijimSize: (size: string) => string;
  getSizeMeasurements: (size: string) => { chest: number; shoulder: number; length: number };
  onShowSizeGuide: () => void;
}

const ProductSizeGuide: React.FC<SizeGuideProps> = ({ size, getAijimSize, getSizeMeasurements, onShowSizeGuide }) => {
  const aijimSize = getAijimSize(size);
  const { chest, shoulder, length } = getSizeMeasurements(size);

  return (
    <div className="mt-4 text-[11px] text-gray-300 font-medium flex flex-col gap-1">
      <div className="flex items-center gap-5 ml-2">
        <p>
          Regular size: <span className="text-yellow-400 font-semibold">{size}</span>
          &nbsp;~ AIJIM size: <span className="text-yellow-400 font-semibold">{aijimSize}</span>
        </p>
        <p
          onClick={onShowSizeGuide}
          className="text-yellow-400 underline hover:text-yellow-300 text-[11px] font-semibold cursor-pointer"
        >
          Size chart →
        </p>
      </div>
      <div className="flex gap-2 p-0 mt-2 ml-2 rounded-md">
        <span className="text-gray-200 text-xs">Chest {chest}cm</span>
        <span className="text-gray-200 text-xs">Shoulder {shoulder}cm</span>
        <span className="text-gray-200 text-xs">Length {length}cm</span>
      </div>
      <div className="flex justify-between items-start gap-2 mt-1 px-0 text-center">
        <div className="flex-1 border-r border-yellow-400 p-1">
          <p className="text-yellow-400 font-semibold text-[12px]">Fit</p>
          <p className="text-gray-200 text-[10px] mt-1 font-medium">True to size</p>
        </div>
        <div className="flex-1 p-1">
          <p className="text-yellow-400 font-semibold text-[12px]">Fabric</p>
          <p className="text-gray-200 text-[10px] mt-1 font-medium">240 GSM , pure Cotton</p>
        </div>
        <div className="flex-1 border-l border-yellow-400 p-1">
          <p className="text-yellow-400 font-semibold text-[12px]">Feel</p>
          <p className="text-gray-200 text-[10px] mt-1 font-medium">Soft & Breathable</p>
        </div>
      </div>
    </div>
  );
};

export default ProductSizeGuide;
