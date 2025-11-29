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

  useEffect(() => {
    if (appliedCoupon) {
      setMessage("");
      setMessageType("");
    }
  }, [appliedCoupon]);

  // Fetch available coupons
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, valid_to, valid_from")
        .eq("active", true);

      setCoupons(data || []);
    })();
  }, []);

  const noCouponsAvailable = coupons.length === 0;

  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percent"
      ? `${c.discount_value}% OFF`
      : `₹${c.discount_value} OFF`;

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
          setMessage("AIJIM50 coupon already used for your first order");
          setMessageType("error");
          toast.error("AIJIM50 coupon already used for your first order");
          return;
        }

        let totalQuantity = 0;
        cartItems.forEach((item) => {
          if (Array.isArray(item.sizes)) {
            totalQuantity += item.sizes.reduce(
              (sum, s) => sum + (s.quantity || 0),
              0
            );
          } else if (item.quantity) {
            totalQuantity += item.quantity;
          }
        });

        const discountAmount = totalQuantity * 50;

        onCouponApplied(discountAmount, "AIJIM50");
        setMessage(`AIJIM50 applied: ₹${discountAmount} off!`);
        setMessageType("success");
        toast.success(`AIJIM50 applied: ₹${discountAmount} off!`);
        setCouponCode("");
        return;
      }

      // === Normal Coupon Validation via RPC ===
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code_input: codeToApply,
        cart_total: cartTotal,
        user_id_input: currentUser?.id || null,
      });

      if (error) throw error;

      const result = data?.[0];

      if (!result) {
        setMessage("Coupon not valid");
        setMessageType("error");
        toast.error("Coupon not valid");
        return;
      }

      if (result.valid) {
        setMessage(result.message);
        setMessageType("success");
        onCouponApplied(result.discount_amount, codeToApply);
        toast.success(`Coupon "${codeToApply}" applied`);
      } else {
        setMessage(result.message);
        setMessageType("error");
        toast.error(result.message);
      }

      setCouponCode("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to apply coupon. Please try again.");
      setMessageType("error");
      toast.error("Failed to apply coupon. Please try again.");
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
      {/* ------------------------------------------- */}
      {/* HIDE INPUT SECTION IF NO COUPONS AVAILABLE */}
      {/* ------------------------------------------- */}
      {!noCouponsAvailable && (
        <div className="flex gap-3 mb-4">
          {appliedCoupon ? (
            <Input
              type="text"
              value={appliedCoupon.code}
              readOnly
              className="flex-1 text-xs shadow-sm tracking-[1px] rounded-none bg-black border border-gray-300 text-white font-semibold"
            />
          ) : (
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 text-xs tracking-[1px] shadow-sm rounded-none"
              disabled={loading}
            />
          )}

          {appliedCoupon ? (
            <Button
              onClick={removeCoupon}
              className={`border border-gray-300 tracking-[1px] rounded-none text-white font-inter font-bold uppercase px-6 ${
                appliedCoupon
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              REMOVE
            </Button>
          ) : (
            <Button
              onClick={() => applyCoupon()}
              disabled={loading}
              className="bg-black border text-xs border-gray-300 tracking-[1px] text-white rounded-none hover:bg-gray-900 font-inter font-bold uppercase px-6"
            >
              {loading ? "APPLYING..." : "APPLY"}
            </Button>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`text-xs mb-3 ${
            messageType === "success"
              ? "text-green-500 font-semibold tracking-[1px]"
              : "text-red-500 font-semibold tracking-[1px]"
          }`}
        >
          {message}
        </div>
      )}

      {/* Active Coupon */}
      {appliedCoupon && (
        <div className="space-y-2">
          <div className="text-sm text-white font-bold tracking-[1px]">
            Active coupon:{" "}
            <span className="font-semibold text-sm text-yellow-300 underline tracking-[1px]">
              {appliedCoupon.code}
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------- */}
      {/* COUPON LIST / OR NO COUPONS MESSAGE */}
      {/* ------------------------------------------- */}
      <div className="mt-3 w-full border border-gray-700 rounded-none overflow-hidden shadow-md">
        {/* If no coupons – show only message */}
        {noCouponsAvailable ? (
          <div className="p-4 text-center bg-black text-white text-md font-semibold">
            No coupons available.
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex justify-between items-center w-full p-3 border-b border-gray-700"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
                  Available Coupons
                </h3>
              </div>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expanded && (
              <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-3">
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center border border-gray-700 p-3 rounded-none hover:bg-[#222] transition-all"
                    >
                      <div>
                        <p className="font-semibold text-yellow-400 text-sm uppercase tracking-wider">
                          {c.code}
                        </p>
                        <p className="text-xs text-gray-300 font-medium">
                          {formatDiscount(c)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Valid till{" "}
                          {new Date(c.valid_to).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
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
