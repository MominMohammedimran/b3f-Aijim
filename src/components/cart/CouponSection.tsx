import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Ticket, ChevronDown, ChevronUp } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  valid_to: string;
  valid_from: string;
}

interface CouponSectionProps {
  cartTotal: number;
  cartItems: any[];
  onCouponApplied: (discount: number, code: string) => void;
  onCouponRemoved?: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

const CouponSection: React.FC<CouponSectionProps> = ({
  cartTotal,
  cartItems,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [expanded, setExpanded] = useState(true);
  const { currentUser } = useAuth();

  // Handle clearing local messages when a coupon is removed/applied
  useEffect(() => {
    if (!appliedCoupon?.code) {
      setMessage("");
      setMessageType("");
    }
  }, [appliedCoupon]);

  // Fetch available coupons on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, valid_to, valid_from")
        .eq("active", true);
      setCoupons(data || []);
    })();
  }, []);

  // === AUTOMATIC BUY2 LOGIC ===
  useEffect(() => {
    // We only auto-apply if no coupon is active OR if the active one is the auto-promo
    const isNoCoupon = !appliedCoupon || appliedCoupon.code === "";
    const isAlreadyBuy2 = appliedCoupon?.code === "BUY_2_PROMO";

    if (isNoCoupon || isAlreadyBuy2) {
      let totalQty = 0;
      cartItems.forEach((item) => {
        // Skip items with "custom" in the name
        if (item.name?.toLowerCase().includes("custom")) return;

        if (Array.isArray(item.sizes)) {
          totalQty += item.sizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
        } else if (item.quantity) {
          totalQty += item.quantity;
        }
      });

      const pairs = Math.floor(totalQty / 2);
      const autoDiscountAmount = pairs * 0;

      if (pairs > 0) {
        // Prevent infinite render loops by checking if values actually changed
        if (appliedCoupon?.discount !== autoDiscountAmount || appliedCoupon?.code !== "BUY_2_PROMO") {
          onCouponApplied(autoDiscountAmount, "BUY_2_PROMO");
        }
      } else if (isAlreadyBuy2) {
        // Remove if user reduces quantity below a pair
        onCouponRemoved?.();
      }
    }
  }, [cartItems, appliedCoupon, onCouponApplied, onCouponRemoved]);

  const noCouponsAvailable = coupons.length === 0;

  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percent" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`;

  const applyCoupon = async (codeFromList?: string) => {
    const codeToApply = (codeFromList || couponCode).toUpperCase().trim();
    if (!codeToApply) {
      setMessage("Please enter a coupon code");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // === AIJIM50 Custom Logic ===
      if (codeToApply === "AIJIM50") {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", currentUser?.id)
          .eq("coupon_code->>code", "AIJIM50");

        if (orderData && orderData.length > 0) {
          setMessage("AIJIM50 already used for your first order");
          setMessageType("error");
          toast.error("AIJIM50 already used");
          return;
        }

        let totalQuantity = 0;
        cartItems.forEach((item) => {
          if (Array.isArray(item.sizes)) {
            totalQuantity += item.sizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
          } else if (item.quantity) {
            totalQuantity += item.quantity;
          }
        });

        onCouponApplied(totalQuantity * 50, "AIJIM50");
        setMessage(`AIJIM50 applied!`);
        setMessageType("success");
        toast.success(`AIJIM50 applied!`);
        setCouponCode("");
        return;
      }

      // === Normal Coupon Validation ===
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code_input: codeToApply,
        cart_total: cartTotal,
        user_id_input: currentUser?.id || null,
      });

      if (error) throw error;
      const result = data?.[0];

      if (result?.valid) {
        onCouponApplied(result.discount_amount, codeToApply);
        setMessage(result.message);
        setMessageType("success");
        toast.success(`Coupon applied!`);
        setCouponCode("");
      } else {
        setMessage(result?.message || "Invalid coupon");
        setMessageType("error");
        toast.error(result?.message || "Invalid coupon");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error applying coupon");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved?.();
    setMessage("");
    setMessageType("");
    toast.success("Coupon removed");
  };

  return (
    <div className="w-full h-full p-1 mb-6">
      <div className="flex gap-3 mb-4">
        {/* If a MANUAL coupon is applied, show it in a read-only box with REMOVE button. 
            If it's the AUTO BUY2_PROMO or empty, show the input field. */}
        {appliedCoupon && appliedCoupon.code !== "BUY_2_PROMO" && appliedCoupon.code !== "" ? (
          <>
            <Input
              type="text"
              value={appliedCoupon.code}
              readOnly
              className="flex-1 text-xs shadow-sm tracking-[1px] rounded-none bg-black border border-gray-300 text-white font-semibold"
            />
            <Button
              onClick={removeCoupon}
              className="bg-red-700 hover:bg-red-800 border border-gray-300 tracking-[1px] rounded-none text-white font-inter font-bold uppercase px-6"
            >
              REMOVE
            </Button>
          </>
        ) : (
          <>
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 text-xs tracking-[1px] shadow-sm rounded-none"
              disabled={loading}
            />
            <Button
              onClick={() => applyCoupon()}
              disabled={loading}
              className="bg-black border text-xs border-gray-300 tracking-[1px] text-white rounded-none hover:bg-gray-900 font-inter font-bold uppercase px-6"
            >
              {loading ? "APPLYING..." : "APPLY"}
            </Button>
          </>
        )}
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`text-xs mb-3 font-semibold tracking-[1px] ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
          {message}
        </div>
      )}

      {/* Applied Coupon Summary */}
      {appliedCoupon && appliedCoupon.code !== "" && (
        <div className="mb-4 p-2 bg-zinc-900/50 border border-zinc-800">
          <div className="text-sm text-white font-bold tracking-[1px]">
            {appliedCoupon.code === "BUY_2_PROMO" ? "Bulk Discount: " : "Active Coupon: "}
            <span className="text-yellow-300 underline ml-1">
              {appliedCoupon.code} {appliedCoupon.discount > 0 && `(-₹${appliedCoupon.discount})`}
            </span>
          </div>
        </div>
      )}

      {/* Coupons List Section */}
      <div className="mt-3 w-full border border-gray-700 rounded-none overflow-hidden shadow-md">
        {noCouponsAvailable ? (
          <div className="p-4 text-center bg-black text-white text-md font-semibold">
            No coupons available.
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex justify-between items-center w-full p-3 border-b border-gray-700 bg-black"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
                  Available Coupons
                </h3>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expanded && (
              <div className="max-h-56 overflow-y-auto p-3 bg-black">
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center border border-gray-700 p-3 rounded-none hover:bg-[#222] transition-all"
                    >
                      <div>
                        <p className="font-semibold text-yellow-400 text-sm uppercase tracking-wider">{c.code}</p>
                        <p className="text-xs text-gray-300 font-medium">{formatDiscount(c)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyCoupon(c.code)}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold px-2 py-1.5 rounded-none"
                      >
                        APPLY
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CouponSection;