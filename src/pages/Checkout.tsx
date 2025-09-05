
import { useState, useEffect } from 'react';
import { Link, useNavigate ,useLocation} from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

const Checkout = () => {
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
  const { addresses, defaultAddress, loading: addressesLoading, deleteAddress } = useAddresses(currentUser?.id);
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
      setIsAddressSaved(true); // Address is ready for payment
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
    setEditingAddress(null); // Clear editing mode
    // Clear form data for new address
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
      // If deleted address was selected, reset selection
      setSelectedAddressId(null);
      setIsAddressSaved(false);
    }
    return success;
  };

  const handleEditAddress = (address: any) => {
    // Pre-fill form with address data for editing
    setFormData({
      firstName: address.first_name,
      lastName: address.last_name,
      email: formData.email, // Keep current email
      phone: address.phone || '',
      address: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipcode,
      country: address.country,
      saveAddress: false, // User can choose to save as new or update
    });
    setEditingAddress(address); // Track which address is being edited
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
      <div className="container mx-auto px-4 py-6  sm:py-8 mt-12">
        <div className="flex items-center mb-6">
          <Link to="/cart" className="mr-2">
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4">Shipping Details</h2>
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
              
              {/* Address Form - Show when using new address or no saved addresses */}
              {(useNewAddress || addresses.length === 0 || addressesLoading) && (
                <AddressForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  onAddressSaved={handleAddressSaved}
                  editingAddress={editingAddress}
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

          {/* Coupon and Reward Points Section + Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coupon Section */}
            <CouponSection 
              cartTotal={totalPrice}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              appliedCoupon={appliedCoupon || undefined}
            />

            {/* Reward Points Section */}
            <RewardPointsSection
              cartTotal={totalPrice - (appliedCoupon?.discount || 0)}
              onPointsApplied={handlePointsApplied}
              onPointsRemoved={handlePointsRemoved}
              appliedPoints={appliedPoints || undefined}
            />


            {/* Order Summary */}
            <div className="bg-gray-800 p-4  border">
              <h3 className="font-medium text-center text-2xl mb-5">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      onClick={() => redirect({ id: item.code, pd_name: item.name })}
                      className={`h-16 w-16 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                        ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-lg ">{item.name}</p>
                      {Array.isArray(item.sizes) ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.sizes.map((s: any, i: number) => (
                            <div key={i} className="bg-white border px-1 py-1 font-bold  text-xs text-gray-700">
                              Size - {s.size} | Qty - {s.quantity} 
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-gray-600">Sizes : N/A</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

             <div className="space-y-2 mb-4 text-white">
                             <div className="flex justify-between">
                               <span>Subtotal</span>
                               <span className='font-bold'>{formatPrice(totalPrice)}</span>
                             </div>
                             {appliedCoupon && (
                               <div className="flex justify-between text-green-400 font-bold">
                                 <span>Coupon Discount</span>
                                 <span className='font-bold'>-{formatPrice(couponDiscount)}</span>
                               </div>
                             )}
                             {appliedPoints && (
                               <div className="flex justify-between text-blue-400 font-bold">
                                 <span>Points Discount</span>
                                 <span className='font-bold'>-{formatPrice(pointsDiscount)}</span>
                               </div>
                             )}
                             <div className="flex justify-between">
                               <span>Shipping</span>
                               <span>{deliveryFee === 0 ? <span className="line-through font-bold text-gray-300">Free Delivery</span> : `₹${deliveryFee}`}</span>
                             </div>
                             <div className="border-t pt-2">
                               <div className="flex justify-between font-semibold">
                                 <span>Total</span>
                                 <span className="underline font-bold">{formatPrice(finalTotal)}</span>
                               </div>
                              </div>
                            </div>

            {/* Continue to Payment Button - Moved to bottom of order summary */}
            {!isAddressSaved &&(
              <h3 className='font-semibold underline text-center '>please select a saved address or enter a new address to proceed with payment</h3>
            )}
          
            {isAddressSaved && (
              <Button 
                onClick={() => handleFormSubmit(formData)} 
                disabled={isLoading}
                className="w-full font-bold rounded-none text-lg mt-4"
              >
                {isLoading ? 'Processing...' : 'Continue to Payment'}
              </Button>
            )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
