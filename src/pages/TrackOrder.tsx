import React from 'react';
import { useParams, Link ,useLocation} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, MapPin, Clock } from 'lucide-react';
import OrderTrackingStatus from '../components/orders/OrderTrackingStatus';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import OrderLoadingState from '../components/orders/OrderLoadingState';
import OrderErrorState from '../components/orders/OrderErrorState';

const TrackOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, loading, error } = useOrderTracking();
  const tracking = orders.find((order) => order.order_number=== id);
const location = useLocation();
const order = location.state?.order;

const orderStatus = order?.status ?? 'pending';

const getEstimatedDeliveryMessage = (orderStatus: string) => {
  switch (orderStatus) {
    case 'processing':
      return 'Processing at warehouse';
    case 'confirmed':
      return 'Estimated delivery in 5–7 days';
    case 'shipped':
      return 'Estimated delivery in 5-8 days';
    case 'delivered':
      return 'Delivered successfully';

    // ✅ New return & refund statuses
    case 'return-accepted':
      return 'Return request accepted';
    case 'return-processing':
      return 'Return is being processed';
    case 'return-picked':
      return 'Item picked by courier';
    case 'return-warehouse':
      return 'Returned to warehouse';
    case 'payment-refund':
      return 'Refund initiated';
    case 'payment-refund-successfull':
      return 'Refund completed';

    default:
      return 'To be confirmed';
  }
};

const getCurrentLocation = (orderStatus: string) => {
  switch (orderStatus) {
    case 'processing':
    case 'confirmed':
      return 'Processing at warehouse';
    case 'shipped':
      return 'Shipped from warehouse';
    case 'out_for_delivery':
      return 'Out for delivery';
    case 'delivered':
      return tracking.shippingAddress.address || 'Delivered to customer';
    case 'cancelled':
      return 'Order cancelled';

    // ✅ New return & refund statuses
    case 'return-accepted':
      return 'Return approved';
    case 'return-processing':
      return 'Return processing ';
    case 'return-picked':
      return 'Courier picked the item';
    case 'return-warehouse':
      return 'Item at warehouse';
    case 'payment-refund':
      return 'Refund is being processed';
    case 'payment-refund-successfull':
      return 'Refund sent to customer';

    default:
      return 'Awaiting fulfillment';
  }
};

 
  
  const getWhatsappMessage = () => {
  const statusText = getEstimatedDeliveryMessage(tracking.status);
  return encodeURIComponent(
    `Hello, I need help with my order.\n\n` +
    `Order ID: ${tracking.order_number}\n` +
    `Status: ${tracking.status}\n` +
    `Total: ₹${tracking.total || 'N/A'}\n` +
    `Estimated Delivery: ${statusText}\n\n` +
    `I have an issue with this order.`
  );
};


  

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh] mt-10">
          <OrderLoadingState />
        </div>
      </Layout>
    );
  }

  if (error || !tracking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <OrderErrorState error={error || 'Error loading tracking information'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
     
      <div className="container mx-auto px-4 py-8 mt-10 max-w-4xl space-y-6">
        <div className="flex items-center mb-4 gap-2 max-w-full">
          <Link to={`/order-preview/${id}` }className="flex items-center justify-space-between font-bold leading-snug text-yellow-400 hover:text-yellow-500 ">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold leading-snug">Track Order</h1>
        </div>


        <div className="bg-gray-800 text-white  shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-200 mt-0.5" />
            <div>
              <p className="text-sm text-gray-200">Estimated Delivery</p>
              <p className="font-medium text-gray-200">{getEstimatedDeliveryMessage(orderStatus)}</p>
            </div>
          </div>
          <div className="flex flex-col text-gray-200 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-200 mb-2">Order #{tracking.order_number}</h2>
              <p className="text-gray-200">Placed on {new Date(tracking.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-green-600 px-2 py-2 mt-4 md:mt-0">
              <Package className="h-5 w-5 text-white-200" />
              <span className="font-medium capitalize">{orderStatus}</span>
            </div>
          </div>
        </div>

        <OrderTrackingStatus
          currentStatus={orderStatus}
          estimatedDelivery={getEstimatedDeliveryMessage(orderStatus)}
          cancellationReason={tracking.cancellation_reason}
        />

        {tracking.status !== 'cancelled' && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-200 mt-0.5" />
                  <div>
                    <p className="text-medium text-red-500">Current Location</p>
                    <p className="text-sm text-gray-200">{getCurrentLocation(orderStatus)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-200 mt-0.5" />
                  <div>
                    <p className="text-medium text-red-500">Estimated Delivery</p>
                    <p className="text-sm  text-gray-200">{getEstimatedDeliveryMessage(orderStatus)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-200 mt-0.5" />
                  <div>
                    <p className="text-medium text-red-500">Tracking ID</p>
                    <p className="text-sm  text-gray-200">{tracking.order_number || 'Not yet assigned'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-200 mt-0.5" />
                  <div>
                    <p className="text-medium text-red-500">Order Date</p>
                    <p className="text-sm text-gray-200">
                      {new Date(tracking.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2 text-center">
  💡 For any issue related to this order, you can contact us directly via WhatsApp:
</p>
          <a
  href={`https://wa.me/9176720808881?text=${getWhatsappMessage()}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
>
  💬 Chat on WhatsApp 
</a>

        </div>
{tracking.shippingAddress && (
  <div className="mt-6 max-w-md mx-auto bg-gray-900 text-white shadow p-5">
   <div className="items-center justify-between mb-3">
  <h3 className="text-lg font-semibold text-gray-200 items-center gap-2">
    📦 Shipping Address
    </h3>
    <span className="text-sm font-normal text-center pl-8 text-gray-200"> used for this order</span>
  
</div>

    <div className="text-sm text-gray-200 leading-relaxed space-y-1">
      <p className="font-medium text-gray-200">
        {tracking.shippingAddress.fullName || `${tracking.shippingAddress.firstName} ${tracking.shippingAddress.lastName}`}
      </p>
      <p>{tracking.shippingAddress.address}</p>
      <p>
        {tracking.shippingAddress.city}, {tracking.shippingAddress.state} -{' '}
        {tracking.shippingAddress.zipCode}
      </p>
      <p>{tracking.shippingAddress.country}</p>
      <hr className="my-2" />
      <p>
        📞{' '}
        <span className="font-medium text-gray-200">
          {tracking.shippingAddress.phone}
        </span>
      </p>
      <p>
        📧{' '}
        <span className="font-medium text-gray-200">
          {tracking.shippingAddress.email}
        </span>
      </p>
    </div>
  </div>
)}


        
      </div>
    </Layout>
  );
};

export default TrackOrder;
