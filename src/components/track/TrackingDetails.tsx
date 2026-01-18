
import React from 'react';
import { Truck, MapPin } from 'lucide-react';

interface TrackingDetailsProps {
  tracking: any;
  trackingData: any;
}

const TrackingDetails: React.FC<TrackingDetailsProps> = ({ tracking, trackingData }) => {
  if (!tracking) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-none p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-3">
        <Truck className="h-5 w-5 text-yellow-400" /> Delivery Details
      </h2>

      {tracking?.courier?.awb ? (
        <>
          {trackingData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Current Status</p>
                    <p className="text-xs text-gray-300">{trackingData.currentLocation}</p>
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Current Location</p>
                    <p className="text-xs text-gray-300">{trackingData.statusLocation || "Not Available"}</p>
                    <p className="font-medium text-xs text-yellow-400 mt-1">
                      <span className="font-medium text-white">Note -</span>{" "}
                      {trackingData.instructions || "Not Available"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Expected Delivery</p>
                    <p className="text-xs text-gray-300">
                      {trackingData.expectedDelivery
                        ? new Date(trackingData.expectedDelivery).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "To be confirmed"}
                    </p>
                  </div>

                  {trackingData.destination && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-yellow-400 font-semibold text-sm mb-1">Final Destination</p>
                      <p className="text-xs text-gray-300">{trackingData.destination}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">AWB Number</p>
                    <p className="text-xs text-gray-300">{tracking.courier?.awb}</p>
                  </div>

                  {trackingData.pickupDate && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-yellow-400 font-semibold text-sm mb-1">Pickup Date</p>
                      <p className="text-xs text-gray-300">{new Date(trackingData.pickupDate).toLocaleString()}</p>
                    </div>
                  )}

                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Courier Partner</p>
                    <p className="text-xs text-gray-300">{trackingData.courierPartner}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-yellow-400/50 rounded-xl p-4 bg-gray-800/50">
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Latest Scan
                </h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <p className="font-medium text-yellow-400">
                    <span className="font-medium text-white">Status -</span>{" "}
                    {trackingData.currentLocation}
                  </p>
                  <p className="font-medium text-yellow-400">
                    <span className="font-medium text-white">Time -</span>{" "}
                    {trackingData.statusDateTime
                      ? new Date(trackingData.statusDateTime).toLocaleString()
                      : "Not Available"}
                  </p>
                  <p className="font-medium text-yellow-400">
                    <span className="font-medium text-white">Note -</span>{" "}
                    {trackingData.instructions || "Not Available"}
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-400">
          <p className="text-yellow-400 font-semibold text-sm mb-1">Current Status</p>
          <p className="text-sm text-gray-300">{tracking.status}</p>
          <p className="text-xs text-gray-400 mt-1">AWB not yet assigned. Check back later!</p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-gray-800">
        <p className="text-gray-400 text-sm mb-3">
          💡 Need help? Chat with support:
        </p>
        <a
          href={`https://wa.me/917672080881?text=Hello, I need help with my order ${tracking.order_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
        >
          💬 Chat on WhatsApp
        </a>
      </div>

      {tracking?.shippingAddress && (
        <div className="mt-6 max-w-md mx-auto bg-gray-800 rounded-none p-2 shadow-inner border border-gray-700">
          <div className="flex flex-wrap items-center mb-3 border-b border-gray-700 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📦 Shipping Address
            </h3>
            <span className="text-xs font-semibold text-gray-300 ml-5">
              used for this delivery
            </span>
          </div>
          <div className="text-sm text-gray-300 leading-relaxed space-y-1 mt-3">
            <p className="font-bold text-yellow-400">
              {tracking.shippingAddress.fullName ||
                `${tracking.shippingAddress.firstName || ""} ${
                  tracking.shippingAddress.lastName || ""
                }`.trim()}
            </p>
            <p>{tracking.shippingAddress.address || "Not Available"}</p>
            <p>
              {tracking.shippingAddress.city || "Not Available"},{" "}
              {tracking.shippingAddress.state || ""} -{" "}
              <span className="font-semibold">
                {tracking.shippingAddress.zipCode || "N/A"}
              </span>
            </p>
            <p>{tracking.shippingAddress.country || "India"}</p>
            <hr className="my-2 border-gray-700" />
            <p>
              📞{" "}
              <span className="font-medium">
                {tracking.shippingAddress.phone || "Not Available"}
              </span>
            </p>
            <p>
              📧{" "}
              <span className="font-medium">
                {tracking.shippingAddress.email || "Not Available"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingDetails;
