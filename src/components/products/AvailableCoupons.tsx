import React, { useState, useEffect } from "react";
import { Ticket, Copy, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  valid_to: string;
  valid_from: string;
}

interface AvailableCouponsProps {
  productPrice: number;
}

const AvailableCoupons: React.FC<AvailableCouponsProps> = ({ productPrice }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [productPrice]);

  const fetchAvailableCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, valid_to, valid_from")
        .eq("active", true);
      

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy coupon code");
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    return coupon.discount_type === "percent"
      ? `Flat ${coupon.discount_value}% OFF`
      : `Flat ₹${coupon.discount_value} OFF`;
  };

  if (loading) {
    return (
      <div className="p-4 w-full bg-gray-900 rounded-md border border-gray-700 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-yellow-300" />
          <h3 className="text-lg font-semibold text-yellow-300">Available Coupons</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="p-4 w-full bg-gray-900 rounded-md border border-gray-700 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-yellow-300" />
          <h3 className="text-lg font-semibold text-yellow-300">Available Coupons</h3>
        </div>
        <p className="text-gray-400 text-sm">No coupons available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full bg-gray-900 rounded-md border border-gray-700 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="w-5 h-5 text-yellow-300" />
        <h3 className="text-lg font-semibold text-yellow-300">Available Coupons</h3>
      </div>

      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-gray-800 border border-gray-700 rounded- p-3"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandedCoupon(expandedCoupon === coupon.id ? null : coupon.id)
              }
            >
              <span className="text-white font-semibold text-sm font-bold">
                {coupon.code}
              </span>
              {expandedCoupon === coupon.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {expandedCoupon === coupon.id && (
              <div className="mt-3 space-y-0.5 text-sm text-gray-300 flex justify-between items-center">
                <div className="gap-2">
                <p className="font-semibold text-xs">{formatDiscount(coupon)}</p>
                 <p className="font-semibold text-xs">
                  Valid {" "}
                  {new Date(coupon.valid_to).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
               
                
                </div>
                 <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(coupon.code)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-500 hover:border-yellow-400"
                >
                  {copiedCode === coupon.code ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedCode === coupon.code ? "Copied!" : "Copy"}
                </Button>
               

                
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableCoupons;
