import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import ProductActionButtons from '@/components/products/ProductActionButtons';

type CartItemProps = {
  cartItems: any[];
  productStocks: Record<string, Record<string, number>>;
};

const CartItems: React.FC<CartItemProps> = ({ cartItems, productStocks }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { removeFromCart, removeSizeFromCart } = useCart();

  const redirect = (product: { id: string; pd_name: string; code: string }) => {
    if (!currentUser) {
      navigate("/signin?redirectTo=/cart");
      return;
    } else if (!product.pd_name.toLowerCase().includes("custom printed")) {
      navigate(`/product/${product.code}`);
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-gray-800 p-6 shadow border">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  onClick={() =>
                    redirect({
                      id: item.code,
                      pd_name: item.name,
                      code: item.code,
                    })
                  }
                  className={`h-16 w-14 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125 ${
                    !item.name.toLowerCase().includes("custom printed")
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white line-clamp-1 leading-relaxed">
                  {item.name}
                </h3>

                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm font-semibold text-white">
                    {formatPrice(item.price)}
                  </p>
                  <p
                    onClick={() => removeFromCart(item.product_id)}
                    className="cursor-pointer font-semibold text-xs underline text-yellow-400 bg-none hover:text-red-400"
                  >
                    Remove
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-2 text-white">Sizes -</h4>
              <div className="flex gap-3 overflow-x-auto py-1">
                {item.sizes.map((sizeItem: any) => {
                  const fullProduct = {
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    image: item.image || "/placeholder.svg",
                    code: item.code,
                    description: "",
                    category: "",
                  };

                  const productStock = productStocks[item.product_id];
                  const availableStock = productStock?.[sizeItem.size] || 0;
                  const isOutOfStock = sizeItem.quantity > availableStock;

                  return (
                    <div
                      key={sizeItem.size}
                      className="flex flex-col gap-2 p-2 items-center bg-gradient-to-br from-black via-gray-900 to-black w-30 shadow-sm"
                    >
                      <div className="flex justify-between w-full items-center gap-2">
                        <span className="flex justify-around text-white text-center text-md font-semibold mr-4">
                          {sizeItem.size}
                        </span>

                        <ProductActionButtons
                          product={fullProduct}
                          isInCart={true}
                          cartItemId={item.id}
                          currentQuantity={sizeItem.quantity}
                          size={sizeItem.size}
                          maxStock={availableStock}
                          onQuantityChange={() => {}}
                        />
                        <button
                          onClick={() =>
                            removeSizeFromCart(item.product_id, sizeItem.size)
                          }
                          className="text-white font-bold px-1 ml-1 mr-1"
                          title="Unselect"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {isOutOfStock && (
                        <div className="w-full text-center">
                          <span className="text-red-600 text-xs font-semibold bg-red-100/10 px-2 py-1 rounded">
                            Sold
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItems;
