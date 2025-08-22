import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Share, XCircle, Trash2 ,ShoppingCart} from 'lucide-react';

import {Link} from 'react-router-dom';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useCart } from '@/context/CartContext';
import { useProductInventory } from '@/hooks/useProductInventory';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import ShareModal from './ShareModal';
import LiveViewingCounter from './LiveViewingCounter';

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
const [pincodeAvailable, setPincodeAvailable] = useState<boolean | null>(null);
const [pincodeMessage, setPincodeMessage] = useState(false);

const serviceablePincodes = ["515402", "100006", "500001", "600045"];

const checkPincode = () => {
  setPincodeMessage(true);
  if (serviceablePincodes.includes(pincode)) {
    setPincodeAvailable(true);
  } else {
    setPincodeAvailable(false);
  }
};


  const totalPrice = selectedSizes.reduce((sum, s) => sum + s.quantity * product.price, 0);

  if (inventoryLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

    function renderDescription(desc: string) {
  return desc.split('\n').map((line, i) => {
    const [heading, ...rest] = line.split(':');
    return (
      <p key={i} className="text-xs sm:text-base leading-relaxed mb-1">
        <span className="font-geist font-bold text-white">{heading.trim()}</span>
        {rest.length > 0 && (
          <span className="text-gray-300 font-neue-montreal text-justify tracking-wide  lowercase">: {rest.join(':').trim()}</span>
        )}
      </p>
    );
  });
}


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
                  ${stock === 0 && !selected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {size}
                <div className="text-[8px] font-bold mt-1">{stock ? `Stock ` : 'Sold Out'}</div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Sizes with Scroll */}
    {selectedSizes.length > 0 && (
  <div className="pt-4 border-t border-gray-700">
    <h4 className="text-sm font-semibold mb-3">Selected Sizes</h4>

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
            className="min-w-[110px] bg-white p-1 pb-0 text-gray-900 border border-blue-400  text-xs  flex-shrink-0"
          >
            {/* Size & Remove */}
            <div className="flex justify-between py-1 items-center mb-1">
              <span className="font-medium flex  justify-between p-2  w-full text-center bg-black text-white py-1">
                Size :
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

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mb-2 ">
              <button
                disabled={sel.quantity <= 1}
                onClick={() => changeQuantity(sel.size, sel.quantity - 1)}
                className="px-2 py-0 text-lg font-extrabold hover:bg-gray-200 text-black rounded transition duration-200"
              >
                −
              </button>
              <span className="text-gray-800 text-lg font-bold">{sel.quantity}</span>
              <button
                disabled={sel.quantity >= maxStock}
                onClick={() => changeQuantity(sel.size, sel.quantity + 1)}
                className="px-2 py-0 text-lg font-extrabold hover:bg-gray-200 text-black rounded transition duration-200"
              >
                +
              </button>
            </div>

            {/* Cart Info & Delete */}
            <div className="flex justify-between  py-2 items-center">
              {inCartQty && (
                <span className="font-extrabold w-full bg-black text-white  text-center px-2 mr-1">
                  In Cart : {inCartQty}
                </span>
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
              Total price &nbsp;: &nbsp; <span className='text-yellow-400  underline'> ₹{totalPrice}</span>
            </span>
             </div>

          )}
  
       
 
      {/* Actions */}
      <div className="sticky bottom-6 mb-2 rounded--none z-40 mt-2">
        <ProductActionButtons
          product={product}
          selectedSizes={selectedSizes.map((s) => s.size)}
          quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
        />
      </div>

      {/* Delivery & Return Section */}
    {/* Delivery & Return Section */}
<div className="p-4 w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-600 mt-4">
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
        className="flex-1 px-3 py-1 w-full bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
      />
      <button
        onClick={checkPincode}
        className="px-4 py-1 bg-yellow-500 text-black font-semibold  hover:bg-yellow-400 transition-colors"
      >
        Check
      </button>
    </div>

    {pincodeMessage && (
      <div className="text-sm mt-2 font-medium">
        {pincodeAvailable ? (
          <p className="text-green-400">✅ Delivery & Return available to {pincode}</p>
        ) : (
          <p className="text-red-400">❌ Delivery & Return not available to {pincode}</p>
        )}
      </div>
    )}

    <div className="text-sm text-gray-300 mt-3">
      <p>• Easy 7-day returns</p>
      <p>• No cash on delivery </p>
    </div>
    <div className="border-t border-gray-600 pt-3">
      <Link
        to="/cancellation-refund"
        className="text-yellow-400 hover:text-yellow-300 underline text-sm"
      >
        View Return Policy →
      </Link>
    </div>
  </div>
</div>


      {/* Description */}
      <div className="p-3  bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700 mt-4">
        {renderDescription(product.description)}
      </div>




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
