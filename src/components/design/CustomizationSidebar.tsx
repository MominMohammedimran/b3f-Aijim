import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Type, Image, Smile, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SizeInventory {
  [productType: string]: {
    [size: string]: number;
  };
}

interface ProductVariant {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  variants: ProductVariant[];
}

interface CustomizationSidebarProps {
  activeProduct: string;
  productView: string;
  onViewChange: (view: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  isDualSided: boolean;
  onDualSidedChange: (checked: boolean) => void;
  sizeInventory: SizeInventory;
  products: Record<string, Product>;
  onOpenTextModal: () => void;
  onOpenImageModal: () => void;
  onOpenEmojiModal: () => void;
  onAddToCart: () => void;
  validateDesign: () => boolean;
  getTotalPrice: () => number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  productId: string;
  upi_input: string;
  quantities: Record<string, number>;
  onQuantityChangeForSize: (size: string, quantity: number) => void;
}

const CustomizationSidebar: React.FC<CustomizationSidebarProps> = ({
  activeProduct,
  productView,
  onViewChange,
  selectedSizes,
  onSizeToggle,
  isDualSided,
  onDualSidedChange,
  sizeInventory,
  products,
  onOpenTextModal,
  onOpenImageModal,
  onOpenEmojiModal,
  onAddToCart,
  validateDesign,
  getTotalPrice,
  quantity,
  onQuantityChange,
  productId,
  upi_input,
  quantities,
  onQuantityChangeForSize
}) => {
  const currentProduct = products[activeProduct];
  const variants = currentProduct?.variants || [];

  return (
    <div className="bg-gray-900 text-white border border-gray-700 rounded-2xl shadow-2xl p-6 space-y-8">
      {/* Design Tools */}
      <div className="space-y-4">
         <div className="grid grid-cols-3 gap-4">
          <ToolButton icon={Type} label="Text" color="#3b82f6" onClick={onOpenTextModal} />
          <ToolButton icon={Image} label="Image" color="#22c55e" onClick={onOpenImageModal} />
          <ToolButton icon={Smile} label="Emoji" color="#f59e0b" onClick={onOpenEmojiModal} />
        </div>
      </div>

      {/* View & Sizing */}
      <div className="space-y-6">
        {activeProduct === 'tshirt' && (
            <>
            <h3 className="text-lg font-semibold">View & Sizing</h3>
            <div className="flex gap-2 p-1 bg-gray-800 rounded-full">
                <ToggleButton label="Front" active={productView === 'front'} onClick={() => onViewChange('front')} />
                <ToggleButton label="Back" active={productView === 'back'} onClick={() => onViewChange('back')} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <Label htmlFor="dual-sided" className="text-sm font-medium cursor-pointer">Dual-Sided Print (+₹100)</Label>
                <Switch id="dual-sided" checked={isDualSided} onCheckedChange={onDualSidedChange} />
            </div>
            </>
        )}

        {activeProduct === 'photo_frame' && (
            <div>
                <h3 className="text-lg font-semibold mb-3">Frame Size</h3>
                <div className="grid grid-cols-1 gap-2">
                    {['8X12inch', '12x16inch', '5x7 inch'].map((size) => (
                        <Button
                            key={size}
                            variant={productView === size ? 'default' : 'outline'}
                            onClick={() => onViewChange(size)}
                            className={cn('w-full', productView === size ? 'bg-blue-600' : 'border-gray-600')}
                        >
                            {size}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <div>
            <h3 className="text-lg font-semibold mb-3">Select Sizes</h3>
            <div className="grid grid-cols-4 gap-3">
                {variants.map((variant: any) => (
                    <SizeButton 
                        key={variant.size} 
                        size={variant.size} 
                        isSelected={selectedSizes.includes(variant.size)} 
                        isOutOfStock={variant.stock <= 0} 
                        stock={variant.stock}
                        onClick={() => onSizeToggle(variant.size)} 
                    />
                ))}
            </div>
        </div>

        {selectedSizes.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="space-y-3">
                    {selectedSizes.map((size) => {
                        const variant = variants.find((v: any) => v.size === size);
                        return (
                            <QuantitySelector 
                                key={size} 
                                size={size} 
                                quantity={quantities[size] || 1} 
                                maxQuantity={variant?.stock || 99}
                                onQuantityChangeForSize={onQuantityChangeForSize} 
                            />
                        );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Actions & Price */}
      <div className="border-t border-gray-700 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-lg">Total:</span>
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-white">₹{getTotalPrice()}</span>
        </div>
        <Button 
            onClick={onAddToCart} 
            className="w-full text-lg font-bold py-6 bg-yellow-400 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300" 
            disabled={selectedSizes.length === 0}
        >
          <ShoppingCart className="mr-3" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

// Helper Components
const ToolButton = ({ icon: Icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1" style={{'--tool-color': color} as React.CSSProperties}>
    <Icon className="h-7 w-7" style={{ color }} />
    <span className="text-xs font-semibold tracking-wider">{label}</span>
  </button>
);

const ToggleButton = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={cn('flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300', active ? 'bg-blue-600 shadow-md' : 'bg-transparent hover:bg-gray-700')}>
    {label}
  </button>
);

const SizeButton = ({ size, isSelected, isOutOfStock, stock, onClick }: any) => (
    <button 
        onClick={onClick} 
        disabled={isOutOfStock} 
        className={cn(
            'relative rounded-lg p-2 text-sm font-semibold transition-all duration-300 transform disabled:opacity-30 disabled:cursor-not-allowed',
            isSelected ? 'bg-blue-600 shadow-lg scale-105' : 'bg-gray-800 hover:bg-gray-700 hover:scale-105',
            isOutOfStock && 'bg-red-900/50'
        )}
    >
        <span>{size}</span>
        {!isOutOfStock && stock > 0 && (
            <span className="block text-[10px] text-gray-400 mt-0.5">
                {stock} left
            </span>
        )}
        {isOutOfStock && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>}
    </button>
);

const QuantitySelector = ({ size, quantity, maxQuantity, onQuantityChangeForSize }: any) => {
    const availableStock = maxQuantity || 99;
    const isAtMax = quantity >= availableStock;
    
    return (
        <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
            <div className="flex flex-col">
                <span className="font-semibold text-sm">{size}</span>
                <span className="text-[10px] text-gray-400">{availableStock} available</span>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => onQuantityChangeForSize(size, Math.max(1, quantity - 1))} 
                    className="h-7 w-7 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                >
                    -
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button 
                    onClick={() => onQuantityChangeForSize(size, Math.min(availableStock, quantity + 1))} 
                    className={cn(
                        "h-7 w-7 rounded-full transition-colors duration-200",
                        isAtMax ? "bg-gray-700/50 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"
                    )}
                    disabled={isAtMax}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default CustomizationSidebar;
