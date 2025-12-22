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
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* Design Tools */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Add Elements</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={onOpenTextModal}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent border-gray-700 hover:bg-blue-500/10 hover:border-blue-500 text-gray-300 hover:text-white"
          >
            <Type className="h-6 w-6 text-blue-400" />
            <span className="text-xs">Text</span>
          </Button>
          <Button
            variant="outline"
            onClick={onOpenImageModal}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent border-gray-700 hover:bg-green-500/10 hover:border-green-500 text-gray-300 hover:text-white"
          >
            <Image className="h-6 w-6 text-green-400" />
            <span className="text-xs">Image</span>
          </Button>
          <Button
            variant="outline"
            onClick={onOpenEmojiModal}
            className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent border-gray-700 hover:bg-yellow-500/10 hover:border-yellow-500 text-gray-300 hover:text-white"
          >
            <Smile className="h-6 w-6 text-yellow-400" />
            <span className="text-xs">Emoji</span>
          </Button>
        </div>
      </div>

      {/* View Selector for T-Shirt */}
      {activeProduct === 'tshirt' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">View</h3>
          <div className="flex gap-2">
            <Button
              variant={productView === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('front')}
              className={cn(
                'flex-1',
                productView === 'front' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
              )}
            >
              Front
            </Button>
            <Button
              variant={productView === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewChange('back')}
              className={cn(
                'flex-1',
                productView === 'back' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
              )}
            >
              Back
            </Button>
          </div>
          
          {/* Dual-Sided Toggle */}
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-800 rounded-lg">
            <Label htmlFor="dual-sided" className="text-sm font-medium text-gray-300 cursor-pointer">
              Dual-Sided Print (+₹100)
            </Label>
            <Switch
              id="dual-sided"
              checked={isDualSided}
              onCheckedChange={onDualSidedChange}
            />
          </div>
        </div>
      )}

      {/* Size Selector for Photo Frame */}
      {activeProduct === 'photo_frame' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Frame Size</h3>
          <div className="grid grid-cols-1 gap-2">
            {['8X12inch', '12x16inch', '5x7 inch'].map((size) => (
              <Button
                key={size}
                variant={productView === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange(size)}
                className={cn(
                  'w-full',
                  productView === size 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                )}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Select Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {variants.map((variant) => {
            const isSelected = selectedSizes.includes(variant.size);
            const isOutOfStock = variant.stock <= 0;
            
            return (
              <Button
                key={variant.size}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => !isOutOfStock && onSizeToggle(variant.size)}
                disabled={isOutOfStock}
                className={cn(
                  'relative',
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800',
                  isOutOfStock && 'opacity-50 cursor-not-allowed'
                )}
              >
                {variant.size}
                {isOutOfStock && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1 rounded">
                    Out
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Quantity per Size */}
      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quantity</h3>
          <div className="space-y-2">
            {selectedSizes.map((size) => (
              <div key={size} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                <span className="font-medium text-white">{size}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChangeForSize(size, Math.max(1, (quantities[size] || 1) - 1))}
                    className="h-8 w-8 p-0 bg-transparent border-gray-600 text-white hover:bg-gray-700"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-white">{quantities[size] || 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChangeForSize(size, (quantities[size] || 1) + 1)}
                    className="h-8 w-8 p-0 bg-transparent border-gray-600 text-white hover:bg-gray-700"
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price & Add to Cart */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Total Price:</span>
          <span className="text-2xl font-bold text-blue-400">₹{getTotalPrice()}</span>
        </div>
        
        <Button
          onClick={onAddToCart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
          disabled={selectedSizes.length === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSidebar;
