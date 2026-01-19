import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useProductInventory } from '@/hooks/useProductInventory';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import ProductActionButtons from './ProductActionButtons';
import ProductPlaceOrder from './ProductPlaceOrder';
import ShareModal from './ShareModal';
import LiveViewingCounter from './LiveViewingCounter';
import AvailableCoupons from './AvailableCoupons';
import TrustHighlights from './TrustHighlights';
import PinCodeCheckAvailable from './PinCodeCheckAvailable';
import ProductDescription from './ProductDescription';
import ProductInfoHeader from './ProductInfoHeader';
import ProductSizeSelector from './ProductSizeSelector';
import ProductSizeGuide from './ProductSizeGuide';
import SelectedSizes from './SelectedSizes';

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

export interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSizes, setSelectedSizes] = useState<SizeWithQuantity[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { cartItems } = useCart();
  const { loading: inventoryLoading } = useProductInventory(product.id);
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  const comboOffer=deliverySettings?.combo_offer??550;

  const scrollToDiv = (id: string, offset: number = -8) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const productVariants = useMemo(() => {
    return Array.isArray(product.variants)
      ? product.variants.map((v) => ({ size: String(v.size), stock: Number(v.stock) || 0 }))
      : [];
  }, [product.variants]);

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
    setSelectedSizes((prev) => (already ? prev.filter((s) => s.size !== size) : [...prev, { size, quantity: 1 }]));
  };

  const changeQuantity = (size: string, q: number) => {
    setSelectedSizes((prev) => prev.map((s) => (s.size === size ? { ...s, quantity: q } : s)));
  };

  const originalPrice = typeof product.original_price === 'number' && product.original_price > 0 ? product.original_price : product.price;
  const hasDiscount = originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  const calculateOfferTotal = (selectedSizes: { quantity: number }[]) => {
    const totalQty = selectedSizes.reduce((sum, item) => sum + item.quantity, 0);
    const pairs = Math.floor(totalQty / 2);
    const remainder = totalQty % 2;
    return pairs * 1000 + (remainder ? comboOffer : 0);
  };

  const totalPrice = calculateOfferTotal(selectedSizes);

  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

  const getAijimSize = (size: string) => {
    const index = sizeOrder.indexOf(size);
    if (index === -1) return size;
    const aijimIndex = index - 1 >= 0 ? index - 1 : 0;
    return sizeOrder[aijimIndex];
  };

  const getSizeMeasurements = (size: string) => {
    const index = sizeOrder.indexOf(size);
    if (index === -1) return { chest: 0, shoulder: 0, length: 0 };
    const chest = 40 + index * 2;
    const length = 26 + index * 1;
    const shoulder = 19 + index * 0.5;
    return { chest, shoulder, length };
  };

  if (inventoryLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    );
  }

  const allOutOfStock = productVariants.every((v) => v.stock === 0);

  return (
    <div className="relative bg-[#0b0b0b] text-white p-0 rounded-md shadow-lg">
      <ProductInfoHeader
        name={product.name}
        price={product.price}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
        deliveryFee={deliveryFee}
      />

      <LiveViewingCounter productId={product.id} />

      {selectedSizes.length > 0 && (
        <ProductSizeGuide
          size={selectedSizes[selectedSizes.length - 1].size}
          getAijimSize={getAijimSize}
          getSizeMeasurements={getSizeMeasurements}
          onShowSizeGuide={() => setShowSizeGuide(true)}
        />
      )}

      <ProductSizeSelector variants={productVariants} selectedSizes={selectedSizes} onToggleSize={toggleSize} />

      {selectedSizes.length > 0 && (
        <SelectedSizes
          productId={product.id}
          selectedSizes={selectedSizes}
          productVariants={productVariants}
          onChangeQuantity={changeQuantity}
        />
      )}

      {totalPrice > 0 && (
        <div className="flex justify-center mt-4">
          <span className="text-xl font-semibold">
            Total Amount : <span className="text-yellow-400 underline">₹{totalPrice}</span>
          </span>
        </div>
      )}

      {!allOutOfStock ? (
        <div
          onClick={() => scrollToDiv('sizeSection')}
          className="w-100 flex flex-row fixed lg:relative lg:mt-8 bottom-8 left-0 right-0 z-30 items-center justify-center"
        >
          <ProductActionButtons
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
            className="w-1/2 lg:w-full rounded-none text-base font-semibold"
          />
          <ProductPlaceOrder
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
            variant="secondary"
            className="w-1/2 lg:w-full rounded-none border-l border-gray-700 font-semibold text-base bg-yellow-400 text-black hover:bg-yellow-300"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 m-3 bg-gray-900 border-t border-gray-800">
          <p className="text-sm text-gray-400 font-semibold">
            ❌ Currently <span className="text-yellow-400">Out of Stock</span> — Coming Soon!
          </p>
        </div>
      )}

      <PinCodeCheckAvailable />

      <div className="px-2 pb-4">
        <ProductDescription desc={product.description} />
        <AvailableCoupons />
        <TrustHighlights />
      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} product={product} />

      {showSizeGuide && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="relative w-[90%] max-w-md bg-black p-3 rounded shadow-lg">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-1 right-2 text-red-500 text-lg font-bold"
            >
              ✕
            </button>
            <img
              src="https://ik.imagekit.io/o5ewoek4p/aijim-size-guide.jpg?updatedAt=1764687769057"
              alt="AIJIM Size Guide"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
