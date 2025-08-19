
import { useState, useEffect } from 'react';
import { Link, useNavigate ,useLocation} from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import ShippingDetailsForm from '../components/checkout/ShippingDetailsForm';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import { formatPrice } from '@/lib/utils';
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
};

const Checkout = () => {
  const navigate = useNavigate();
const seo = useSEO('/checkout');
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
  });
 // Reward points state

  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { currentLocation } = useLocationContext();
  const { cartItems, totalPrice } = useCart();
  const { settings: deliverySettings, loading: settingsLoading } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
 const location = useLocation();
const passedCoupon = location.state?.appliedCoupon;
const passedPoints =location.state?.appliedPoints;
const [appliedCoupon, setAppliedCoupon] = useState<{
  code: string;
  discount: number;
} | null>(passedCoupon || null);
  const [appliedPoints, setAppliedPoints] = useState<{
    points: number;
    discount: number;
  } | null>(passedPoints ||null);
useEffect(() => {
  const savedCoupon = localStorage.getItem('appliedCoupon');
  const savedPoints=localStorage.getItem('appliedPoints');
  if (savedCoupon) {
    setAppliedCoupon(JSON.parse(savedCoupon));
  }
  if(savedPoints){
    setAppliedPoints(JSON.parse(savedPoints));
  }
}, []);

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
            phone: data.phone || '', // Use 'phone' instead of 'phone_number'
          }));
        }

        if (currentLocation) {
          setFormData(prev => ({
            ...prev,
            city: currentLocation.name,
          }));
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    loadProfile();
  }, [currentUser, cartItems, navigate, currentLocation]);

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
            <ArrowLeft size={24} className="text-yellow-400 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4">Shipping Details</h2>
                
              <ShippingDetailsForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-4  border">
              <h3 className="font-medium text-center text-2xl mb-5">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      onClick={() => redirect({ id: item.product_id, pd_name: item.name })}
                      className={`h-16 w-16 object-cover rounded border shadow-sm transition-transform duration-200 hover:scale-125
                        ${!item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'}`}
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-lg ">{item.name}</p>
                      {Array.isArray(item.sizes) ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.sizes.map((s: any, i: number) => (
                            <div key={i} className="bg-white border px-1 py-1 font-bold  text-xs text-gray-700">
                              Size : {s.size} × {s.quantity} [Qty]
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




            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
