import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Loader2,
  Share2,
  
} from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useProductInventory } from "@/hooks/useProductInventory";
import ProductActionButtons from "./ProductActionButtons";
import ProductPlaceOrder from "./ProductPlaceOrder";
import ShareModal from "./ShareModal";
import LiveViewingCounter from "./LiveViewingCounter";
import AvailableCoupons from "./AvailableCoupons";
import TrustHighlights from "./TrustHighlights";
import PincodeCheck from "./PinCodeCheck";
import ProductDescription from "./ProductDescription";

import { useDeliverySettings } from "@/hooks/useDeliverySettings";
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

  const [showSizeGuide, setShowSizeGuide] = useState(false); // <-- added
  const { cartItems } = useCart();
  const { loading: inventoryLoading } = useProductInventory(product.id);
  const { settings: deliverySettings, loading: settingsLoading } =
    useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  const scrollToDiv = (id: string, offset: number = -8) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY + offset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  // --- Prepare variants ---
  const productVariants = useMemo(() => {
    return Array.isArray(product.variants)
      ? product.variants.map((v) => ({
          size: String(v.size),
          stock: Number(v.stock) || 0,
        }))
      : [];
  }, [product.variants]);

  // --- Sync sizes from cart ---
  useEffect(() => {
    const cartItem = cartItems.find((c) => c.product_id === product.id);
    if (cartItem) {
      setSelectedSizes(
        cartItem.sizes.map((s) => ({ size: s.size, quantity: s.quantity }))
      );
    }
  }, [cartItems, product.id]);

  // --- Toggle / Change Size ---
  const toggleSize = (size: string) => {
    const stock = productVariants.find((v) => v.size === size)?.stock ?? 0;
    const already = selectedSizes.some((s) => s.size === size);
    if (stock === 0 && !already) return;
    setSelectedSizes((prev) =>
      already
        ? prev.filter((s) => s.size !== size)
        : [...prev, { size, quantity: 1 }]
    );
  };

  const changeQuantity = (size: string, q: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity: q } : s))
    );
  };

  const originalPrice =
    typeof product.original_price === "number" && product.original_price > 0
      ? product.original_price
      : product.price;

  const hasDiscount = originalPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;
{/*const calculateOfferTotal = (selectedSizes: { quantity: number }[]) => {
  const totalQty = selectedSizes.reduce((sum, item) => sum + item.quantity, 0);

  const pairs = Math.floor(totalQty / 2);
  const remainder = totalQty % 2;

  return pairs * 1000 + (remainder ? 549 : 0);
};



const totalPrice = calculateOfferTotal(selectedSizes);


*/}

  const totalPrice = selectedSizes.reduce(
    (sum, s) => sum + s.quantity * product.price,
    0
  );

  // --- Pincode ---

  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

  const getAijimSize = (size: string) => {
    // Regular → AIJIM mapping logic
    const index = sizeOrder.indexOf(size);
    if (index === -1) return size;

    // Example: shift 1 size down (you can adjust)
    const aijimIndex = index - 1 >= 0 ? index - 1 : 0;
    return sizeOrder[aijimIndex];
  };

  const getSizeMeasurements = (size: string) => {
    const index = sizeOrder.indexOf(size);
    if (index === -1) return { chest: 0, shoulder: 0, length: 0 };

    const chest = 40 + index * 2; // XS=40, S=42, M=44...
    const length = 26 + index * 1;
    const shoulder = 19 + index * 0.5;
    // XS=19, S=19.5, M=20...
    return { chest, shoulder, length };
  };

  if (inventoryLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
      </div>
    );

  // --- Determine stock availability ---
  const allOutOfStock = productVariants.every((v) => v.stock === 0);

  return (
    <div className="relative bg-[#0b0b0b] text-white p-0 rounded-md shadow-lg">
      {/* --- Header --- 
      <div className="flex items-center justify-between px-2 pt-3">
        <span className="text-sm font-semibold uppercase tracking-wide">
          AIJIM
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 className="w-5 h-5 text-gray-200" />
        </Button>
      </div>*/}

      {/* --- Product Info --- */}
      <div id="sizeSection" className="px-2 mt-2">
        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-yellow-300">
            ₹{product.price}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-md text-gray-400 line-through">
              ₹{product.original_price}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
          <div
            className="
            flex 
            justify-start sm:justify-center 
            items-baseline 
            gap-2
            mt-0
            text-left sm:text-center
          "
          >
            <span className="text-yellow-400 text-[14px] font-semibold">
              {deliveryFee === 0 ? (
                <span className=" text-xs uppercase font-semibold md:text-md text-gray-200">
                  Free Shipping
                </span>
              ) : (
                `+ ₹${deliveryFee}`
              )}
            </span>
          </div>
        </div>
      </div>

      <LiveViewingCounter productId={product.id} />

      {/* --- AIJIM Size Conversion Note (auto updates, popup) --- */}
      {/* --- AIJIM Size Conversion Note (auto updates, popup) --- */}
      {selectedSizes.length > 0 && (
        <div className="mt-4 text-[11px] text-gray-300 font-medium flex flex-col gap-1">
          {(() => {
            const lastSize = selectedSizes[selectedSizes.length - 1].size;
            const aijimSize = getAijimSize(lastSize);
            const { chest, shoulder, length } = getSizeMeasurements(lastSize);
            return (
              <>
                <div className="flex items-center gap-5 ml-2">
  <p>
    Regular size:{" "}
    <span className="text-yellow-400 font-semibold">{lastSize}</span>
    &nbsp;~ AIJIM size:{" "}
    <span className="text-yellow-400 font-semibold">{aijimSize}</span>
  </p>

  <p
    onClick={() => setShowSizeGuide(true)}
    className="text-yellow-400 underline hover:text-yellow-300 text-[11px] font-semibold cursor-pointer"
  >
    Size chart →
  </p>
</div>

<div className="flex gap-2 p-0 mt-2 ml-2 rounded-md">
  <span className="text-gray-200 text-xs">Chest {chest}cm</span>
  <span className="text-gray-200 text-xs">Shoulder {shoulder}cm</span>
  <span className="text-gray-200 text-xs">Length {length}cm</span>
</div>

{/* --- Replaced Table with Simple Specs --- */}
<div className="flex justify-between items-start gap-2 mt-1 px-0 text-center">

  <div className="flex-1 border-r border-yellow-400 p-1">
    <p className="text-yellow-400 font-semibold text-[12px]">Fit</p>
    <p className="text-gray-200 text-[10px] mt-1 font-medium">
      True to size
    </p>
  </div>

  <div className="flex-1 p-1">
    <p className="text-yellow-400 font-semibold text-[12px]">Fabric</p>
    <p className="text-gray-200 text-[10px] mt-1 font-medium">
      240 GSM , pure Cotton
    </p>
  </div>

  <div className="flex-1 border-l border-yellow-400 p-1">
    <p className="text-yellow-400 font-semibold text-[12px]">Feel</p>
    <p className="text-gray-200 text-[10px] mt-1 font-medium">
      Soft & Breathable
    </p>
  </div>

</div>


{/* --- Modal Popup --- */}
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

              </>
            );
          })()}
        </div>
      )}

      {/* --- Sizes --- */}
      <div className="px-2 mt-3">
        <span className="text-gray-200 text-lg  font-medium pt-1">
          Select Size{" "}
        </span>
        <div className="grid mt-1 grid-cols-6 md:grid-cols-6 gap-2 relative border-t border-gray-200">
          {productVariants.map(({ size, stock }) => {
            const selected = selectedSizes.some((s) => s.size === size);
            const isOutOfStock = stock === 0;

            return (
              <div key={size} className="relative mt-2">
                <button
                  onClick={() => toggleSize(size)}
                  disabled={isOutOfStock}
                  className={`relative w-full py-1.5 text-xs font-bold border rounded-sm transition-all overflow-hidden ${
                    selected
                      ? "bg-white text-black underline border-2 border-gray-300"
                      : isOutOfStock
                      ? "bg-gray-900 text-gray-200 border-gray-700 cursor-not-allowed opacity-90"
                      : "text-white border-gray-200 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {size}
                </button>

                {/* ❌ X Mark Overlay for Out of Stock */}
                {isOutOfStock && (
                  <span className="absolute inset-0 flex items-center justify-center opacity-70 text-red-500 font-extrabold text-xs pointer-events-none">
                    ✕
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Selected Sizes --- */}
      {selectedSizes.length > 0 && (
        <div className="px-2 pt-4 border-t border-gray-700 mt-3">
          <h4 className="text-md font-semibold mb-3">Selected Sizes</h4>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {selectedSizes.map((sel) => {
              const variant = productVariants.find((v) => v.size === sel.size);
              const maxStock = variant?.stock ?? 0;
              const cartItem = cartItems.find(
                (c) => c.product_id === product.id
              );
              const cartSizeInfo = cartItem?.sizes.find(
                (s) => s.size === sel.size
              );
              const inCartQty = cartSizeInfo?.quantity ?? 0;
              const isLocked = inCartQty >= maxStock;
              return (
                <div
                  key={sel.size}
                  className="w-auto p-2 border border-gray-500 bg-muted-background rounded-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold uppercase text-md mr-2">
                      {sel.size}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        disabled={sel.quantity <= 1 || isLocked}
                        onClick={() =>
                          changeQuantity(sel.size, sel.quantity - 1)
                        }
                        className={`px-1.5 py-0 text-md font-bold rounded ${
                          sel.quantity <= 1 || isLocked
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : "hover:bg-gray-200 hover:text-black text-white"
                        }`}
                      >
                        −
                      </button>
                      <span className="text-gray-200 text-md font-semibold">
                        {sel.quantity}
                      </span>
                      <button
                        disabled={sel.quantity >= maxStock || isLocked}
                        onClick={() =>
                          changeQuantity(sel.size, sel.quantity + 1)
                        }
                        className={`px-1.5 py-0 text-md font-bold rounded ${
                          sel.quantity >= maxStock || isLocked
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : "hover:bg-gray-200 hover:text-black text-white"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {inCartQty > 0 && (
                    <p className="text-[10px] text-center text-yellow-400 font-semibold">
                      In Cart - {inCartQty} Qty
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Total --- */}
      {totalPrice > 0 && (
        <div className="flex justify-center mt-4">
          <span className="text-xl font-semibold">
            Total Amount :{" "}
            <span className="text-yellow-400 underline">₹{totalPrice}</span>
          </span>
        </div>
      )}

      {/* --- Action Buttons (hide if all out of stock) --- */}
      {!allOutOfStock ? (
        <div
          onClick={() => scrollToDiv("sizeSection")}
          className="w-100 flex flex-row fixed lg:relative lg:mt-8 bottom-8 left-0 right-0 z-10 items-center justify-center"
        >
          <ProductActionButtons
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce(
              (acc, s) => ({ ...acc, [s.size]: s.quantity }),
              {}
            )}
            className="w-1/2 lg:w-full rounded-none text-base font-semibold"
          />
          <ProductPlaceOrder
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce(
              (acc, s) => ({ ...acc, [s.size]: s.quantity }),
              {}
            )}
            variant="secondary"
            className="w-1/2 lg:w-full rounded-none border-l border-gray-700 font-semibold text-base bg-yellow-400 text-black hover:bg-yellow-300"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 m-3 bg-gray-900 border-t  border-gray-800">
          <p className="text-sm text-gray-400 font-semibold">
            ❌ Currently <span className="text-yellow-400">Out of Stock</span> —
            Coming Soon!
          </p>
        </div>
      )}

      {/* --- Delivery Section --- */}
      <PincodeCheck />

      {/* --- Description + Features + Coupons --- */}
      <div className="px-2 pb-4">
        {/* Product Description */}
        <ProductDescription desc={product.description} />
        <AvailableCoupons />

        {/* Available Coupons */}

        <TrustHighlights />
      </div>

      {/* --- Share Modal --- */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
