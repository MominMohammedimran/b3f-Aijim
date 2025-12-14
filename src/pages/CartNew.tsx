import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
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

const CartNew = () => {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          {!currentUser && (
            <div className="mt-6">
              <p className="text-muted-foreground mb-2">You are not signed in</p>
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
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center py-16 space-y-6">
            <ShoppingBag className="h-32 w-32 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">YOUR CART IS EMPTY</h2>
            <p className="text-xl text-muted-foreground pb-6">Add some fire streetwear to get started!</p>

            <Link to="/" className='mt-8'>
              <Button size="lg" className="px-8 py-4 text-lg font-bold uppercase tracking-wider">
                CONTINUE SHOPPING
              </Button>
            </Link>

            {!currentUser && (
              <div className="mt-8 space-y-4">
                <p className="text-muted-foreground text-lg">You are not signed in.</p>
                <Link to="/signin">
                  <Button variant="outline" size="lg" className='text-lg font-bold uppercase'>
                    SIGN IN
                  </Button>
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
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-wider">
            SHOPPING CART ({cartItems.length})
          </h1>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="border-2 border-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider"
          >
            CLEAR CART
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow group"
                >
                  <div className="flex items-start space-x-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        onClick={() => redirect({ id: item.code, pd_name: item.name })}
                        className={`h-32 w-32 object-cover rounded border-2 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg
                           ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold uppercase tracking-wide mb-2">{item.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-4">
                        {formatPrice(item.price)}
                      </p>

                      {/* Remove entire item button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.product_id)}
                        className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        REMOVE ITEM
                      </Button>
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className="mt-6">
                    <h4 className="text-lg font-bold uppercase tracking-wider mb-4 text-primary">SIZES</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.sizes.map((sizeItem) => {
                        const fullProduct = {
                          id: item.product_id,
                          name: item.name,
                          price: item.price,
                          image: item.image || '/placeholder.svg',
                          code: item.code,
                          description: '',
                          category: '',
                        };

                        const productStock = productStocks[item.product_id];
                        const availableStock = productStock?.[sizeItem.size] || 0;
                        const isOutOfStock = sizeItem.quantity > availableStock;

                        return (
                          <div
                            key={sizeItem.size}
                            className="bg-secondary rounded-lg p-4 border-2 border-border hover:border-primary transition-all duration-300"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-lg font-bold uppercase tracking-wider">
                                {sizeItem.size}
                              </span>
                              <button
                                onClick={() => removeSizeFromCart(item.product_id, sizeItem.size)}
                                className="text-destructive hover:text-destructive/80 font-bold text-lg"
                                title="Remove Size"
                              >
                                ×
                              </button>
                            </div>

                            <ProductActionButtons
                              product={fullProduct}
                              isInCart={true}
                              cartItemId={item.id}
                              currentQuantity={sizeItem.quantity}
                              size={sizeItem.size}
                              maxStock={availableStock}
                              onQuantityChange={() => {}}
                            />

                            {/* Stock Status */}
                            {isOutOfStock && (
                              <div className="mt-3 text-center">
                                <span className="text-destructive text-sm font-bold uppercase tracking-wider bg-destructive/10 px-3 py-1 rounded">
                                  SOLD OUT
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

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow sticky top-24">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-6">ORDER SUMMARY</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className='font-bold text-sm uppercase tracking-wider'>SUBTOTAL</span>
                  <span className='font-bold text-lg'>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-wider">SHIPPING</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t-2 border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase tracking-wider">TOTAL</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
              
              <div className='flex flex-col space-y-4'>
                {hasOutOfStockItems ? (
                  <div className="text-center space-y-4">
                    <p className="text-destructive text-sm font-bold uppercase tracking-wider">
                      SOME ITEMS ARE OUT OF STOCK
                    </p>
                    <Link to="/">
                      <Button className="w-full text-lg uppercase font-bold tracking-wider py-4">
                        CONTINUE SHOPPING
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full text-lg uppercase font-bold tracking-wider py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    PROCEED TO CHECKOUT
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Bottom Summary */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border p-4 z-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold uppercase tracking-wider">TOTAL</span>
              <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
            </div>
            {hasOutOfStockItems ? (
              <Link to="/">
                <Button className="w-full text-lg uppercase font-bold tracking-wider">
                  CONTINUE SHOPPING
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={handleCheckout} 
                className="w-full text-lg uppercase font-bold tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                PROCEED TO CHECKOUT
              </Button>
            )}
          </div>
        </div>
        
        {/* Spacer for mobile bottom bar */}
        <div className="lg:hidden h-32"></div>
      </div>
    </Layout>
  );
};

export default CartNew;