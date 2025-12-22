
interface DesignViewProps {
  isDualSided: boolean;
  activeProduct: string;
  productView: string;
  designComplete: {
    front: boolean;
    back: boolean;
  };
}

const DesignView: React.FC<DesignViewProps> = ({
  isDualSided,
  activeProduct,
  productView,
  designComplete,
}) => {
  if (!isDualSided || activeProduct !== 'tshirt') {
    return null;
  }

  return (
    <div className="mt-2 text-center">
      <span className="text-blue-600 font-medium">
        Currently designing: {productView === 'front' ? 'Front Side' : 'Back Side'}
        {productView === 'front' && designComplete.front && ' ✅'}
        {productView === 'back' && designComplete.back && ' ✅'}
      </span>
    </div>
  );
};

export default DesignView;
