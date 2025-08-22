import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  productId?: string;
  name: string;
  image?: string;
  price: number;
  sizes: SizeQuantity[];
  color?: string;
  code?:string;
  metadata?: any;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  removeSizeFromCart: (itemId: string, size: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, size: string, quantity: number) => Promise<void>;
  updateSizeQuantity: (itemId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getCartCount: () => number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const fetchCartItems = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const transformedCartItems = data
        ? data.map((item) => {
            // Safely parse sizes with proper type checking
            let parsedSizes: SizeQuantity[] = [];
            try {
              if (Array.isArray(item.sizes)) {
                parsedSizes = (item.sizes as unknown[]).map((size: any) => ({
                  size: size?.size || '',
                  quantity: size?.quantity || 0
                }));
              }
            } catch (e) {
              console.error('Error parsing cart item sizes:', e);
              parsedSizes = [];
            }

            return {
              id: item.id,
              product_id: item.product_id,
              name: item.name,
              image: item.image,
              price: item.price,
              code:item.code,
              sizes: parsedSizes,
              metadata: item.metadata,
            };
          })
        : [];

      setCartItems(transformedCartItems);
     
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCartItems();
  }, [currentUser, fetchCartItems]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data: existingCartItem, error: existingError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('product_id', item.product_id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingCartItem) {
        // Safely parse existing sizes
        let existingSizes: SizeQuantity[] = [];
        try {
          if (Array.isArray(existingCartItem.sizes)) {
            existingSizes = (existingCartItem.sizes as unknown[]).map((size: any) => ({
              size: size?.size || '',
              quantity: size?.quantity || 0
            }));
          }
        } catch (e) {
          console.error('Error parsing existing sizes:', e);
          existingSizes = [];
        }

        const newSizes = item.sizes.map(s => ({ ...s }));

        const mergedSizes = newSizes.map(newSize => {
          const existingSize = existingSizes.find(s => s.size === newSize.size);
          return existingSize
            ? { ...newSize, quantity: newSize.quantity + existingSize.quantity }
            : newSize;
        });

        existingSizes.forEach(existingSize => {
          if (!mergedSizes.find(s => s.size === existingSize.size)) {
            mergedSizes.push(existingSize);
          }
        });

        const { error } = await supabase
          .from('carts')
          .update({
            sizes: mergedSizes as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCartItem.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setCartItems(prev =>
          prev.map(cartItem =>
            cartItem.product_id === item.product_id
              ? { ...cartItem, sizes: mergedSizes }
              : cartItem
          )
        );
      } else {
        const { error } = await supabase
          .from('carts')
          .insert({
            user_id: currentUser.id,
            product_id: item.product_id,
            name: item.name,
            image: item.image,
            price: item.price,
            sizes: item.sizes as any,
            code:item.code,
            metadata: item.metadata,
          });

        if (error) throw error;

        setCartItems(prev => [
          ...prev,
          {
            id: item.product_id,
            product_id: item.product_id,
            code:item.code,
            name: item.name,
            image: item.image,
            price: item.price,
            sizes: item.sizes,
            metadata: item.metadata,
          },
        ]);
      }
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Find the cart item to get its database ID
      const cartItem = cartItems.find(item => item.product_id === productId);
      if (!cartItem) {
        toast.error('Item not found in cart');
        return;
      }

      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartItem.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== cartItem.id));
      toast.success('Item removed from cart!');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId: string, size: string, quantity: number) => {
    if (!currentUser) return;
    await updateSizeQuantity(itemId, size, quantity);
  };

  const updateSizeQuantity = async (itemId: string, size: string, quantity: number) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const cartItem = cartItems.find(item => item.product_id === itemId);
      if (!cartItem) return;

      const updatedSizes = cartItem.sizes.map(s => 
        s.size === size ? { ...s, quantity } : s
      ).filter(s => s.quantity > 0);

      if (updatedSizes.length === 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('carts')
        .update({
          sizes: updatedSizes as any,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', itemId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item => 
        item.product_id === itemId 
          ? { ...item, sizes: updatedSizes }
          : item
      ));

    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeSizeFromCart = async (itemId: string, size: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const cartItem = cartItems.find(item => item.product_id === itemId);
      if (!cartItem) return;

      const updatedSizes = cartItem.sizes.filter(s => s.size !== size);

      if (updatedSizes.length === 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('carts')
        .update({
          sizes: updatedSizes as any,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', itemId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems(prev => prev.map(item => 
        item.product_id === itemId 
          ? { ...item, sizes: updatedSizes }
          : item
      ));

    } catch (error) {
      console.error('Error removing size from cart:', error);
      toast.error('Failed to remove size');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setCartItems([]);
      toast.success('Cart cleared!');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.sizes.reduce(
        (sum, size) => sum + size.quantity * item.price,
        0
      );
      return total + itemTotal;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => {
      return total + item.sizes.reduce((sum, size) => sum + size.quantity, 0);
    }, 0);
  };

  const getCartCount = () => {
    return getTotalItems();
  };

  const totalPrice = getTotalPrice();

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    removeSizeFromCart,
    updateCartItemQuantity,
    updateSizeQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getCartCount,
    totalPrice,
    loading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
