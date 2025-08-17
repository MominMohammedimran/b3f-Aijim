
import React from 'react';
import { formatPrice } from '@/lib/utils';

interface CouponPaymentSectionProps {
  appliedCoupon?: {
    code: string;
    discount: number;
  };
  appliedPoints?: {
    points: number;
    discount: number;
  };
  cartTotal: number;
}

const CouponPaymentSection: React.FC<CouponPaymentSectionProps> = ({
  appliedCoupon,
  appliedPoints,
  cartTotal
}) => {
  if (!appliedCoupon && !appliedPoints) return null;

  const totalDiscount = (appliedCoupon?.discount || 0) + (appliedPoints?.discount || 0);
  const originalPrice = cartTotal + totalDiscount;

  return (
    <div className="bg-gray-800 p-4 border rounded-lg mb-4">
      <h3 className="font-semibold text-white mb-3">APPLIED DISCOUNTS</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-200 line-through">
            Original price: {formatPrice(originalPrice)}
          </span>
        </div>
        
        {appliedCoupon && (
          <>
            <div className="text-yellow-400 font-bold">
              Active coupon: {appliedCoupon.code}
            </div>
            <div className="text-green-400 font-bold">
              Coupon discount: -{formatPrice(appliedCoupon.discount)}
            </div>
          </>
        )}
        
        {appliedPoints && (
          <>
            <div className="text-blue-400 font-bold">
              Reward points used: {appliedPoints.points} points
            </div>
            <div className="text-blue-400 font-bold">
              Points discount: -{formatPrice(appliedPoints.discount)}
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
          <span className="font-bold text-white">
            Final price: {formatPrice(cartTotal)}
          </span>
        </div>
        
        <div className="text-green-400 font-bold">
          You saved: {formatPrice(totalDiscount)}
        </div>
      </div>
    </div>
  );
};

export default CouponPaymentSection;
