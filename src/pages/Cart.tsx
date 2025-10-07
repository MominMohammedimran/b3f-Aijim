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
import { addInventoryUpdateListener } from '@/hooks/useProductInventory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [productStocks, setProductStocks] = React.useState<Record<string, Record<string, number>>>({});
  const [stocksLoading, setStocksLoading] = React.useState(true);

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

  // Fetch product stocks for all cart items
  const fetchProductStocks = React.useCallback(async () => {
    if (cartItems.length === 0) {
      setStocksLoading(false);
      return;
    }

    setStocksLoading(true);
    try {
      const stocks: Record<string, Record<string, number>> = {};
      
      for (const item of cartItems) {
        const { data: product, error } = await supabase.from('products')
          .select('variants')
          .eq('id', item.product_id)
          .single();

        if (!error && product?.variants && Array.isArray(product.variants)) {
          const productStockMap: Record<string, number> = {};
          product.variants.forEach((variant: any) => {
            if (variant && typeof variant === 'object' && variant.size && typeof variant.stock === 'number') {
              productStockMap[variant.size] = variant.stock;
            }
          });
          stocks[item.product_id] = productStockMap;
        }
      }
      
      setProductStocks(stocks);
    } catch (error) {
      console.error('Error fetching product stocks:', error);
    } finally {
      setStocksLoading(false);
    }
  }, [cartItems]);

  // Check if any item is out of stock
  const hasOutOfStockItems = React.useMemo(() => {
    return cartItems.some(item => {
      const productStock = productStocks[item.product_id];
      if (!productStock) return false;
      
      return item.sizes.some(sizeItem => {
        const availableStock = productStock[sizeItem.size] || 0;
        return sizeItem.quantity > availableStock;
      });
    });
  }, [cartItems, productStocks]);

  // Fetch stocks on component mount and when cart changes
  React.useEffect(() => {
    fetchProductStocks();
  }, [fetchProductStocks]);

  // Listen for inventory updates
  React.useEffect(() => {
    const unsubscribe = addInventoryUpdateListener(() => {
      fetchProductStocks();
    });
    
    return unsubscribe;
  }, [fetchProductStocks]);

  // Monitor orders table and clear cart when new orders are created
  React.useEffect(() => {
    if (!currentUser) return;

    let lastOrderCount = 0;
    
    const checkNewOrders = async () => {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && orders) {
          const currentOrderCount = orders.length;
          
          // If there are new orders since last check, clear cart
          if (lastOrderCount > 0 && currentOrderCount > lastOrderCount) {
            await clearCart();
            toast.success('Cart cleared - order placed successfully!');
          }
          
          lastOrderCount = currentOrderCount;
        }
      } catch (error) {
        console.error('Error checking orders:', error);
      }
    };

    // Initial check
    checkNewOrders();

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${currentUser.id}`
      }, () => {
        clearCart();
        toast.success('Cart cleared - order placed successfully!');
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, clearCart]);
 
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
         <CheckoutStepper currentStep={1} />
        <div className="flex justify-between items-center mt-5 mb-6">
          <h1 className="text-lg font-bold leading-relaxed ">Shopping Cart ({cartItems.length})</h1>
          <Button variant="outline" size="sm" className="px-2"onClick={clearCart}>Clear Cart</Button>
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
                        className={`h-16 w-16 object-fit rounded border shadow-sm transition-transform duration-200 hover:scale-125
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 border">
                      <h3 className="font-semibold text-sm text-white line-clamp-1 leading-relaxed ">{item.name}</h3>
                     

                      {/* Remove entire item button */}
                      <div className="mt-1 flex justify-between ">
                         <p className="text-sm  font-semibold text-white ">
                        {formatPrice(item.price)}
                      </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-800 rounded-none px-1 font-semibold text-xs bg-yellow-400 hover:text-gray-900 hover:bg-yellow-600"
                        >
                          
                          Remove 
                        </Button>
                      </div>
                    </div>
                  </div>

                   {/* Sizes Section with Enhanced Controls */}
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2 text-white">Sizes -</h4>
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

  const productStock = productStocks[item.product_id];
  const availableStock = productStock?.[sizeItem.size] || 0;
  const isOutOfStock = sizeItem.quantity > availableStock;

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
        maxStock={availableStock}
        onQuantityChange={() => {
          // optional toast or refresh trigger
        }}
      />
               <button
                onClick={() => removeSizeFromCart(item.product_id, sizeItem.size)}
               
                className="text-white font-bold px-1  ml-1 mr-1"
                title="Unselect"
              >
                <Trash2 size={18}/>
              </button>
              
        </div>      

        {/* Stock Status */}
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

          {/* Order Summary */}
           <div className="lg:col-span-1   ">
            {/* Order Summary */}
            <div className="bg-gray-800 p-6 shadow border sticky top-4">
              <h2 className="text-xl font-semibold text-center mb-4 text-white">Order Summary</h2>
              <div className="space-y-2 mb-4 text-white">
                <div className="flex justify-between">
                  <span className='font-semibold text-sm uppercase'>Subtotal</span>
                  <span className='font-semibold text-md'>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-sm uppercase">Shipping</span>
                  <span>{deliveryFee === 0 ? <span className="line-through text-sm uppercase font-semibold text-lg text-gray-200">Free Delivery</span> : `- ₹${deliveryFee}`}</span>
                </div>
                <div className="border-t pb-4">
                  <div className="flex justify-between font-semibold">
                    <span className="font-semibold uppercase text-sm">Total</span>
                    <span className="underline font-semibold text-md">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
             
              <div className='flex flex-col mt-2'>
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
                <div className=" sticky">
                <Button onClick={handleCheckout} className="w-full mb-3   m-auto text-lg uppercase text-center rounded-none hover:text-red-600 hover:bg-gray-100 font-bold">
                  Proceed to Checkout
                </Button>
                </div>
              )}

             
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Cart;