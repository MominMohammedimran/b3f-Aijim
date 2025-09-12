import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

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
  const { currentUser } = useAuth();

  // Clear messages when appliedCoupon changes
  useEffect(() => {
    if (appliedCoupon) {
      setMessage('');
      setMessageType('');
    }
  }, [appliedCoupon]);

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
          cart_total: cartTotal,
          user_id_input: currentUser?.id || null
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
      setMessage('Failed to validate coupon. Please try again.');
      setMessageType('error');
      toast.error('Failed to validate coupon. Please try again.');
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
    className="flex-1  shadow-sm tracking-[1px] rounded-none bg-black border border-gray-300 text-white font-semibold"
  />
) : (
  <Input
    type="text"
    placeholder="Enter coupon code"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
    className="flex-1  tracking-[1px] shadow-sm rounded-none "
    disabled={loading}
  />
)}

        {appliedCoupon ? (
          <Button 
            onClick={removeCoupon}
            className=" border border-gray-300  tracking-[1px] rounded-none text-white bg-red-500 hover:bg-red-700 font-inter font-bold uppercase px-6"
          >
            REMOVE
          </Button>
        ) : (
          <Button 
            onClick={applyCoupon}
            disabled={loading}
            className="bg-black border border-gray-300 tracking-[1px] text-white rounded-none hover:bg-gray-900 font-inter font-bold uppercase px-6"
          >
            {loading ? 'APPLYING...' : 'APPLY'}
          </Button>
        )}
      </div>

      {/* Messages - only show when no coupon is applied */}
      {message && !appliedCoupon && (
        <div className={`text-sm mb-3 ${messageType === 'success' ? 'text-green-500 font-semibold tracking-[1px] ' : 'text-red-300 font-semibold tracking-[1px]'}`}>
          {message}
        </div>
      )}

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="space-y-2">
         
          <div className="text-sm text-gray-100 font-semibold tracking-[1px]">
            Active coupon : <span className="font-semibold text-lg text-yellow-300 underline tracking-[1px] "> {appliedCoupon.code} </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;