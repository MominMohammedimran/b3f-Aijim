
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCustomizerProps {
  product: Product;
}

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ product }) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        const newSizes = prev.filter(s => s !== size);
        const newQuantities = { ...quantities };
        delete newQuantities[size];
        setQuantities(newQuantities);
        return newSizes;
      } else {
        const newQuantities = { ...quantities, [size]: 1 };
        setQuantities(newQuantities);
        return [...prev, size];
      }
    });
  };

  const handleQuantityChange = (size: string, newQuantity: number) => {
    const variant = (product.variants || product.sizes)?.find(v => v.size === size);
    const maxStock = Number(variant?.stock || 50);
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantities(prev => ({ ...prev, [size]: newQuantity }));
    } else if (newQuantity > maxStock) {
      toast.error(`Maximum ${maxStock} items available for size ${size}`);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Please sign in to add to cart.');
      navigate('/signin?redirectTo=/products');
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size.');
      return;
    }

    try {
      // Convert to sizes array format
      const sizesArray = selectedSizes.map(size => ({
        size,
        quantity: quantities[size] || 1
      }));

      const cartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        sizes: sizesArray,
        image: product.image,
        metadata: {},
      };

      await addToCart(cartItem);

      const totalItems = selectedSizes.reduce((sum, size) => sum + (quantities[size] || 1), 0);
      toast.success(`Added ${totalItems} items to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart.');
    }
  };

  const getTotalPrice = () => {
    return selectedSizes.reduce((sum, size) => sum + (product.price * (quantities[size] || 1)), 0);
  };

  const getTotalQuantity = () => {
    return selectedSizes.reduce((sum, size) => sum + (quantities[size] || 1), 0);
  };

  // Get available sizes from product variants or sizes
  const getAvailableSizes = () => {
    const variants = product.variants || product.sizes;
    if (variants && variants.length > 0) {
      return variants.map(v => v.size);
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Customize Your {product.name}
      </h1>
      
      {/* Size & Quantity Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Select Sizes & Quantities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {getAvailableSizes().map(size => (
            <div key={size} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">{size}</label>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="w-4 h-4"
                />
              </div>
              {selectedSizes.includes(size) && (
                <div className="mt-2">
                  <label className="text-sm text-gray-600">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantities[size] || 1}
                    onChange={(e) => handleQuantityChange(size, parseInt(e.target.value))}
                    className="w-full mt-1 p-1 border rounded text-center"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      {selectedSizes.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <p>Total Items: {getTotalQuantity()}</p>
          <p className="text-xl font-bold">Total Price: ₹{getTotalPrice().toFixed(2)}</p>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="text-center">
        <Button
          onClick={handleAddToCart}
          className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700"
          disabled={selectedSizes.length === 0 || getTotalQuantity() < 1}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {selectedSizes.length > 0 
            ? `Add ${getTotalQuantity()} Items - ₹${getTotalPrice().toFixed(2)}`
            : 'Select Sizes to Add to Cart'
          }
        </Button>
      </div>
    </div>
  );
};

export default ProductCustomizer;
