import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Share, ChevronDown, ChevronUp,XCircle, Trash2 ,ShoppingCart} from 'lucide-react';

import {Link} from 'react-router-dom';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useCart } from '@/context/CartContext';
import { useProductInventory } from '@/hooks/useProductInventory';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import ProductPlaceOrder from './ProductPlaceOrder';
import ShareModal from './ShareModal';
import LiveViewingCounter from './LiveViewingCounter';
import AvailableCoupons from './AvailableCoupons';
import ProductDescription from './ProductDescription';
import { validatePincode } from '@/utils/pincodeService';

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

export interface ProductDetailsProps {
  product: Product;
  allowMultipleSizes?: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, allowMultipleSizes = true }) => {
  const [selectedSizes, setSelectedSizes] = useState<SizeWithQuantity[]>([]);
  const [removingSize, setRemovingSize] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const { cartItems, removeSizeFromCart } = useCart();
  const { loading: inventoryLoading } = useProductInventory(product.id);

  const productVariants = useMemo(() => {
    return Array.isArray(product.sizes)
      ? product.sizes.map((v) => ({
          size: String(v.size),
          stock: Number(v.stock),
        }))
      : [];
  }, [product.sizes]);

  const availableSizes = productVariants.map((v) => v.size);

  useEffect(() => {
    const cartItem = cartItems.find((c) => c.product_id === product.id);
    if (cartItem) {
      setSelectedSizes(cartItem.sizes.map((s) => ({ size: s.size, quantity: s.quantity })));
    }
  }, [cartItems, product.id]);

  const toggleSize = (size: string) => {
    const stock = productVariants.find((v) => v.size === size)?.stock ?? 0;
    const already = selectedSizes.some((s) => s.size === size);
    if (stock === 0 && !already) return;
    setSelectedSizes((prev) =>
      already ? prev.filter((s) => s.size !== size) : [...prev, { size, quantity: 1 }]
    );
  };
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const changeQuantity = (size: string, q: number) =>
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity: q } : s))
    );
    

  const removeSizeFromCartOnly = async (size: string) => {
    setRemovingSize(size);
    const cartItem = cartItems.find((c) => c.product_id === product.id);
    if (cartItem) {
      await removeSizeFromCart(cartItem.id, size);
      toast.success(`Size ${size} removed from cart`);
      setSelectedSizes((prev) => prev.filter((s) => s.size !== size));
    }
    setRemovingSize(null);
  };
const [pincode, setPincode] = useState("");
const [pincodeResult, setPincodeResult] = useState<{isServiceable: boolean; message: string} | null>(null);
const [pincodeChecked, setPincodeChecked] = useState(false);
const [loadingPincode, setLoadingPincode] = useState(false);

console.log(pincodeResult)
const checkPincode = async () => {
  if (!pincode) return;
  setLoadingPincode(true);
  setPincodeChecked(true);

  try {
    const result = await validatePincode(pincode);
    setPincodeResult({
      isServiceable: result.isServiceable,
      message: result.message
    });
  } catch (err) {
    console.error("Error checking pincode:", err);
    setPincodeResult({
      isServiceable: false,
      message: 'Unable to verify PIN code. Please try again.'
    });
  }

  setLoadingPincode(false);
};



  const totalPrice = selectedSizes.reduce((sum, s) => sum + s.quantity * product.price, 0);

  if (inventoryLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  
    


  return (
    <div className="relative bg-[#0b0b0b] text-white rounded-md p-1 px-2 md:p-3 shadow-lg">
      {/* Brand + Share */}
      <div className="flex items-center justify-between">
        <span className="text-m font-bold uppercase tracking-wide text-white">AIJIM</span>
        <Button variant="ghost" size="icon" onClick={() => setShowShareModal(true)}>
          <Share className="w-8 h-8 z-10 text-[15px] text-gray-100" />
        </Button>
      </div>

      {/* Name + Price */}
      <div className="flex flex-col mt-1 mb-2 sm:gap-5 justify-between items-start sm:items-start gap-2">
        <h2 className="text-2xl sm:text-3xl sm:text-left font-bold text-white">{product.name}</h2>
      <div className="flex items-center font-semibold gap-3">
  {product.originalPrice && product.originalPrice > product.price && (
    <span className="text-m font-bold text-gray-400 line-through">
      ₹{product.originalPrice}
    </span>
  )}
  <span className="text-2xl font-satoshi font-bold  text-gray-100">
    ₹{product.price}
  </span>
  {discountPercent > 0 && (
            <span className="text-xs bg-red-600 items-last text-white px-2 py-0.5  font-bold">
              {discountPercent}% OFF
            </span>
          )}
           
</div>

      </div>

      {/* Live Viewing Counter */}
      <LiveViewingCounter productId={product.id} />

      {/* Sizes */}
      <h4 className="text-lg font-semibold mt-3 mb-3">Select Size</h4>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {availableSizes.map((size) => {
          const variant = productVariants.find((v) => v.size === size);
          const stock = variant?.stock ?? 0;
          const selected = selectedSizes.some((s) => s.size === size);
          const inCart = cartItems.find((c) => c.product_id === product.id)?.sizes.some((s) => s.size === size);
          return (
            <div key={size} className="relative">
              {selected && (
                <div className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] px-1 rounded">✓</div>
              )}
              {inCart && (
                <div className="absolute top-1 right-5 text-[9px] bg-yellow-300 text-black px-1 rounded"></div>
              )}
              <button
                onClick={() => toggleSize(size)}
                disabled={stock === 0 && !selected}
                className={`w-full px-2 py-1 text-xs font-bold border text-center
                  ${
                    selected
                      ? 'border-gray-400 bg-white text-black'
                      : 'border-gray-400 hover:border-yellow-400'
                  }
                  ${stock === 0 && !selected ? 'opacity-90 text-white cursor-not-allowed' : ''}`}
              >
                {size}
                <div className="text-[8px] uppercase font-semibold mt-1">{stock ? `Stock ` : 'Sold Out'}</div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Sizes with Scroll */}
    {selectedSizes.length > 0 && (
  <div className="pt-4 border-t border-gray-700">
    <h4 className="text-md font-semibold mb-3">Selected Sizes</h4>

    <div className="flex gap-2 overflow-x-auto  scroll-smooth no-scrollbar">
      {selectedSizes.map((sel) => {
        const maxStock = productVariants.find((v) => v.size === sel.size)?.stock ?? 0;
        const cartItem = cartItems.find((c) => c.product_id === product.id);
        const cartSizeInfo = cartItem?.sizes.find((s) => s.size === sel.size);
        const inCartQty = cartSizeInfo?.quantity;
        const isRemoving = removingSize === sel.size;

        return (
          <div
            key={sel.size}
            className="min-w-[130px]  p-1 text-gray-100 border border-white  text-xs bg-gradient-to-br from-black via-gray-900 to-black  flex-shrink-0"
          >
            {/* Size & Remove 
            <div className="flex justify-between py-1 items-center mb-0">
              <span className="font-bold flex  uppercase justify-between p-2  w-full text-center bg-black text-white py-0.5">
                Size -
                 {' '} {sel.size}
                   <button
                onClick={() => toggleSize(sel.size)}
                disabled={isRemoving}
                className="text-white font-bold px-1 bg-red-500 mr-1  hover:text-red-400"
                title="Unselect"
              >
                X
              </button>
              </span>
            
            </div>
            */}

            {/* Quantity Controls */}
            <div className="flex items-center justify-between p-1  pb-0">
              <span className="font-bold uppercase text-lg ">{sel.size}</span>
              <button
                disabled={sel.quantity <= 1}
                onClick={() => changeQuantity(sel.size, sel.quantity - 1)}
                className="px-1.5 py-0 text-lg font-bold hover:bg-gray-200 hover:text-black text-white rounded transition duration-200"
              >
                −
              </button>
              <span className="text-gray-200 text-lg font-bold">{sel.quantity}</span>
              <button
                disabled={sel.quantity >= maxStock}
                onClick={() => changeQuantity(sel.size, sel.quantity + 1)}
                className="px-1.5 py-0 text-lg font-bold hover:bg-gray-200 hover:text-black text-white rounded transition duration-200"
              >
                +
              </button>
              {/*<button 
               onClick={() => toggleSize(sel.size)}
                disabled={isRemoving}
                className="text-white font-bold px-1 bg-red-500 mr-1  hover:text-red-400"
                title="Unselect"
                >
                  X
                  </button>*/}


            </div>

            {/* Cart Info & Delete */}
           
              {inCartQty && (
                <div className='flex justify-between items-center mt-1'>
                <span className="font-bold w-full uppercase   text-yellow-500   text-center   ">
                  In Cart - {inCartQty}
                </span>
                </div>
              )}
              {/*inCartQty && (
                <button
                  className="text-gray-100 bg-red-500 px-1 py-1 hover:text-gray-200 mr-1 "
                  title="Remove from cart"
                  onClick={() => removeSizeFromCartOnly(sel.size)}
                  disabled={isRemoving}
                >
                  {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={14} />}
                </button>
              )*/}
            
          </div>
        );
      })}
    </div>
  </div>
)}

      {/*total price */}
   
         {totalPrice> 0 && (
             <div className="flex justify-evenly mt-5 ">
            <span className="text-2xl  items-center text-white  font-SpaceGrotesk font-semibold">
              Total price &nbsp;: &nbsp; <span className='text-yellow-400  font-semibold underline'> ₹{totalPrice}</span>
            </span>
             </div>

          )}
  
       
 
      {/* Actions */}
      <div className=" mb-1 rounded-none  mt-1">
        <ProductActionButtons
          product={product}
          className="rounded-none"
          selectedSizes={selectedSizes.map((s) => s.size)}
          quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
        />
        
        {/* Place Order Button */}
        <div className="mt-1">
          <ProductPlaceOrder
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            variant="secondary"
            className="w-full rounded-none font-poppins font-semibold text-xl bg-gray-200 text-black hover:text-gray-700 hover:bg-gray-200"
          />
        </div>
      </div>

      {/* Delivery & Return Section */}
    {/* Delivery & Return Section */}
<div className="p-4 w-full bg-gradient-to-br from-black via-gray-900 to-black shadow-lg border border-gray-600 mt-4">
  <h3 className="text-lg font-semibold text-yellow-300 mb-3">Delivery & Returns</h3>
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <input
        type="text"
        maxLength={6} // restrict to 6 digits
        pattern="[0-9]*"
        inputMode="numeric"
        placeholder="pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} // allow only digits
        className="flex-1 px-3 py-1 w-full bg-gray-700 font-semibold border border-gray-600  text-white placeholder-gray-400  focus:border-transparent"
      />
      <button
  onClick={checkPincode}
  disabled={loadingPincode}
  className="px-4 py-1 bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
>
  {loadingPincode ? "Checking..." : "Check"}
</button>

    </div>

    {pincodeChecked && pincodeResult && (
      <div className="text-[13px] mt-2 ">
        <p className={`font-semibold ${pincodeResult.isServiceable ? 'text-green-400' : 'text-red-400'}`}>
          {pincodeResult.message}
        </p>
      </div>
    )}

    <div className="text-sm text-gray-300 mt-3 font-semibold">
      <p className="font-semibold">• Easy 7-day returns</p>
      <p className="font-semibold">• No cash on delivery </p>
    </div>
    <div className="border-t border-gray-600 pt-3">
      <Link
        to="/cancellation-refund"
        className="text-yellow-400 hover:text-yellow-300 underline text-sm font-semibold"
      >
        View Return Policy →
      </Link>
    </div>
  </div>
</div>

      {/* Available Coupons */}
      <AvailableCoupons productPrice={product.price} />

      {/* Description */}
        <ProductDescription desc={product.description}/>
      

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
