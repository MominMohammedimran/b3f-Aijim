import React from 'react';
import CustomizationSidebar from '../design/CustomizationSidebar';

interface SidebarSectionProps {
  activeProduct: string;
  productView: string;
  onViewChange: (view: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  isDualSided: boolean;
  onDualSidedChange: (checked: boolean) => void;
  sizeInventory: any;
  products: any;
  setIsTextModalOpen: (isOpen: boolean) => void;
  setIsImageModalOpen: (isOpen: boolean) => void;
  setIsEmojiModalOpen: (isOpen: boolean) => void;
  handleAddToCart: () => void;
  validateDesign: () => boolean;
  getTotalPrice: () => number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  quantities: Record<string, number>;
  handleQuantityChange: (size: string, quantity: number) => void;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  activeProduct,
  productView,
  onViewChange,
  selectedSizes,
  onSizeToggle,
  isDualSided,
  onDualSidedChange,
  sizeInventory,
  products,
  setIsTextModalOpen,
  setIsImageModalOpen,
  setIsEmojiModalOpen,
  handleAddToCart,
  validateDesign,
  getTotalPrice,
  quantity,
  setQuantity,
  quantities,
  handleQuantityChange
}) => {
  return (
    <div className="md:col-span-1 space-y-6">
      <CustomizationSidebar
        activeProduct={activeProduct}
        productView={productView}
        onViewChange={onViewChange}
        selectedSizes={selectedSizes}
        onSizeToggle={onSizeToggle}
        isDualSided={isDualSided}
        onDualSidedChange={onDualSidedChange}
        sizeInventory={sizeInventory}
        products={products}
        onOpenTextModal={() => setIsTextModalOpen(true)}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenEmojiModal={() => setIsEmojiModalOpen(true)}
        onAddToCart={handleAddToCart}
        validateDesign={validateDesign}
        getTotalPrice={getTotalPrice}
        quantity={quantity}
        onQuantityChange={setQuantity}
        productId={activeProduct}
        upi_input=""
        quantities={quantities}
        onQuantityChangeForSize={handleQuantityChange}
      />
    </div>
  );
};

export default SidebarSection;
