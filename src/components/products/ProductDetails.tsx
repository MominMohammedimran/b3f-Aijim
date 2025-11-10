import React, { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  Share,
  ChevronDown,
  IndianRupee,
  Truck,
  Shirt,
  Coins,
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

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

  const toggleSize = (size: string) => {
    const stock = productVariants.find((v) => v.size === size)?.stock ?? 0;
    const already = selectedSizes.some((s) => s.size === size);
    if (stock === 0 && !already) return;
    setSelectedSizes((prev) =>
      already ? prev.filter((s) => s.size !== size) : [...prev, { size, quantity: 1 }]
    );
    setShowSizeSelector(false);
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

  const allOutOfStock = productVariants.every((v) => v.stock === 0);

  return (
    <div className="relative bg-[#0b0b0b] text-white rounded-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-3">
        <span className="text-sm font-semibold uppercase tracking-wide">
          AIJIM
        </span>
        <Button variant="ghost" size="icon" onClick={() => setShowShareModal(true)}>
          <Share className="w-5 h-5 text-gray-200" />
        </Button>
      </div>

      {/* Info */}
      <div className="px-2 mt-2">
        <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-md text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
          <span className="text-xl font-bold text-yellow-300">₹{product.price}</span>
          {discountPercent > 0 && (
            <span className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      <LiveViewingCounter productId={product.id} />

      {/* Size Selector */}
      <div className="px-2">
        <h4 className="text-sm font-semibold mt-4 mb-2">Select Size</h4>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {productVariants.map(({ size, stock }) => {
            const selected = selectedSizes.some((s) => s.size === size);
            const isOutOfStock = stock === 0;
            return (
              <div key={size} className="relative">
                <button
                  onClick={() => toggleSize(size)}
                  className={`relative w-full py-1.5 text-xs font-bold border rounded-sm transition-all ${
                    selected
                      ? "bg-white text-black underline border-2 border-gray-300"
                      : isOutOfStock
                      ? "bg-gray-900 text-gray-400 border-gray-700 cursor-not-allowed"
                      : "text-white border-gray-200 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {size}
                </button>
                {isOutOfStock && (
                  <span className="absolute inset-0 flex items-center justify-center text-red-500 text-xs font-bold opacity-70 pointer-events-none">
                    ✕
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Sizes */}
      {selectedSizes.length > 0 && (
        <div className="px-2 pt-4 border-t border-gray-700 mt-3">
          <h4 className="text-md font-semibold mb-3">Selected Sizes</h4>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {selectedSizes.map((sel) => (
              <div
                key={sel.size}
                className="min-w-[110px] p-2 border border-gray-500 bg-gray-900 rounded-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold uppercase text-lg mr-2">
                    {sel.size}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={sel.quantity <= 1}
                      onClick={() => changeQuantity(sel.size, sel.quantity - 1)}
                      className="px-1 py-0 text-lg font-bold text-white hover:bg-gray-200 hover:text-black"
                    >
                      −
                    </button>
                    <span className="text-gray-200 text-lg">{sel.quantity}</span>
                    <button
                      onClick={() => changeQuantity(sel.size, sel.quantity + 1)}
                      className="px-1 py-0 text-lg font-bold text-white hover:bg-gray-200 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPrice > 0 && (
        <div className="flex justify-center mt-4">
          <span className="text-xl font-semibold">
            Total : <span className="text-yellow-400 underline">₹{totalPrice}</span>
          </span>
        </div>
      )}

      {/* Slide-up Size Selector if no size selected */}
      {showSizeSelector && selectedSizes.length === 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 flex flex-col items-center justify-center bg-black/95 border-t border-gray-800 py-4 animate-slide-up">
          <h4 className="text-yellow-400 text-sm font-semibold mb-2">
            Please select your size
          </h4>
          <div className="grid grid-cols-6 gap-2 px-4">
            {productVariants.map(({ size, stock }) => {
              const isOutOfStock = stock === 0;
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  disabled={isOutOfStock}
                  className={`w-12 py-1 text-xs font-bold rounded-sm ${
                    isOutOfStock
                      ? "bg-gray-800 text-gray-600 border border-gray-700"
                      : "bg-gray-700 text-white hover:bg-yellow-400 hover:text-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to Cart / Order */}
      {!allOutOfStock ? (
        <div className="w-full flex flex-row fixed lg:relative bottom-8 left-0 right-0 z-30 items-center justify-center">
          <ProductActionButtons
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
            className="w-1/2 lg:w-full rounded-none text-base font-semibold"
            onClick={() => {
              if (selectedSizes.length === 0) {
                setShowSizeSelector(true);
                setTimeout(() => setShowSizeSelector(false), 4000);
              }
            }}
          />
          <ProductPlaceOrder
            product={product}
            selectedSizes={selectedSizes.map((s) => s.size)}
            quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
            variant="secondary"
            className="w-1/2 lg:w-full rounded-none border-l border-gray-700 bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
            onClick={() => {
              if (selectedSizes.length === 0) {
                setShowSizeSelector(true);
                setTimeout(() => setShowSizeSelector(false), 4000);
              }
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 m-3 bg-gray-900 border-t border-gray-800">
          <p className="text-sm text-gray-400 font-semibold">
            ❌ Out of Stock — Coming Soon!
          </p>
        </div>
      )}

      {/* Delivery Section */}
      <div className="p-4 bg-gray-950 border border-gray-700 rounded-none m-2 mt-4">
        <h3 className="text-md font-semibold text-yellow-300 mb-2">
          Delivery & Returns
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter PIN Code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="flex-1 text-xs px-2 py-1.5 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 font-semibold focus:ring-1 focus:ring-yellow-400 outline-none"
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

          {/* Dropdown */}
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-200 hover:text-yellow-400"
            >
              Delivery Instructions
              <ChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  showInstructions ? "rotate-180 text-yellow-400" : "rotate-0"
                }`}
              />
            </button>
            {showInstructions && (
              <div className="bg-gray-800 text-gray-300 text-xs p-3 border border-gray-700 mt-2 rounded-sm space-y-1">
                <p>• Easy 7-day returns</p>
                <p>• No Cash on Delivery</p>
                <Link
                  to="/cancellation-refund"
                  className="text-yellow-400 underline"
                >
                  View Refund Policy →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Icons Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 mb-2 text-center px-3">
        {[
          { icon: IndianRupee, label: "Free Delivery" },
          { icon: Truck, label: "Fast Delivery (5–7 Days)" },
          { icon: Shirt, label: "100% Cotton" },
          { icon: Coins, label: "Reward Points" },
        ].map(({ icon: Icon, label }, i) => (
          <div
            key={i}
            className="group flex flex-col items-center justify-center bg-gray-900 border border-gray-700 hover:border-gray-500 transition-all p-3 rounded-md text-white shadow hover:shadow-indigo-500/10"
          >
            <Icon className="w-4 h-4 mb-1 text-white group-hover:text-yellow-400" />
            <p className="text-[12px] font-medium group-hover:text-yellow-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      <ProductDescription desc={product.description} />
      <AvailableCoupons />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;
