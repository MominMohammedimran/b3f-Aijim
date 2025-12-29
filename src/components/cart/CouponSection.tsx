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
  const [couponshow, setcouponshow] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!appliedCoupon?.code) {
      setMessage("");
      setMessageType("");
    }
  }, [appliedCoupon]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, valid_to, valid_from")
        .eq("active", true);
      setCoupons(data || []);
    })();
  }, []);

  // Utility to calculate total quantity of eligible items
  const getTotalQuantity = () => {
    let total = 0;
    cartItems.forEach((item) => {
      if (item.name?.toLowerCase().includes("custom")) return;
      if (Array.isArray(item.sizes)) {
        total += item.sizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
      } else if (item.quantity) {
        total += item.quantity;
      }
    });
    return total;
  };

  // === AUTOMATIC BUY-2 LOGIC ===
  useEffect(() => {
    const isNoCoupon = !appliedCoupon || appliedCoupon.code === "";
    const isAlreadyBuy2 = appliedCoupon?.code === "BUY-2";

    if (isNoCoupon || isAlreadyBuy2) {
      const totalQty = getTotalQuantity();
      const pairs = Math.floor(totalQty / 2);
      const autoDiscountAmount = pairs * 0; // Adjust bulk value if needed

      if (pairs > 0) {
        if (appliedCoupon?.discount !== autoDiscountAmount || appliedCoupon?.code !== "BUY-2") {
          onCouponApplied(autoDiscountAmount, "BUY-2");
          setcouponshow(true);
          setMessage(`BUY-2 applied`);
          setMessageType("success");
        }
      } else if (isAlreadyBuy2) {
        onCouponRemoved?.();
      }
    }
  }, [cartItems, appliedCoupon, onCouponApplied, onCouponRemoved]);

  const applyCoupon = async (codeFromList?: string) => {
    let codeToApply = (codeFromList || couponCode).toUpperCase().trim();
   
  
    if (!codeToApply) {
      setMessage("Please enter a coupon code");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // 1. Check if user has already used this specific coupon
      const { data: orderData } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", currentUser?.id)
        .eq("coupon_code->>code", codeToApply);

      if (orderData && orderData.length > 0) {
        setMessage(`${codeToApply} already used for your first order`);
        setMessageType("error");
        toast.error(`${codeToApply} already used`);
        return;
      }

      // 2. DYNAMIC LOGIC: Extract number from code (e.g., BIG100 -> 100, SAVE50 -> 50)
      const match = codeToApply.match(/\d+$/); // Finds digits at the end of the string
      
       const  codeToApply2 = `${codeToApply}, BUY-2`;
    
      if (match) {
        const perItemDiscount = parseInt(match[0], 10);
        const totalQuantity = getTotalQuantity();
        const discountAmount =  perItemDiscount;

        onCouponApplied(discountAmount, codeToApply2);
        setMessage(`${codeToApply2} applied`);
        setMessageType("success");
        toast.success(`${codeToApply2} applied!`);
        setCouponCode("");
        return;
      }

      // 3. Fallback to Normal Coupon Validation (Fixed discounts/Percentage)
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code_input: codeToApply2,
        cart_total: cartTotal,
        user_id_input: currentUser?.id || null,
      });

      if (error) throw error;
      const result = data?.[0];

      if (result?.valid) {
        onCouponApplied(result.discount_amount, codeToApply2);
        setMessage(result.message);
        setMessageType("success");
        toast.success(`Coupon applied!`);
        setCouponCode("");
      } else {
        setMessage(result?.message || "Invalid coupon");
        setMessageType("error");
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

  const noCouponsAvailable = coupons.length === 0;
  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percent" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`;

  return (
    <div className="w-full h-full p-1 mb-6">
      <div className="flex gap-3 mb-4">
        {appliedCoupon && appliedCoupon.code !== "BUY-2" && appliedCoupon.code !== "" ? (
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

      {message && (
        <div className={`text-xs mb-3 font-semibold tracking-[1px] ${messageType === "success" ? "text-yellow-500" : "text-red-500"}`}>
          {message}
        </div>
      )}

      
        <div className="mb-4 p-2 bg-zinc-900/50 border border-zinc-800">
          <div className="space-y-2 mb-4">
  {/* Show Bulk Discount if the logic identifies it should be shown */}
  {couponshow && (
    <div className="p-2  border border-green-800/50">
      <div className="text-sm text-white font-bold tracking-[1px]">
      
        <span className="text-green-400  ml-1">
          Bulk Discount: BUY-2
        </span>
      </div>
    </div>
  )}

  {/* Show Manual Coupon if one is applied (excluding the auto-promo) */}
  {appliedCoupon && appliedCoupon.code !== "" && appliedCoupon.code !== "BUY-2" && (
    <div className="p-2 bg-zinc-900/50 border border-zinc-800">
      <div className="text-sm text-white font-bold tracking-[1px]">
     
        
     
      <span className="text-yellow-300  ml-1">
       Coupon: {appliedCoupon.code} 
        </span>
        </div>
    </div>
  )}
</div>
        </div>
     

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