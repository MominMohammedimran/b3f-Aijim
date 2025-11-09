import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Share, ChevronDown } from "lucide-react";
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
import ProductDescription from "./ProductDescription";
import { validatePincode } from "@/utils/pincodeService";

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
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false); // <-- added
  const { cartItems } = useCart();
  const { loading: inventoryLoading } = useProductInventory(product.id);

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
      already ? prev.filter((s) => s.size !== size) : [...prev, { size, quantity: 1 }]
    );
  };

  const changeQuantity = (size: string, q: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity: q } : s))
    );
  };

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const totalPrice = selectedSizes.reduce(
    (sum, s) => sum + s.quantity * product.price,
    0
  );

  // --- Pincode ---
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    isServiceable: boolean;
    message: string;
  } | null>(null);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);

  const checkPincode = async () => {
    if (!pincode) {
      toast.error("Please enter a valid pincode");
      return;
    }
    setLoadingPincode(true);
    setPincodeChecked(true);
    try {
      const result = await validatePincode(pincode);
      setPincodeResult({
        isServiceable: result.isServiceable,
        message: result.message,
      });
    } catch {
      setPincodeResult({
        isServiceable: false,
        message: "Unable to verify PIN code. Please try again later.",
      });
    }
    setLoadingPincode(false);
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
    <div className="relative bg-[#0b0b0b] text-white rounded-md shadow-lg">
      {/* --- Header --- */}
      <div className="flex items-center justify-between px-2 pt-3">
        <span className="text-sm font-semibold uppercase tracking-wide">
          AIJIM
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowShareModal(true)}
        >
          <Share className="w-5 h-5 text-gray-200" />
        </Button>
      </div>

      {/* --- Product Info --- */}
      <div className="px-2 mt-2">
        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-md text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
          <span className="text-xl font-bold text-yellow-300">
            ₹{product.price}
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      <LiveViewingCounter productId={product.id} />
      {/* --- AIJIM Size Conversion Note (auto updates, popup) --- */}
      {selectedSizes.length === 1 && (
        <div className="mt-4 text-[11px] text-gray-300 font-medium flex items-center gap-2">
          <p>
            💡 Regular size{" "}
            <span className="text-yellow-400 font-semibold">
              {selectedSizes[0].size}
            </span>{" "}
            = AIJIM size{" "}
            <span className="text-yellow-400 font-semibold">
              {selectedSizes[0].size === "XS"
                ? "XS"
                : selectedSizes[0].size === "S"
                ? "XS"
                : selectedSizes[0].size === "M"
                ? "S"
                : selectedSizes[0].size === "L"
                ? "M"
                : selectedSizes[0].size === "XL"
                ? "L"
                : selectedSizes[0].size === "XXL"
                ? "XXL"
                : selectedSizes[0].size}
            </span>
          </p>
          <button
            onClick={() => setShowSizeGuide(true)}
            className="text-yellow-400 underline hover:text-yellow-300 text-[11px] font-semibold"
          >
            View AIJIM Size Guide →
          </button>

          {/* --- Popup Modal --- */}
          {showSizeGuide && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="relative w-[90%] max-w-md bg-gray-900 p-3 rounded-2xl shadow-lg border border-gray-700">
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-2 right-3 text-gray-300 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
                <img
                  src="https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/paymentproofs/Size%20guide/Aijim-size-guide.webp"
                  alt="AIJIM Size Guide"
                  className="rounded-xl w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Sizes --- */}
      <div className="px-2">
        <h4 className="text-sm font-semibold mt-4 mb-2">Select Size</h4>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 relative">
          {productVariants.map(({ size, stock }) => {
            const selected = selectedSizes.some((s) => s.size === size);
            const isOutOfStock = stock === 0;

            return (
              <div key={size} className="relative">
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
              const cartItem = cartItems.find((c) => c.product_id === product.id);
              const cartSizeInfo = cartItem?.sizes.find(
                (s) => s.size === sel.size
              );
              const inCartQty = cartSizeInfo?.quantity ?? 0;
              const isLocked = inCartQty >= maxStock;
              return (
                <div
                  key={sel.size}
                  className="min-w-[110px] p-2 border border-gray-500 bg-gradient-to-br from-black via-gray-900 to-black rounded-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold uppercase text-lg mr-2">
                      {sel.size}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        disabled={sel.quantity <= 1 || isLocked}
                        onClick={() =>
                          changeQuantity(sel.size, sel.quantity - 1)
                        }
                        className={`px-1.5 py-0 text-lg font-bold rounded ${
                          sel.quantity <= 1 || isLocked
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : "hover:bg-gray-200 hover:text-black text-white"
                        }`}
                      >
                        −
                      </button>
                      <span className="text-gray-200 text-lg font-semibold">
                        {sel.quantity}
                      </span>
                      <button
                        disabled={sel.quantity >= maxStock || isLocked}
                        onClick={() =>
                          changeQuantity(sel.size, sel.quantity + 1)
                        }
                        className={`px-1.5 py-0 text-lg font-bold rounded ${
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
        <div className="w-100 flex flex-row fixed lg:relative lg:flex-col lg:mt-10 bottom-8 left-0 right-0 z-10 items-center justify-center">
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
            ❌ Currently <span className="text-yellow-400">Out of Stock</span> — Coming Soon!
          </p>
        </div>
      )}

      {/* --- Delivery Section --- */}
      <div className="p-4 bg-gradient-to-br from-black via-gray-900 to-black border border-gray-700 rounded-none m-2 mt-4">
        <h3 className="text-md font-semibold text-yellow-300 mb-2">
          Delivery & Returns
        </h3>
        <div className="space-y-3">
          {/* Pincode Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter PIN Code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="w-80 flex-1 text-xs px-1 py-1.5 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 font-semibold focus:ring-1 focus:ring-yellow-400 outline-none"
            />
            <button
              onClick={checkPincode}
              disabled={loadingPincode}
              className="px-2 py-1.5 bg-yellow-500 text-xs text-black font-semibold rounded-none hover:bg-yellow-400 disabled:opacity-50"
            >
              {loadingPincode ? "Checking..." : "Check"}
            </button>
          </div>

          {pincodeChecked && pincodeResult && (
            <p
              className={`text-[10px] font-semibold ${
                pincodeResult.isServiceable ? "text-green-400" : "text-red-400"
              }`}
            >
              {pincodeResult.message}
            </p>
          )}

          {/* --- Delivery Instructions Dropdown --- */}
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={() => setShowInstructions((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-200 hover:text-yellow-400 transition-colors"
            >
              Delivery Instructions
              <ChevronDown
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  showInstructions ? "rotate-180 text-yellow-400" : "rotate-0"
                }`}
              />
            </button>
            {/* Dropdown content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showInstructions ? "max-h-[300px] mt-2" : "max-h-0"
              }`}
            >
              <div className="bg-gray-800 text-gray-300 text-xs font-medium p-3 border border-gray-700 rounded-none space-y-1 leading-relaxed">
                <p>• Easy 7-day returns on eligible items</p>
                <p>• No Cash on Delivery available</p>
                <Link
                  to="/cancellation-refund"
                  className="text-yellow-400 hover:text-yellow-300 underline block mt-1"
                >
                  View Cancellation & Refund Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Description + Coupons --- */}
      <div className="px-2 pb-4">
        <ProductDescription desc={product.description} />
        <AvailableCoupons />
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
