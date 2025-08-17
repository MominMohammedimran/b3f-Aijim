
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, SizeQuantity } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface CartItemActionsProps {
  item: CartItem;
  size: SizeQuantity;
}

const CartItemActions: React.FC<CartItemActionsProps> = ({ item, size }) => {
  const { updateCartItemQuantity, removeSizeFromCart } = useCart();

  const handleIncreaseQuantity = async () => {
    await updateCartItemQuantity(item.id, size.size, size.quantity + 1);
  };

  const handleDecreaseQuantity = async () => {
    if (size.quantity > 1) {
      await updateCartItemQuantity(item.id, size.size, size.quantity - 1);
    }
  };

  const handleRemoveSize = async () => {
    await removeSizeFromCart(item.id, size.size);
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={handleDecreaseQuantity}
          disabled={size.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
          {size.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={handleIncreaseQuantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveSize}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItemActions;
