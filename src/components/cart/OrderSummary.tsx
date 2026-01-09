import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';

type OrderSummaryProps = {
  hasOutOfStockItems: boolean;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({ hasOutOfStockItems }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { totalPrice, totalPricePrinting } = useCart();
  const { settings: deliverySettings } = useDeliverySettings();

  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  const totalItemPrice = totalPrice + totalPricePrinting;
  const finalTotal = totalItemPrice + deliveryFee;

  const handleCheckout = () => {
    if (!currentUser) {
      navigate("/signin?redirectTo=/checkout");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-gray-800 p-6 shadow border sticky top-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-white">
          Order Summary
        </h2>
        <div className="space-y-2 mb-4 text-white">
          <div className="flex justify-between">
            <span className="font-semibold text-sm uppercase">Subtotal</span>
            <span className="font-semibold text-md">
              {formatPrice(totalItemPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-sm uppercase">Shipping</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="text-sm uppercase font-semibold text-lg text-gray-200">
                  Free Shipping
                </span>
              ) : (
                `+ ₹${deliveryFee}`
              )}
            </span>
          </div>
          <div className="border-t pb-4">
            <div className="flex justify-between font-semibold">
              <span className="font-semibold uppercase text-sm">Total</span>
              <span className="underline font-semibold text-md">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-2">
          {hasOutOfStockItems ? (
            <div className="text-center space-y-3">
              <p className="text-red-600 text-sm mb-2 font-semibold">
                Some items are out of stock
              </p>
              <Link to="/">
                <Button className="w-full text-lg uppercase text-center rounded-none font-bold">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="sticky">
              <Button
                onClick={handleCheckout}
                className="w-full mb-3 m-auto text-lg uppercase text-center rounded-none hover:text-red-600 hover:bg-gray-100 font-bold"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
