import React, { useState, useEffect } from "react";
import { Ticket, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, valid_to, valid_from")
        .eq("active", true);
      setCoupons(data || []);
    })();
  }, []);

  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percent"
      ? `${c.discount_value}% OFF`
      : `₹${c.discount_value} OFF`;

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied "${code}"`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-3 w-full  border border-gray-700 rounded-none overflow-hidden shadow-md">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center w-full p-3  border-b border-gray-700 "
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

      {/* Scrollable content */}
      {expanded && (
        <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent scroll-smooth p-3 ">
          {coupons.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No coupons available.
            </p>
          ) : (
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
                    onClick={() => copy(c.code)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold px-3 py-1 rounded"
                  >
                    {copied === c.code ? "Copied!" : "Copy"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableCoupons;
