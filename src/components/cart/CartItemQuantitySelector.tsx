
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface CartItemQuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  disabled?: boolean;
}

const CartItemQuantitySelector: React.FC<CartItemQuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  disabled = false
}) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || quantity <= 1}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
        {quantity}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default CartItemQuantitySelector;
