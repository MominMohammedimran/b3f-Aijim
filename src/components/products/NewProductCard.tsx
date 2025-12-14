import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface NewProductCardProps {
  product: Product;
}

const NewProductCard = ({ product }: NewProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product, size: string, quantity: number) => {
    const cartItem = {
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      code: product.code,
      sizes: [{ size, quantity }],
    };
    await addToCart(cartItem);
  };

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const totalStock = sizes.reduce((sum, s) => sum + (typeof s.stock === 'number' ? s.stock : 0), 0);
  const inStock = totalStock > 0;
  
  const discount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = discount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;
    
    // Find first available size
    const availableSize = sizes.find(s => s.stock > 0);
    if (availableSize) {
      await handleAddToCart(product, availableSize.size, 1);
      toast.success(`Added to cart: ${product.name} - ${availableSize.size}`);
    }
  };

  return (
    <div 
      className="group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/details/${product.code || product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              inStock 
                ? 'group-hover:scale-110' 
                : 'grayscale opacity-50'
            }`}
          />
          
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-none">
              -{discountPercent}%
            </div>
          )}
          
          {/* Stock Status */}
          <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-none ${
            inStock
              ? 'bg-brand-olive-green text-white'
              : 'bg-destructive text-white'
          }`}>
            {inStock ? 'IN STOCK' : 'SOLD OUT'}
          </div>

          {/* Hover Overlay with Quick Add */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered && inStock ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              onClick={handleQuickAdd}
              className="bg-accent hover:bg-accent/90 text-white font-bold rounded-none transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
              disabled={!inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              ADD TO CART
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-foreground">
              ₹{product.price}
            </span>
            {discount && (
              <span className="text-muted-foreground line-through text-sm">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Available Sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sizes.slice(0, 4).map((size) => (
                <span
                  key={size.size}
                  className={`text-xs px-2 py-1 border rounded-none ${
                    size.stock > 0
                      ? 'border-border text-muted-foreground'
                      : 'border-destructive/30 text-destructive/50 line-through'
                  }`}
                >
                  {size.size}
                </span>
              ))}
              {sizes.length > 4 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default NewProductCard;