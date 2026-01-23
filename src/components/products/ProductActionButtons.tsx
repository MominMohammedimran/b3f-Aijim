import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart, SizeQuantity } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductActionButtonsProps {
  product: Product;
  selectedSizes?: string[];
  quantities?: Record<string, number>;
  className?: string;
  isInCart?: boolean;
  cartItemId?: string;
  currentQuantity?: number;
  size?: string;
  maxStock?: number;
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
}

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  product,
  selectedSizes = [],
  quantities = {},
  className = '',
  isInCart = false,
  cartItemId,
  currentQuantity = 1,
  size,
  maxStock,
  onQuantityChange,
  onRemove,
}) => {
  const { addToCart, updateCartItemQuantity } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    setIsAddingToCart(true);
    try {
      const sizesArray: SizeQuantity[] = selectedSizes.map((size) => ({
        size,
        quantity: quantities[size] || 1,
      }));

      const cartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        sizes: sizesArray,
        image: product.image,
        code:product.code,
        metadata: {},
      };

      await addToCart(cartItem);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };
 
  const handleQuantityIncrease = async () => {
    if (isInCart && cartItemId && size) {
      const newQuantity = currentQuantity + 1;
      // Check stock limit if maxStock is provided
      if (maxStock && newQuantity > maxStock) {
        toast.error(`Only ${maxStock} items available in stock`);
        return;
      }
      await updateCartItemQuantity(product.id, size, newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleQuantityDecrease = async () => {
    if (isInCart && cartItemId && size && currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      await updateCartItemQuantity(product.id, size, newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  if (isInCart) {
    return (
     <div className={`overflow-x-auto  w-15 whitespace-nowrap flex items-center gap-2 ${className}`}>
 
    <button onClick={handleQuantityDecrease}
    disabled={currentQuantity <= 1}
    className=" bg-gray-100 hover:bg-yellow-300 px-2 py-0 text-black font-extrabold rounded transition duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    −</button>
 

  <span className="px-2 py-0 rounded text-sm font-medium text-gray-200  text-center flex-shrink-0">
    {currentQuantity}
  </span>

  
    <button 
    onClick={handleQuantityIncrease}
    disabled={maxStock ? currentQuantity >= maxStock : false}
    className={`px-2 py-0 font-extrabold rounded transition duration-200 flex-shrink-0 ${
      maxStock && currentQuantity >= maxStock 
        ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
        : 'bg-gray-100 hover:bg-yellow-500 text-black'
    }`}
  >+</button>


  {onRemove && (
    <Button
      variant="destructive"
      onClick={onRemove}
      className="ml-4 text-red-700 text-sm px-3 flex-shrink-0"
    >
      Remove
    </Button>
  )}
</div>

    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className="w-full rounded-none bg-white hover:bg-white text-gray-900 font-semibold text-md lg:text-lg font-bold  px-3 py-2 flex items-center justify-center transition-all duration-200 mb-5 mt-5"
      >
        {isAddingToCart ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
};

export default ProductActionButtons;