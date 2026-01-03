import React from 'react';
import { useCart } from '@/context/CartContext';

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

interface ProductVariant {
  size: string;
  stock: number;
}

interface SelectedSizesProps {
  productId: string;
  selectedSizes: SizeWithQuantity[];
  productVariants: ProductVariant[];
  onChangeQuantity: (size: string, quantity: number) => void;
}

const SelectedSizes: React.FC<SelectedSizesProps> = ({ productId, selectedSizes, productVariants, onChangeQuantity }) => {
  const { cartItems } = useCart();

  return (
    <div className="px-2 pt-4 border-t border-gray-700 mt-3">
      <h4 className="text-md font-semibold mb-3">Selected Sizes</h4>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {selectedSizes.map((sel) => {
          const variant = productVariants.find((v) => v.size === sel.size);
          const maxStock = variant?.stock ?? 0;
          const cartItem = cartItems.find((c) => c.product_id === productId);
          const cartSizeInfo = cartItem?.sizes.find((s) => s.size === sel.size);
          const inCartQty = cartSizeInfo?.quantity ?? 0;
          const isLocked = inCartQty >= maxStock;

          return (
            <div key={sel.size} className="w-auto p-2 border border-gray-500 bg-muted-background rounded-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold uppercase text-md mr-2">{sel.size}</span>
                <div className="flex items-center gap-2.5">
                  <button
                    disabled={sel.quantity <= 1 || isLocked}
                    onClick={() => onChangeQuantity(sel.size, sel.quantity - 1)}
                    className={`px-1.5 py-0 text-md font-bold rounded ${
                      sel.quantity <= 1 || isLocked
                        ? "text-gray-500 cursor-not-allowed opacity-50"
                        : "hover:bg-gray-200 hover:text-black text-white"
                    }`}>
                    −
                  </button>
                  <span className="text-gray-200 text-md font-semibold">{sel.quantity}</span>
                  <button
                    disabled={sel.quantity >= maxStock || isLocked}
                    onClick={() => onChangeQuantity(sel.size, sel.quantity + 1)}
                    className={`px-1.5 py-0 text-md font-bold rounded ${
                      sel.quantity >= maxStock || isLocked
                        ? "text-gray-500 cursor-not-allowed opacity-50"
                        : "hover:bg-gray-200 hover:text-black text-white"
                    }`}>
                    +
                  </button>
                </div>
              </div>
              {inCartQty > 0 && (
                <p className="text-[10px] text-center text-yellow-400 font-semibold">
                  In Cart - {inCartQty} Qty
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedSizes;
