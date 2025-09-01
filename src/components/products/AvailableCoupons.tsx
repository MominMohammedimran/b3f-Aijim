import React, { useState, useEffect } from 'react';
import { Ticket, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number | null;
  active: boolean | null;
  valid_to: string;
  valid_from: string;
  created_at: string;
  updated_at: string;
}

interface AvailableCouponsProps {
  productPrice: number;
}

const AvailableCoupons: React.FC<AvailableCouponsProps> = ({ productPrice }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [productPrice]);

  const fetchAvailableCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('active', true)
        .gte('valid_to', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .order('discount_value', { ascending: false });

      if (error) throw error;
      
      // Filter coupons based on min_order_amount and max_uses
      const filteredCoupons = (data || []).filter(coupon => {
        const minOrderAmount = coupon.min_order_amount || 0;
        const maxUses = coupon.max_uses || 999999;
        const currentUses = coupon.current_uses || 0;
        
        return productPrice >= minOrderAmount && currentUses < maxUses;
      });
      
      setCoupons(filteredCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
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
      console.error('Failed to copy:', error);
      toast.error('Failed to copy coupon code');
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `₹${coupon.discount_value} OFF`;
    }
  };

  const calculateSavings = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return Math.min((productPrice * coupon.discount_value) / 100, productPrice);
    } else {
      return Math.min(coupon.discount_value, productPrice);
    }
  };

  if (loading) {
    return (
      <div className="p-4 w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-600 mt-4">
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
      <div className="p-4 w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-600 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Ticket className="w-5 h-5 text-yellow-300" />
          <h3 className="text-lg font-semibold text-yellow-300">Available Coupons</h3>
        </div>
        <p className="text-gray-300 text-sm">No coupons available for this product at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-600 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="w-5 h-5 text-yellow-300" />
        <h3 className="text-lg font-semibold text-yellow-300">Available Coupons</h3>
      </div>
      
      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 hover:bg-gray-700/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {formatDiscount(coupon)}
                  </span>
                  <span className="text-green-400 text-sm font-semibold">
                    Save ₹{calculateSavings(coupon).toFixed(0)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Get {formatDiscount(coupon)} on your order
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-white font-mono bg-gray-800 px-3 py-1 rounded border-2 border-dashed border-gray-500 text-sm font-bold">
                    {coupon.code}
                  </span>
                  {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                    <span className="text-xs text-gray-400">
                      Min. order: ₹{coupon.min_order_amount}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(coupon.code)}
                className="ml-3 bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-500 hover:border-yellow-400"
              >
                {copiedCode === coupon.code ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          💡 Copy the coupon code and apply it during checkout to get the discount
        </p>
      </div>
    </div>
  );
};

export default AvailableCoupons;