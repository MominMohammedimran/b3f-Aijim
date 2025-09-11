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

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  

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
   navigate('/checkout');

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

  const finalTotal = totalPrice + deliveryFee;
 
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        onClick={() => redirect({ id: item.code, pd_name: item.name })}
                        className={`h-24 w-24 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 border">
                      <h3 className="font-semibold text-white ">{item.name}</h3>
                      <p className="text-sm  font-semibold text-white ">
                        {formatPrice(item.price)}
                      </p>

                      {/* Remove entire item button */}
                      <div className="mt-1 flex justify-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-800 font-semibold text-sm bg-yellow-400 hover:text-gray-900 hover:bg-yellow-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Item
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sizes Section with Enhanced Controls */}
                  <div className="mt-3">
                    <h4 className="text-md font-semibold mb-2 text-white">Sizes -</h4>
                    <div className="flex gap-3 overflow-x-auto py-1">
              {item.sizes.map((sizeItem) => {
  const fullProduct = {
    id: item.product_id,
    name: item.name,
    price: item.price,
    image: item.image || '/placeholder.svg',
    code:item.code,
    description: '',
    category: '',
  };

  return (
    <div
      key={sizeItem.size}
      className="flex flex-col gap-2 p-2 items-center bg-gradient-to-br from-black via-gray-900 to-black p-1 w-30 shadow-sm "
    >
      {/*<div className="flex justify-between w-full mb-1">
        <span className="bg-gray-800 flex justify-around p-2 text-white w-full py-1 text-center text-center text-xs font-semibold ">
          Size : {sizeItem.size}
           
        </span>
       
      </div>*/}
  <div className="flex justify-between w-full items-center gap-2">
     <span className=" flex justify-around text-white   text-center text-md font-semibold mr-4 ">
           {sizeItem.size}
           
        </span>

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
       <button
                onClick={() => removeSizeFromCart(item.product_id, sizeItem.size)}
               
                className="text-red-500 font-bold px-1  ml-1 mr-1"
                title="Unselect"
              >
                X
              </button>
              
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-gray-800 p-6 shadow border sticky top-4">
              <h2 className="text-xl font-semibold text-center mb-4 text-white">Order Summary</h2>
              <div className="space-y-2 mb-4 text-white">
                <div className="flex justify-between">
                  <span className='font-semibold uppercase'>Subtotal</span>
                  <span className='font-semibold text-lg'>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold uppercase">Shipping</span>
                  <span>{deliveryFee === 0 ? <span className="line-through uppercase font-semibold text-lg text-gray-200">Free Delivery</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="border-t pb-4">
                  <div className="flex justify-between font-semibold">
                    <span className="font-semibold uppercase ">Total</span>
                    <span className="underline font-semibold text-lg">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
              
              <div className='flex flex-col mt-2'>
              <Button onClick={handleCheckout} className="w-full mb-3  m-auto text-lg uppercase text-center rounded-none hover:text-red-600 hover:bg-gray-100 font-bold">
                Proceed to Checkout
              </Button>

             
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
