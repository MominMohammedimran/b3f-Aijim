import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
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
  const tracking = orders.find((order) => order.order_number === id);
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
        return 'Estimated delivery in 5–8 days';
      case 'delivered':
        return 'Delivered successfully';
      case 'return-acpt':
        return 'Return request accepted';
      case 'return-pcs':
        return 'Return is being processed';
      case 'return-pkd':
        return 'Item picked by courier';
      case 'return-wh':
        return 'Returned to warehouse';
      case 'payment-rf':
        return 'Refund initiated';
      case 'payment-rf-ss':
        return 'Refund completed';
      default:
        return 'To be confirmed';
    }
  };

  const getCurrentLocation = (orderStatus: string) => {
    const courierData = tracking?.courier?.rawData?.ShipmentData?.[0]?.Shipment;
    if (courierData?.Status?.StatusLocation) return courierData.Status.StatusLocation;

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
      case 'return-acpt':
        return 'Return approved';
      case 'return-pcs':
        return 'Return processing';
      case 'return-pkd':
        return 'Courier picked the item';
      case 'return-wh':
        return 'Item at warehouse';
      case 'payment-rf':
        return 'Refund is being processed';
      case 'payment-rf-ss':
        return 'Refund sent to customer';
      default:
        return 'Awaiting fulfillment';
    }
  };

  const getTrackingInfo = () => {
    const courierData = tracking?.courier?.rawData?.ShipmentData?.[0]?.Shipment;
    return {
      expectedDelivery: courierData?.ExpectedDeliveryDate || courierData?.PromisedDeliveryDate,
      destination: courierData?.Destination,
      pickupDate: courierData?.PickedupDate || courierData?.PickUpDate,
      courierPartner: 'Delhivery',
      currentStatus: courierData?.Status?.Status,
      statusLocation: courierData?.Status?.StatusLocation,
      statusDateTime: courierData?.Status?.StatusDateTime,
      receivedBy: courierData?.Status?.RecievedBy,
      instructions: courierData?.Status?.Instructions,
      scans: courierData?.Scans || []
    };
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <OrderLoadingState />
        </div>
      </Layout>
    );
  }

  if (error || !tracking) {
    return (
      <Layout>
        <div className="px-4 py-10">
          <OrderErrorState error={error || 'Error loading tracking information'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 mt-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/order-preview/${id}`}
            className="flex items-center text-yellow-400 hover:text-yellow-500 transition-colors font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
          <h1 className="text-lg font-semibold text-white tracking-wide">Track Order</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-x p-6 shadow-lg">
          <div className="flex flex-row items-center justify-between mb-3">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-yellow-400">{tracking.order_number}</h2>
              <p className="text-sm text-gray-400">
                Placed on {new Date(tracking.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="grid items-center justify-center text-center   font-semibold  text-white text-xs px-1 py-1  rounded-none">
              <p className='uppercase' >
              Payment
              </p>
              <h3 className='w-full bg-green-500 px-2 py-1'>
                    {order.payment_status}
              </h3>
             
            </div>
          </div>
         
        </div>

        {/* Progress */}
        <div className="bg-black border border-gray-800 rounded-xl p-1">
          <OrderTrackingStatus
            currentStatus={orderStatus}
            estimatedDelivery={getEstimatedDeliveryMessage(orderStatus)}
            cancellationReason={tracking.cancellation_reason}
          />
        </div>

        {/* Courier Section */}
        {tracking.status !== 'cancelled' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
              <Truck className="h-5 w-5" /> Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-yellow-400 font-semibold text-sm ">Current Location</p>
                  <p className="text-sm text-gray-300 text-xs">{getCurrentLocation(orderStatus)}</p>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold text-sm ">Expected Delivery</p>
                  <p className="text-sm text-gray-300 text-xs">
                    {getTrackingInfo().expectedDelivery
                      ? new Date(getTrackingInfo().expectedDelivery).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : getEstimatedDeliveryMessage(orderStatus)}
                  </p>
                </div>
                {getTrackingInfo().destination && (
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm">Destination</p>
                    <p className="text-sm text-gray-300 text-xs">{getTrackingInfo().destination}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">AWB Number</p>
                  <p className="text-xs text-gray-300">{tracking?.courier?.awb || 'Not yet assigned'}</p>
                </div>
                {getTrackingInfo().pickupDate && (
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm">Pickup Date</p>
                    <p className="text-xs text-gray-300">
                      {new Date(getTrackingInfo().pickupDate).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">Courier Partner</p>
                  <p className="text-xs text-gray-300">{getTrackingInfo().courierPartner}</p>
                </div>
              </div>
            </div>

            {getTrackingInfo().currentStatus && (
              <div className="mt-6 bg-gray-800 rounded-xl p-4">
                <h3 className="text-yellow-400 font-semibold mb-2 text-sm">Current Courier Update</h3>
                <p className="text-xs text-gray-300">
                  <span className="text-yellow-400 font-medium">Status:</span> {getTrackingInfo().currentStatus}
                </p>
                {getTrackingInfo().instructions && (
                  <p className="text-sm text-gray-300">
                    <span className="text-yellow-400 font-medium text-xs">Note:</span> {getTrackingInfo().instructions}
                  </p>
                )}
                {getTrackingInfo().statusDateTime && (
                  <p className="text-sm text-gray-300">
                    <span className="text-yellow-400 font-medium text-sm">Last Updated:</span>{' '}
                    {new Date(getTrackingInfo().statusDateTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Support */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">
            💡 For any issue related to this order, contact us on WhatsApp
          </p>
          <a
            href={`https://wa.me/9176720808881?text=${getWhatsappMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-full transition"
          >
            💬 Chat on WhatsApp
          </a>
        </div>

        {/* Shipping Address */}
        {tracking.shippingAddress && (
          <div className="bg-gray-900 text-white rounded-none shadow-lg p-6 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">📦 Shipping Address</h3>
            <div className="text-xs text-gray-300">
              <p>{tracking.shippingAddress.fullName || `${tracking.shippingAddress.firstName} ${tracking.shippingAddress.lastName}`}</p>
              <p>{tracking.shippingAddress.address}</p>
              <p>
                {tracking.shippingAddress.city}, {tracking.shippingAddress.state} - {tracking.shippingAddress.zipCode}
              </p>
              <p>{tracking.shippingAddress.country}</p>
              <hr className="my-2 border-gray-700" />
              <p>📞 {tracking.shippingAddress.phone}</p>
              <p>📧 {tracking.shippingAddress.email}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrder;
