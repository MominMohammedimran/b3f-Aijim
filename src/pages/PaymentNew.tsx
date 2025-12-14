import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, Shield, CreditCard, Smartphone, Banknote, Lock } from 'lucide-react';
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

const PaymentNew = () => {
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
  const rewardPointsUsed = appliedPoints?.discount || 0;
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

  const paymentMethods = [
    {
      id: 'cards',
      title: 'CREDIT / DEBIT CARDS',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
      popular: true
    },
    {
      id: 'upi',
      title: 'UPI',
      description: 'PhonePe, Google Pay, Paytm',
      icon: Smartphone
    },
    {
      id: 'netbanking',
      title: 'NET BANKING',
      description: 'All major banks supported',
      icon: Banknote
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/checkout" className="mr-4">
              <ArrowLeft size={24} className="text-foreground hover:text-primary transition-colors" />
            </Link>
            <h1 className="text-4xl font-bold uppercase tracking-wider">PAYMENT</h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold uppercase tracking-wider">
                CANCEL ORDER
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-2 border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold uppercase tracking-wider">CANCEL ORDER</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-bold uppercase tracking-wider">KEEP ORDER</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelOrder} 
                  disabled={loading} 
                  className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider"
                >
                  {loading ? 'CANCELLING...' : 'CANCEL ORDER'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Payment Methods & Security */}
          <div className="space-y-6">
            {/* Applied Discounts Section */}
            {(appliedCoupon || rewardPointsUsed > 0) && (
              <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
                <h3 className="text-xl font-bold uppercase tracking-wider mb-4 text-primary">APPLIED DISCOUNTS</h3>
                <div className="space-y-3">
                  {appliedCoupon && (
                    <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
                      <span className="font-bold text-sm uppercase tracking-wider">
                        COUPON: <span className="text-primary">{appliedCoupon.code}</span>
                      </span>
                      <span className="font-bold text-primary">-₹{appliedCoupon.discount}</span>
                    </div>
                  )}
                  {rewardPointsUsed > 0 && (
                    <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
                      <span className="font-bold text-sm uppercase tracking-wider">
                        REWARD POINTS: <span className="text-primary">{rewardPointsUsed}</span>
                      </span>
                      <span className="font-bold text-primary">-₹{rewardPointsUsed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-6 text-primary">
                PAYMENT METHODS
              </h2>

              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="relative p-4 border-2 border-border rounded-lg hover:border-primary transition-all duration-300 hover:shadow-glow group cursor-pointer"
                  >
                    {method.popular && (
                      <div className="absolute -top-2 left-4 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wider rounded">
                        POPULAR
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <method.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold uppercase tracking-wider">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 border-2 border-border rounded-full group-hover:border-primary transition-colors duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Razorpay Checkout */}
              <div className="border-t-2 border-border pt-6">
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
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-bold text-xl uppercase tracking-wider text-center mb-4 text-primary">
                SECURE PAYMENT
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider">256-BIT SSL ENCRYPTION</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>

          {/* Right: Secure Payment Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <h3 className="font-bold text-xl uppercase tracking-wider mb-4 text-primary">PAYMENT SECURITY</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-bold text-sm uppercase tracking-wider">256‑BIT SSL ENCRYPTION</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-bold text-sm uppercase tracking-wider">PCI DSS COMPLIANT</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-bold text-sm uppercase tracking-wider">MULTIPLE PAYMENT OPTIONS</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-bold text-sm uppercase tracking-wider">INSTANT CONFIRMATION</span>
                </li>
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <h3 className="font-bold text-xl uppercase tracking-wider mb-4 text-primary text-center">
                TRUSTED BY THOUSANDS
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">50K+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ORDERS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">UPTIME</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SUPPORT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentNew;