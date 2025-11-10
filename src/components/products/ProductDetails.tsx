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
    const already = selectedSizes.some((s) => s.size === size);
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

      {/* --- AIJIM Size Conversion Note --- */}
      {selectedSizes.length === 1 && (
        <div className="mt-4 pl-2 text-[11px] text-gray-300 font-medium flex items-center gap-2">
          <p>
            Regular size{" "}
            <span className="text-yellow-400 font-semibold">
              {selectedSizes[0].size}
            </span>{" "}
            ~ AIJIM size{" "}
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
            AIJIM Size Guide →
          </button>

          {/* Popup Modal */}
          {showSizeGuide && (
            <div className="fixed inset-0 flex bg-black/80 items-center justify-center z-50">
              <div className="relative w-[90%] max-w-md bg-black p-3 rounded-none shadow-lg">
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-1 right-1 text-red-500 text-lg font-black"
                >
                  ✕
                </button>
                <img
                  src="https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/paymentproofs/Size%20guide/Aijim-size-guide.webp"
                  alt="AIJIM Size Guide"
                  className="rounded-none w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Sizes --- */}
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
                      ? "bg-gray-900 text-gray-400 border-gray-700 opacity-90"
                      : "text-white border-gray-200 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {size}
                </button>
                {isOutOfStock && (
                  <span className="absolute inset-0 flex items-center justify-center text-red-500 font-extrabold text-xs pointer-events-none">
                    ✕
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Description + Features --- */}
      <div className="px-2 pb-4 mt-4">
        <ProductDescription desc={product.description} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-700 py-3 rounded-none text-white">
            <IndianRupee className="w-5 h-5 mb-1 text-white" />
            <p className="text-[13px] font-semibold">Free Delivery</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-700 py-3 rounded-none text-white">
            <Truck className="w-5 h-5 mb-1 text-white" />
            <p className="text-[13px] font-semibold">Fast Delivery (5–7 Days)</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-700 py-3 rounded-none text-white">
            <Shirt className="w-5 h-5 mb-1 text-white" />
            <p className="text-[13px] font-semibold">100% Cotton</p>
          </div>

          <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-700 py-3 rounded-none text-white">
            <Coins className="w-5 h-5 mb-1 text-white" />
            <p className="text-[13px] font-semibold">Reward Points</p>
          </div>
        </div>

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
