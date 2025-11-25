import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [showInstructions, setShowInstructions] = useState(false);
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
    <div className="relative bg-[#0b0b0b] text-white p-2 rounded-md shadow-lg">
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
                    <span className="text-yellow-400 font-semibold">
                      {lastSize}
                    </span>
                    &nbsp;~ AIJIM size:{" "}
                    <span className="text-yellow-400 font-semibold">
                      {aijimSize}
                    </span>
                  </p>

                  <p
                    onClick={() => setShowSizeGuide(true)}
                    className="text-yellow-400 underline hover:text-yellow-300 text-[11px] font-semibold"
                  >
                    Size chart →
                  </p>
                </div>
                <div className="flex  gap-2  p-0 mt-2 ml-2 rounded-md">
                  <span className="text-gray-200 text-xs">
                    Chest - {chest} cm{" "}
                  </span>

                  <span className="text-gray-200 text-xs">
                    Shoulder - {shoulder} cm
                  </span>

                  <span className="text-gray-200 text-xs">
                    Length - {length} cm{" "}
                  </span>
                </div>

                {/* --- Popup Modal --- */}
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
                        src="https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/sign/productimages/size%20guide/aijim-size-guide.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Y2JiM2U1ZS1jZTNiLTRkMTctYTlhOC0zZGU5YzViYTRlZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0aW1hZ2VzL3NpemUgZ3VpZGUvYWlqaW0tc2l6ZS1ndWlkZS5wbmciLCJpYXQiOjE3NjMzOTAzMjgsImV4cCI6MTc5NDkyNjMyOH0.QILeaKATU2vwJmqRL5tTwhZTzrvLBn315YEF66uC09A"
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
      <div className="px-2">
        <span className="text-gray-200 text-lg font-medium pt-1">
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
                  className="w-auto p-2 border border-gray-500 bg-gradient-to-br from-black via-gray-900 to-black rounded-sm"
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

      {/* --- Description + Features + Coupons --- */}
      <div className="px-2 pb-4">
        {/* Product Description */}
        <ProductDescription desc={product.description} />

        {/* --- Feature Highlights (Lucide Icons) --- */}
        <div className="grid grid-cols-4  gap-1 mt-2 mb-2 text-center">
          {[
            { icon: IndianRupee, label: "Free Delhivery" },
            { icon: Truck, label: "Fast Delhivery" },
            { icon: Shirt, label: "100% Cotton" },
            { icon: Coins, label: "Reward Points" },
          ].map(({ icon: Icon, label }, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center  transition-all duration-300 p-3 rounded-lg text-white shadow-md "
            >
              <div className="flex items-center gap-2 justify-center bg-gray-800 hover:bg-indigo-600 transition-all duration-300 rounded-full w-8 h-8 mb-1">
                <Icon className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <p className="text-[10px] sm:text-[13px] font-medium leading-tight group-hover:text-yellow-400">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Available Coupons */}
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
