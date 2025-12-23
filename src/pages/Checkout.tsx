import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
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
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';

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

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) setMaxHeight(contentRef.current.scrollHeight);
  }, [children]);

  return (
    <div className="bg-card rounded-none border border-gray-300 hover:border-primary transition-all duration-300 hover:shadow-glow">
      <button
        className="flex justify-between items-center w-full p-4 font-bold uppercase tracking-wider text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: isOpen ? maxHeight : 0 }}
      >
        <div ref={contentRef} className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const seo = useSEO('/checkout');
  const { currentUser } = useAuth();
  const { currentLocation } = useLocationContext();
  const { cartItems, totalPrice,totalPricePrinting } = useCart();
  const { settings: deliverySettings } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;

  const couponRef = useRef<HTMLDivElement | null>(null);
  const savedAddressesRef = useRef<HTMLDivElement | null>(null);

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

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const { addresses, loading: addressesLoading, deleteAddress, refetch: refetchAddresses } = useAddresses(currentUser?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number }>({ code: '', discount: 0 });
 const [appliedPoints, setAppliedPoints] = useState<{ points: number; discount: number }>({ points: 0, discount: 0 });

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

        if (currentLocation) setFormData(prev => ({ ...prev, city: currentLocation.name }));
      } catch (err) {}
    };

    loadProfile();
  }, [currentUser, cartItems, navigate, currentLocation]);

  const scrollToCoupon = (offset = -8) => {
    if (!couponRef.current) return;
    const top = couponRef.current.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const scrollToSavedAddresses = (offset = -8) => {
    if (!savedAddressesRef.current) return;
    const top = savedAddressesRef.current.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleAddressSelect = (addressId: string) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return;

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

    setTimeout(() => scrollToCoupon(-1), 150);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setIsAddressSaved(false);
    setEditingAddress(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: formData.email,
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      saveAddress: false,
    });
    
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

  const handleNewAddressSaved = (newAddress: any) => {
    refetchAddresses?.();
    if (newAddress?.id) {
      setSelectedAddressId(newAddress.id);
      setUseNewAddress(false);
      setIsAddressSaved(true);

      setFormData(prev => ({
        ...prev,
        firstName: newAddress.first_name || prev.firstName,
        lastName: newAddress.last_name || prev.lastName,
        phone: newAddress.phone || prev.phone,
        address: newAddress.street || prev.address,
        city: newAddress.city || prev.city,
        state: newAddress.state || prev.state,
        zipCode: newAddress.zipcode || prev.zipCode,
        country: newAddress.country || prev.country,
      }));

      // Scroll to saved addresses after adding new
      setTimeout(() => scrollToSavedAddresses(-12), 200);
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
 window.scrollTo(10, 0);
      navigate('/payment', {
        state: {
          shippingAddress,
          cartItems,
          totalPrice,
          appliedCoupon,
          appliedPoints,
          scrollToPayNow: true,
        },
      });

      toast.success('Shipping details saved');
    } catch {
      toast.error('Failed to process checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = totalPrice||0+totalPricePrinting||0;;
  const couponDiscount = appliedCoupon.discount;
const pointsDiscount = appliedPoints?.discount || 0;
const totalDiscount = couponDiscount + pointsDiscount;
const finalTotal = Math.max(0, (totalPrice||0+totalPricePrinting||0) - totalDiscount + deliveryFee); 


  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="container mx-auto px-4 py-4 sm:py-6 mt-20 rounded-none">
        <CheckoutStepper currentStep={2} />
        <div className="flex mt-4 items-center mb-8">
          <Link to="/cart" className="mr-4">
            <ArrowLeft size={24} className="text-foreground hover:text-primary transition-colors" />
          </Link>
          <h1 className="text-xl font-semibold uppercase tracking-wider">CHECKOUT</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 rounded-none gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 rounded-none" ref={savedAddressesRef}>
            <CollapsibleSection title="Shipping Details" defaultOpen>
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

              {(useNewAddress || addresses.length === 0 || addressesLoading) && (
                <AddressForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  onAddressSaved={(newAddress) => handleNewAddressSaved(newAddress)}
                  editingAddress={editingAddress}
                  refetchAddresses={refetchAddresses}
                  onAddressUpdated={(updatedAddress) => {
                    setEditingAddress(null);
                    setUseNewAddress(false);
                    if (updatedAddress?.id) {
                      setSelectedAddressId(updatedAddress.id);
                      setIsAddressSaved(true);
                      setTimeout(() => scrollToSavedAddresses(-12), 200);
                    }
                  }}
                />
              )}
            </CollapsibleSection>
          </div>

          {/* Right Sidebar */}
          <div className="rounded-none space-y-4">
            <div ref={couponRef}></div>
            <CollapsibleSection title="Apply Coupon" defaultOpen={true}>
              <CouponSection
                cartTotal={totalPrice}
                cartItems={cartItems}
                onCouponApplied={(discount, code) => setAppliedCoupon({ code, discount })}
                onCouponRemoved={() => setAppliedCoupon({ code: '', discount: 0 })}
                appliedCoupon={appliedCoupon}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Reward Points" defaultOpen={false}>
              <RewardPointsSection
  cartTotal={totalPrice - appliedCoupon.discount}
  onPointsApplied={(points, discount) => setAppliedPoints({ points, discount })}
  onPointsRemoved={() => setAppliedPoints(null)} // safe now
  appliedPoints={appliedPoints}
/>

            </CollapsibleSection>

            <CollapsibleSection title="Order Summary" defaultOpen={true}>
              <div className="space-y-3 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded border-2 shadow-sm transition-all duration-300"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase line-clamp-1 tracking-wide">{item.name}</p>
                      {Array.isArray(item.sizes) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.sizes.map((s: any, i: number) => (
                            <div key={i} className="bg-secondary border border-border px-2 py-1 rounded text-xs font-bold">
                              {s.size} x {s.quantity}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-wider">Subtotal</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  {appliedCoupon.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                 {appliedPoints?.discount > 0 && (
  <div className="flex justify-between text-blue-400">
    <span>Points</span>
    <span>-{formatPrice(pointsDiscount)}</span>
  </div>
)}


                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-wider">Shipping</span>
                    <span className="font-bold">{deliveryFee === 0 ? 'FREE' : `+ ₹${deliveryFee}`}</span>
                  </div>

                  <div className="border-t-2 border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider">TOTAL</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

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
                  className="w-full relative rounded-none font-bold uppercase tracking-wider text-lg py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
                </Button>
              )}
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
