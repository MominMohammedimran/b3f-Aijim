import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface CouponSectionProps {
  cartTotal: number;
  onCouponApplied: (discount: number, code: string) => void;
  onCouponRemoved?: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

const CouponSection: React.FC<CouponSectionProps> = ({
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
      setMessage('Failed to apply coupons');
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
    <div className="bg-gray-800 p-6 border mb-6">
      <h3 className="font-space-grotesk font-bold text-white mb-4">APPLY COUPON</h3>
      
      <div className="flex gap-3 mb-4">
       {appliedCoupon ? (
  <Input
    type="text"
    value={appliedCoupon.code}
    readOnly
    className="flex-1  shadow-sm tracking-[1px] rounded-none bg-red-500 text-white font-semibold"
  />
) : (
  <Input
    type="text"
    placeholder="Enter coupon code"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
    className="flex-1  tracking-[1px] shadow-sm"
    disabled={loading}
  />
)}

        {appliedCoupon ? (
          <Button 
            onClick={removeCoupon}
            className="bg-red-600  tracking-[1px] rounded-none text-white hover:bg-red-700 font-inter font-bold uppercase px-6"
          >
            REMOVE
          </Button>
        ) : (
          <Button 
            onClick={applyCoupon}
            disabled={loading}
            className="bg-black tracking-[1px] text-white rounded-none hover:bg-gray-900 font-inter font-bold uppercase px-6"
          >
            {loading ? 'APPLYING...' : 'APPLY'}
          </Button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`text-sm mb-3 ${messageType === 'success' ? 'text-green-500 font-semibold tracking-[1px] ' : 'text-red-500 font-semibold tracking-[1px]'}`}>
          {message}
        </div>
      )}

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="space-y-2">
         
          <div className="text-m text-yellow-400 font-bold tracking-[1px]">
            Active coupon : <span className="font-bold underline tracking-[1px] "> {appliedCoupon.code} </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;