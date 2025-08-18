import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import ProductActionButtons from '@/components/products/ProductActionButtons';
import CouponSection from '@/components/cart/CouponSection';
import RewardPointsSection from '@/components/cart/RewardPointsSection';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discount: number;
  } | null>(null);
  
  // Reward points state
  const [appliedPoints, setAppliedPoints] = React.useState<{
    points: number;
    discount: number;
  } | null>(null);
  
  localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
  localStorage.setItem('appliedPoints', JSON.stringify(appliedPoints));

  const seo = useSEO('/cart');

  const {
    cartItems,
    totalPrice,
    removeFromCart,
    removeSizeFromCart,
    clearCart,
    loading
  } = useCart();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/signin?redirectTo=/checkout');
      return;
    }
   navigate('/checkout', {
  state: {
    appliedCoupon,
    appliedPoints,
  }
});

  };

  const redirect = (product: { id: string, pd_name: string }) => {
    if (!currentUser) {
      navigate('/signin?redirectTo=/cart');
      return;
    }
    else if (!product.pd_name.toLowerCase().includes('custom printed')) {
      navigate(`/product/details/${product.id}`);
    }
  };

  const { settings: deliverySettings, loading: settingsLoading } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;

  // Handle coupon application
  const handleCouponApplied = (discount: number, code: string) => {
    setAppliedCoupon({ code, discount });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  // Handle reward points application
  const handlePointsApplied = (points: number, discount: number) => {
    setAppliedPoints({ points, discount });
  };

  const handlePointsRemoved = () => {
    setAppliedPoints(null);
  };

  // Calculate prices with coupon and reward points
  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + deliveryFee);

  if (loading) {
  return (
    <Layout>
        <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="container mx-auto px-4 py-8 mt-10 text-center">
        <div className="flex justify-center items-center h-64 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>

        {!currentUser && (
          <div className="mt-6">
            <p className="text-gray-300 mb-2">You are not signed in</p>
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

 if (cartItems.length === 0) {
  return (
    <Layout>
        <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="text-center py-16 space-y-4">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 pb-4">Add some items to get started!</p>

          <Link to="/" className='mt-6'>
            <Button>Continue Shopping</Button>
          </Link>

          {!currentUser && (
            <div className="mt-6 space-y-2">
              <p className="text-gray-500 text-lg mb-2">You are not signed in.</p>
              <Link to="/signin">
                <Button className='mt-2 text-xl bg-white text-gray-800' variant="outline">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

  return (
    <Layout>
        <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold leading-relaxed ">Shopping Cart ({cartItems.length})</h1>
          <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-800 p-6 shadow border">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        onClick={() => redirect({ id: item.product_id, pd_name: item.name })}
                        className={`h-24 w-24 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-white mb-2">
                        Price per item: {formatPrice(item.price)}
                      </p>

                      {/* Remove entire item button */}
                      <div className="mt-4 flex justify-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-800 font-semibold bg-yellow-400 hover:text-gray-900 hover:bg-yellow-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Item
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sizes Section with Enhanced Controls */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2 text-white">Sizes:</h4>
                    <div className="flex gap-3 overflow-x-auto py-1">
              {item.sizes.map((sizeItem) => {
  const fullProduct = {
    id: item.product_id,
    name: item.name,
    price: item.price,
    image: item.image || '/placeholder.svg',
    code: '',
    description: '',
    category: '',
  };

  return (
    <div
      key={sizeItem.size}
      className="flex flex-col items-center bg-gray-50 p-1 w-40 shadow-sm "
    >
      <div className="flex justify-between w-full mb-1">
        <span className="bg-gray-800 flex justify-around p-2 text-white w-full py-1 text-center text-center text-xs font-semibold ">
          Size : {sizeItem.size}
            <button
                onClick={() => removeFromCart(item.size)}
               
                className="text-white font-bold px-1 bg-red-500 mr-1  hover:text-red-400"
                title="Unselect"
              >
                X
              </button>
        </span>
       
      </div>

      <ProductActionButtons
        product={fullProduct}
        isInCart={true}
        cartItemId={item.id}
        currentQuantity={sizeItem.quantity}
        size={sizeItem.size}
        onQuantityChange={() => {
          // optional toast or refresh trigger
        }}
        
      />

      <div className="text-xl font-extrabold text-red-500">
        {formatPrice(item.price * sizeItem.quantity)}
      </div>
    </div>
  );
})}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon and Reward Points Section */}
          <div className="lg:col-span-1">
            <CouponSection 
              cartTotal={totalPrice}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon || undefined}
            />

            <RewardPointsSection
              cartTotal={totalPrice - couponDiscount}
              onPointsApplied={handlePointsApplied}
              onPointsRemoved={handlePointsRemoved}
              appliedPoints={appliedPoints || undefined}
            />

            {/* Order Summary */}
            <div className="bg-gray-800 p-6 shadow border sticky top-4">
              <h2 className="text-xl font-semibold text-center mb-4 text-white">Order Summary</h2>
              <div className="space-y-2 mb-4 text-white">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className='font-bold'>{formatPrice(totalPrice)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400 font-bold">
                    <span>Coupon Discount</span>
                    <span className='font-bold'>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {appliedPoints && (
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>Points Discount</span>
                    <span className='font-bold'>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{deliveryFee === 0 ? <span className="line-through font-bold text-gray-300">Free Delivery</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="underline font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full mb-3 rounded-none hover:text-red-500 font-bold">
                Proceed to Checkout
              </Button>

              <Link to="/">
                <Button className="w-full font-bold rounded-none  hover:text-red-500">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
