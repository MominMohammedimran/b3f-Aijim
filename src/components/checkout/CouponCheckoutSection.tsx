import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface CouponCheckoutSectionProps {
  cartTotal: number;
  onCouponApplied: (discount: number, code: string) => void;
  onCouponRemoved?: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

const CouponCheckoutSection: React.FC<CouponCheckoutSectionProps> = ({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage('Please enter a coupon code');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('validate_coupon', {
          coupon_code_input: couponCode.toUpperCase(),
          cart_total: cartTotal
        });

      if (error) throw error;

      const result = data[0];
      if (result.valid) {
        setMessage(result.message);
        setMessageType('success');
        onCouponApplied(result.discount_amount, couponCode.toUpperCase());
        setCouponCode('');
        toast.success(result.message);
      } else {
        setMessage(result.message);
        setMessageType('error');
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setMessage('Failed to apply coupon');
      setMessageType('error');
      toast.error('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved?.();
    setMessage('');
    setMessageType('');
    toast.success('Coupon removed');
  };

  const originalPrice = cartTotal + (appliedCoupon?.discount || 0);
  const discountedPrice = cartTotal;

  return (
    <div className="bg-gray-800 p-4 border rounded-lg mb-4">
      <h3 className="font-semibold text-white mb-3">APPLY COUPON</h3>
      
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
          disabled={loading || !!appliedCoupon}
        />
        {appliedCoupon ? (
          <Button 
            onClick={removeCoupon}
            className="bg-red-600 text-white bg-red-500 hover:bg-red-700"
          >
            REMOVE
          </Button>
        ) : (
          <Button 
            onClick={applyCoupon}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-900"
          >
            {loading ? 'APPLYING...' : 'APPLY'}
          </Button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`text-sm mb-2 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </div>
      )}

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-200 line-through">
              Original: {formatPrice(originalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">
              Discounted: {formatPrice(discountedPrice)}
            </span>
          </div>
          <div className="text-yellow-400 font-bold">
            Active: {appliedCoupon.code}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCheckoutSection;