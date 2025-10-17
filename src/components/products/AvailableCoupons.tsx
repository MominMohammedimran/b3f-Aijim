import React, { useState, useEffect } from "react";
import { Ticket } from "lucide-react";
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

const AvailableCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("coupons")
          .select(
            "id, code, discount_type, discount_value, valid_to, valid_from"
          )
          .eq("active", true);

        if (error) throw error;
        setCoupons(data || []);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        toast.error("Failed to load coupons");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percent"
      ? `${c.discount_value}% OFF`
      : `₹${c.discount_value} OFF`;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Copied "${code}"`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="w-full border border-gray-700 rounded-none overflow-hidden shadow-md p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
          Available Coupons
        </h3>
      </div>

      {/* Horizontal Scroll */}
      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No coupons available.
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="min-w-[220px] border border-gray-700 bg-[#111] rounded-none p-3 flex flex-col justify-between hover:bg-[#1a1a1a] transition-all"
            >
              <div>
                <p className="font-semibold text-yellow-400 text-sm uppercase tracking-wider mb-1">
                  {c.code}
                </p>
                <p className="text-xs text-gray-300 font-medium mb-1">
                  {formatDiscount(c)}
                </p>
                <p className="text-[11px] text-gray-300">
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
                onClick={() => handleCopy(c.code)}
                disabled={copied === c.code}
                className={`mt-3 text-xs font-semibold px-3 py-1 rounded bg-yellow-400 text-black hover:bg-yellow-300 ${
                  copied === c.code ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {copied === c.code ? "Copied!" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCoupons;
