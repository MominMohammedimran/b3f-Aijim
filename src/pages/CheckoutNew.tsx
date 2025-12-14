import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useAddresses } from '@/hooks/useAddresses';
import SavedAddresses from '@/components/checkout/SavedAddresses';
import AddressForm from '@/components/checkout/AddressForm';
import { useCart } from '../context/CartContext';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import { formatPrice } from '@/lib/utils';
import CouponSection from '@/components/cart/CouponSection';
import RewardPointsSection from '@/components/cart/RewardPointsSection';
import { Button } from '@/components/ui/button';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveAddress: boolean;
};

const CheckoutNew = () => {
  const navigate = useNavigate();
  const seo = useSEO('/checkout');
  const { currentUser } = useAuth();
  const { currentLocation } = useLocationContext();
  const { cartItems, totalPrice } = useCart();
  const { settings: deliverySettings, loading: settingsLoading } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    saveAddress: false,
  });
  
  // Address management state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const { addresses, defaultAddress, loading: addressesLoading, deleteAddress, refetch: refetchAddresses } = useAddresses(currentUser?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  
  // Coupon and reward points state
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  
  const [appliedPoints, setAppliedPoints] = useState<{
    points: number;
    discount: number;
  } | null>(null);

  // Progress steps
  const steps = [
    { id: 'cart', label: 'CART', icon: ShoppingCart, completed: true },
    { id: 'checkout', label: 'CHECKOUT', icon: MapPin, active: true },
    { id: 'payment', label: 'PAYMENT', icon: CreditCard },
    { id: 'done', label: 'DONE', icon: CheckCircle }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!currentUser) {
      toast.error('Please sign in to checkout');
      navigate('/signin?redirectTo=/checkout');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (data) {
          setFormData(prev => ({
            ...prev,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || currentUser.email || '',
            phone: data.phone || '',
          }));
        }

        if (currentLocation) {
          setFormData(prev => ({
            ...prev,
            city: currentLocation.name,
          }));
        }

        // Set default address if available
        if (defaultAddress && !useNewAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormData(prev => ({
            ...prev,
            firstName: defaultAddress.first_name,
            lastName: defaultAddress.last_name,
            phone: defaultAddress.phone || '',
            address: defaultAddress.street,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipcode,
            country: defaultAddress.country,
          }));
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    loadProfile();
  }, [currentUser, cartItems, navigate, currentLocation]);

  // Handle coupon application
  const handleCouponApplied = (discount: number, code: string) => {
    setAppliedCoupon({ code, discount });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  // Handle reward points application
  const handlePointsApplied = (points: number, discount: number) => {
    setAppliedPoints({ points, discount });
  };

  const handlePointsRemoved = () => {
    setAppliedPoints(null);
  };

  // Address selection handlers
  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setIsAddressSaved(true);
      setFormData(prev => ({
        ...prev,
        firstName: address.first_name,
        lastName: address.last_name,
        phone: address.phone || '',
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipcode,
        country: address.country,
      }));
    }
  };

  const handleAddressSaved = () => {
    setIsAddressSaved(true);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setIsAddressSaved(false);
    setEditingAddress(null);
    setFormData(prev => ({
      ...prev,
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    }));
  };

  const handleDeleteAddress = async (addressId: string) => {
    const success = await deleteAddress(addressId);
    if (success && selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setIsAddressSaved(false);
    }
    return success;
  };

  const handleEditAddress = (address: any) => {
    setFormData({
      firstName: address.first_name,
      lastName: address.last_name,
      email: formData.email,
      phone: address.phone || '',
      address: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipcode,
      country: address.country,
      saveAddress: false,
    });
    setEditingAddress(address);
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setIsAddressSaved(false);
  };

  const redirect = (product: { id: string, pd_name: string }) => {
    if (!currentUser) {
      navigate('/signin?redirectTo=/checkout');
      return;
    } else if (!product.pd_name.toLowerCase().includes('custom printed')) {
      navigate(`/product/details/${product.id}`);
    }
  };

  const handleFormSubmit = async (values: FormData) => {
    if (!currentUser || !cartItems || cartItems.length === 0) {
      toast.error('Invalid checkout state');
      return;
    }

    setIsLoading(true);

    try {
      const shippingAddress = {
        fullName: `${values.firstName} ${values.lastName}`,
        ...values,
      };

      navigate('/payment', {
        state: {
          shippingAddress,
          cartItems,
          totalPrice,
          appliedCoupon,
          appliedPoints,
        },
      });

      toast.success('Shipping details saved');
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = totalPrice;
  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + deliveryFee);

  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="container mx-auto px-4 py-6 sm:py-8 mt-20">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link to="/cart" className="mr-4">
            <ArrowLeft size={24} className="text-foreground hover:text-primary transition-colors" />
          </Link>
          <h1 className="text-4xl font-bold uppercase tracking-wider">CHECKOUT</h1>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4 md:space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${step.completed 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : step.active 
                      ? 'bg-primary border-primary text-primary-foreground shadow-glow' 
                      : 'border-border text-muted-foreground'
                  }
                `}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`
                  ml-3 font-bold uppercase tracking-wider text-sm hidden md:block
                  ${step.completed || step.active ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 md:w-16 h-0.5 mx-4 transition-colors duration-300
                    ${step.completed ? 'bg-primary' : 'bg-border'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-6 text-primary">
                SHIPPING DETAILS
              </h2>
              
              {/* Saved Addresses */}
              {!addressesLoading && addresses.length > 0 && (
                <SavedAddresses
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onAddressSelect={handleAddressSelect}
                  onUseNewAddress={handleUseNewAddress}
                  useNewAddress={useNewAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onEditAddress={handleEditAddress}
                />
              )}
              
              {/* Address Form */}
              {(useNewAddress || addresses.length === 0 || addressesLoading) && (
                <AddressForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  onAddressSaved={handleAddressSaved}
                  editingAddress={editingAddress}
                  refetchAddresses={refetchAddresses}
                  onAddressUpdated={(updatedAddress) => {
                    setEditingAddress(null);
                    setUseNewAddress(false);
                    setSelectedAddressId(updatedAddress.id);
                    setIsAddressSaved(true);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coupon Section */}
            <div className="bg-card rounded-lg p-4 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <CouponSection 
                cartTotal={totalPrice}
                cartItems={cartItems}
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                appliedCoupon={appliedCoupon || undefined}
              />
            </div>

            {/* Reward Points Section */}
            <div className="bg-card rounded-lg p-4 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <RewardPointsSection
                cartTotal={totalPrice - (appliedCoupon?.discount || 0)}
                onPointsApplied={handlePointsApplied}
                onPointsRemoved={handlePointsRemoved}
                appliedPoints={appliedPoints || undefined}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-lg p-6 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow sticky top-24">
              <h3 className="text-2xl font-bold uppercase tracking-wider text-center mb-6 text-primary">
                ORDER SUMMARY
              </h3>

              <div className="space-y-4 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      onClick={() => redirect({ id: item.code, pd_name: item.name })}
                      className={`h-16 w-16 object-cover rounded border-2 shadow-sm transition-all duration-300 hover:scale-110
                        ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase tracking-wide">{item.name}</p>
                      {Array.isArray(item.sizes) ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.sizes.map((s: any, i: number) => (
                            <div key={i} className="bg-secondary border border-border px-2 py-1 rounded text-xs font-bold">
                              {s.size} × {s.quantity} 
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No sizes available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className='font-bold text-sm uppercase tracking-wider'>SUBTOTAL</span>
                  <span className='font-bold'>{formatPrice(totalPrice)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-primary">
                    <span className='font-bold text-sm uppercase tracking-wider'>COUPON</span>
                    <span className='font-bold'>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {appliedPoints && (
                  <div className="flex justify-between items-center text-primary">
                    <span className='font-bold text-sm uppercase tracking-wider'>POINTS</span>
                    <span className='font-bold'>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className='font-bold text-sm uppercase tracking-wider'>SHIPPING</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-primary">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t-2 border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className='font-bold uppercase tracking-wider'>TOTAL</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Continue to Payment Button */}
              {!isAddressSaved && (
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                    Please select or enter address to proceed
                  </p>
                </div>
              )}
            
              {isAddressSaved && (
                <Button 
                  onClick={() => handleFormSubmit(formData)} 
                  disabled={isLoading}
                  className="w-full font-bold uppercase tracking-wider text-lg py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutNew;