
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';
import { Button } from '@/components/ui/button';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { cartItems, totalPrice, clearCart, removeSizeFromCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  const { settings: deliverySettings, loading: settingsLoading, refetch: refetchSettings } = useDeliverySettings();

  const shippingAddress = location.state?.shippingAddress;
  const appliedCoupon = location.state?.appliedCoupon;
  const appliedPoints = location.state?.appliedPoints;
  const deliveryFee = deliverySettings.delivery_fee;
  const rewardPointsUsed= appliedPoints?.discount || 0;
  const rewardPointsDiscount = rewardPointsUsed;
  const couponDiscount = appliedCoupon?.discount || 0;

  const finalTotal = Math.max(0, totalPrice + deliveryFee - rewardPointsDiscount - couponDiscount);

  useEffect(() => {
    if (!currentUser || !cartItems.length || !shippingAddress) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, shippingAddress, navigate]);

  useEffect(() => {
    refetchSettings();
  }, [refetchSettings]);

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/order-complete');
  };

  const handlePaymentError = () => {
    // Don't show error toast here as it's handled in RazorpayCheckout
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await clearCart();
      toast.success('Order cancelled successfully');
      navigate('/cart');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
<CheckoutStepper currentStep={3}/>
        <div className="flex items-center justify-between mt-3 mb-6">
          
          <div className="flex items-center justify-center ">
            <Link to="/checkout" className="mr-4">
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <h1 className="text-xl font-bold leading-snug">Payment</h1>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="items-center justify-center px-1 py-1 rounded-none font-semibold text-black bg-white hover:text-red-500 hover:bg-white">
               
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelOrder} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? 'Cancelling...' : 'Cancel Order'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Order Summary & Payment */}
          <div className="space-y-6">
            {/* Applied Discounts Section */}
            {(appliedCoupon || rewardPointsUsed > 0) && (
              <div className="bg-gray-800 shadow-sm border p-4">
                <h3 className="text-md font-semibold text-white mb-3">Applied Discounts</h3>
                <div className="space-y-0.5 text-sm">
                  {appliedCoupon && (
                    <div className="flex justify-between  items-center">
                      <span className="text-gray-200 font-medium tracking-[2px]">Coupon Applied - {' '} 
                        <span className="underline font-medium text-md text-yellow-400">
                      {appliedCoupon.code}
                      </span>
                      </span>
                          </div>
                  )}
                  {rewardPointsUsed > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-200 font-medium tracking-[2px]">Reward Points Used - {' '}
                         <span className="text-yellow-300 text-md font-medium underline">
                      
                      {rewardPointsUsed}</span></span>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Gateway */}
            <div className="bg-gray-800 shadow-sm border">
              <h2 className="text-lg text-yellow-400 border-b border-gray-100 font-semibold text-center pt-3 mb-2">Payment Summary </h2>

              {/* Razorpay Checkout 
              <div>
                <RazorpayCheckout
                  amount={finalTotal}
                  cartItems={cartItems}
                  shippingAddress={shippingAddress}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  OrderId={undefined}
                  RewardPoints={rewardPointsUsed}
                  onRemoveSize={removeSizeFromCart}
                  onRemoveItem={removeFromCart}
                />
              </div>*/}
                {/* Cashfree Checkout */}
              <div>
                <CashfreeCheckout
                  amount={finalTotal}
                  cartItems={cartItems}
                  shippingAddress={shippingAddress}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  OrderId={undefined}
                  RewardPoints={rewardPointsUsed}
                  onRemoveSize={removeSizeFromCart}
                  onRemoveItem={removeFromCart}
                />
              </div>

            </div>
          </div>

          {/*shipping Address */}
      <div className="bg-gray-900 text-white p-4 rounded-none shadow-md border border-gray-700">
  <h3 className="text-sm font-semibold mb-3 border-b border-gray-700 pb-2 leading-relaxed">
    Shipping Address Used - Order
  </h3>

  <p className="text-xs leading-relaxed text-gray-300 font-semibold">
    {shippingAddress.firstName || shippingAddress.lastName ? (
      <>
        <span className="text-yellow-400 uppercase font-semibold">
          {shippingAddress.firstName} {shippingAddress.lastName}
        </span>
        ,{" "}
      </>
    ) : null}

    {shippingAddress.address && <>{shippingAddress.address}, </>}
    {shippingAddress.city && <>{shippingAddress.city}, </>}
    {shippingAddress.state && <>{shippingAddress.state} </>}
    {shippingAddress.zipCode && <>- {shippingAddress.zipCode}, </>}
    {shippingAddress.country && <>{shippingAddress.country}</>},

    {/* Optional contact info */}
    {shippingAddress.phone && (
      <>
        {" "}
        <span className="text-yellow-400 font-medium">Phone no - </span>{" "}
        {shippingAddress.phone}
      </>
    )},
    {shippingAddress.email && (
      <>
        {" "}
        <span className="text-yellow-400 font-medium">Email - </span>{" "}
        {shippingAddress.email}
      </>
    )}
  </p>
</div>


          {/* Right: Secure Payment Info */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-4">
              <h3 className="font-medium text-sm text-yellow-500 mb-2">Secure Payment with Razorpay </h3>
              <ul className="text-xs text-white list-disc font-semibold list-inside space-y-1">
                <li className="font-semibold uppercase ">256‑bit SSL encryption</li>
                <li className="font-semibold uppercase">PCI DSS compliant</li>
                <li className="font-semibold uppercase">Multiple payment options</li>
                <li className="font-semibold uppercase">Instant payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;