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
  const [expanded, setExpanded] = useState(false);
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
    <div className="p-4 bg-muted-background border border-gray-700 rounded-none">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center w-full"
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-yellow-400" />
          <h3 className="text-md font-semibold text-yellow-400">Available Coupons</h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Dropdown scrollable area */}
      {expanded && (
        <div
          className="mt-3 max-h-40 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent scroll-smooth"
        >
          {coupons.length === 0 ? (
            <p className="text-gray-400 text-sm">No coupons available.</p>
          ) : (
            coupons.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center border border-gray-700 p-2 rounded-md"
              >
                <div>
                  <p className="font-semibold text-yellow-400 text-sm">{c.code}</p>
                  <p className="text-xs font-semibold text-gray-300">{formatDiscount(c)}</p>
                  <p className="text-xs font-semibold text-gray-500">
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
                  className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs"
                >
                  {copied === c.code ? "Copied!" : "Copy"}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableCoupons;
