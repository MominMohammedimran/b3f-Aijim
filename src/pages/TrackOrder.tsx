import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { ArrowLeft, Truck, MapPin } from "lucide-react";
import OrderLoadingState from "../components/orders/OrderLoadingState";
import OrderErrorState from "../components/orders/OrderErrorState";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { supabase } from "@/integrations/supabase/client";

interface TrackingData {
  shipment: any;
  currentStatus: string;
  currentLocation: string;
  history: any[];
  expectedDelivery: string | null;
  destination: string | null;
  pickupDate: string | null;
  courierPartner: string;
  statusDateTime: string | null;
  instructions: string | null;
  statusLocation: string | null;
}

interface Order {
  order_number: string;
  status: string;
  created_at: string;
  payment_status: string;
  total: number;
  cancellation_reason: string | null;
  courier?: { awb?: string };
  shippingAddress?: any;
}

const TRACKING_RETRY_INTERVAL = 10000;

const COURIER_STATUS_MAP: Record<string, string> = {
  Dispatched: "shipped",
        "In transit": "on-the-way",
        "Out for Delivery": "out-for-delivery",
        Delivered: "delivered",
        Undelivered: "undelivered",
        RTO: "return-picked",
        Cancelled: "cancelled",
};

const getFallbackTrackingData = (): TrackingData => ({
  shipment: null,
  currentStatus: "processing",
  currentLocation: "In transit",
  history: [],
  expectedDelivery: null,
  destination: null,
  pickupDate: null,
  courierPartner: "Delhivery",
  statusDateTime: null,
  instructions: null,
  statusLocation: null,
});

const TrackOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, loading, error } = useOrderTracking() as {
    orders: Order[];
    loading: boolean;
    error: string | null;
  };

  const tracking = orders.find((o) => o.order_number === id);

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const getEstimatedDeliveryMessage = useCallback((status: string) => {
    switch (status) {
      case "processing":
        return "Processing at warehouse";
      case "shipped":
        return "Estimated delivery in 5–8 days";
      case "out-for-delivery":
        return "Out for delivery today";
      case "delivered":
        return "Delivered successfully";
      case "return-picked":
        return "Return processing initiated";
      case "cancelled":
        return "Order cancelled";
      default:
        return "To be confirmed";
    }
  }, []);

  const currentTrackingStatus =
    trackingData?.currentStatus || tracking?.status || "processing";

  const fetchTracking = useCallback(async (awb: string, orderId: string) => {
    try {
      setLoadingTracking(true);
      setTrackingError(null);

      const { data, error } = await supabase.functions.invoke(
        "track-delhivery",
        {
          body: JSON.stringify({ awb, orderId }),
        }
      );

      if (error || !data?.data?.ShipmentData?.[0]?.Shipment) {
        setTrackingData(getFallbackTrackingData());
        return;
      }

      const shipment = data.data.ShipmentData[0].Shipment;

      const courierStatus = shipment.Status?.Status || "Unknown";
      const currentStatus = COURIER_STATUS_MAP[courierStatus] || "processing";

      const history = Array.isArray(shipment.Scans)
        ? shipment.Scans.map((scanObj: any) => ({
            status: scanObj.ScanDetail?.Scan || "In Transit",
            location: scanObj.ScanDetail?.ScannedLocation || "",
            timestamp:
              scanObj.ScanDetail?.ScanDateTime || new Date().toISOString(),
            instructions: scanObj.ScanDetail?.Instructions || "",
          })).sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        : [];

      setTrackingData({
        shipment,
        currentStatus,
        currentLocation:
          shipment.Status?.Status ||
          shipment.Origin ||
          shipment.Destination ||
          "In transit",
        history,
        expectedDelivery:
          shipment.ExpectedDeliveryDate ||
          shipment.PromisedDeliveryDate ||
          null,
        destination: shipment.Destination || null,
        pickupDate: shipment.PickedupDate || shipment.PickUpDate || null,
        courierPartner: "Delhivery",
        statusDateTime: shipment.Status?.StatusDateTime || null,
        instructions: shipment.Status?.Instructions || null,
        statusLocation: shipment.Status?.StatusLocation || null,
      });
    } catch (err) {
      setTrackingData(getFallbackTrackingData());
      setTrackingError("Tracking not available.");
    } finally {
      setLoadingTracking(false);
    }
  }, []);

  useEffect(() => {
    if (!tracking?.courier?.awb) return;

    let timeout: NodeJS.Timeout;

    const loop = async () => {
      await fetchTracking(tracking.courier.awb!, tracking.order_number);
      timeout = setTimeout(loop, TRACKING_RETRY_INTERVAL);
    };

    loop();
    return () => clearTimeout(timeout);
  }, [tracking, fetchTracking]);

  if (loading || (loadingTracking && !trackingData))
    return (
      <Layout>
        <OrderLoadingState />
      </Layout>
    );

  if (error || !tracking)
    return (
      <Layout>
        <OrderErrorState error={error || "Order not found."} />
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 mt-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/order-preview/${id}`}
            className="flex items-center text-md uppercase text-yellow-400 font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg flex justify-between flex-col md:flex-row">
          <div>
            <h2 className="text-xl font-bold text-yellow-400">
              {tracking.order_number}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Placed on {new Date(tracking.created_at).toLocaleDateString()}
              {tracking.total && (
                <span className="ml-4 text-white">
                  | Total: ₹{tracking.total.toFixed(2)}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <p className="text-sm font-bold text-white">Payment</p>
            <span
              className={`text-sm font-semibold ${
                tracking.payment_status === "paid"
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            >
              {tracking.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Cancellation Reason */}
        {tracking.cancellation_reason && (
          <p className="text-center bg-red-900/50 border border-red-700 p-3 rounded text-red-400 text-sm font-medium">
            ❌ Cancellation Reason: {tracking.cancellation_reason}
          </p>
        )}

        {/* Courier Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-3">
            <Truck className="h-5 w-5 text-yellow-400" /> Delivery Details
          </h2>

          {/* If AWB Exists → Full UI */}
          {tracking?.courier?.awb ? (
            <>
              {trackingData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          Current Status
                        </p>
                        <p className="text-xs text-gray-300">
                          {trackingData.currentLocation}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          Current Location
                        </p>
                        <p className="text-xs text-gray-300">
                          {trackingData.statusLocation || "Not Available"}
                        </p>
                        <p className="font-medium text-xs text-yellow-400 mt-1">
                          <span className="font-medium text-white">Note -</span>{" "}
                          {trackingData.instructions || "Not Available"}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          Expected Delivery
                        </p>
                        <p className="text-xs text-gray-300">
                          {trackingData.expectedDelivery
                            ? new Date(
                                trackingData.expectedDelivery
                              ).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "To be confirmed"}
                        </p>
                      </div>

                      {trackingData.destination && (
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-yellow-400 font-semibold text-sm mb-1">
                            Final Destination
                          </p>
                          <p className="text-xs text-gray-300">
                            {trackingData.destination}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          AWB Number
                        </p>
                        <p className="text-xs text-gray-300">
                          {tracking.courier.awb}
                        </p>
                      </div>

                      {trackingData.pickupDate && (
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-yellow-400 font-semibold text-sm mb-1">
                            Pickup Date
                          </p>
                          <p className="text-xs text-gray-300">
                            {new Date(trackingData.pickupDate).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          Courier Partner
                        </p>
                        <p className="text-xs text-gray-300">
                          {trackingData.courierPartner}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Latest Scan */}
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
                          ? new Date(
                              trackingData.statusDateTime
                            ).toLocaleString()
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
            /* If AWB Not Exists → Simple UI */
            <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-400">
              <p className="text-yellow-400 font-semibold text-sm mb-1">
                Current Status
              </p>
              <p className="text-sm text-gray-300">{tracking.status}</p>
            </div>
          )}

          {/* WhatsApp Support */}
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
            <div className="mt-6 max-w-md mx-auto bg-gray-800 rounded-xl p-5 shadow-inner border border-gray-700">
              {/* Header */}
              <div className="items-center mb-3 border-b border-gray-700 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  📦 Shipping Address
                  <span className="text-yellow-400">
                    {tracking.status || "Not Available"}
                  </span>
                </h3>
                <span className="text-xs font-semibold text-gray-300 ml-5">
                  used for this delivery
                </span>
              </div>

              {/* Address Details */}
              <div className="text-sm text-gray-300 leading-relaxed space-y-1 mt-3">
                {/* Name */}
                <p className="font-bold text-yellow-400">
                  {tracking.shippingAddress.fullName ||
                    `${tracking.shippingAddress.firstName || ""} ${
                      tracking.shippingAddress.lastName || ""
                    }`.trim()}
                </p>

                {/* Address */}
                <p>{tracking.shippingAddress.address || "Not Available"}</p>

                {/* City + State + Zip */}
                <p>
                  {tracking.shippingAddress.city || "Not Available"},{" "}
                  {tracking.shippingAddress.state || ""} -{" "}
                  <span className="font-semibold">
                    {tracking.shippingAddress.zipCode || "N/A"}
                  </span>
                </p>

                {/* Country */}
                <p>{tracking.shippingAddress.country || "India"}</p>

                <hr className="my-2 border-gray-700" />

                {/* Phone */}
                <p>
                  📞{" "}
                  <span className="font-medium">
                    {tracking.shippingAddress.phone || "Not Available"}
                  </span>
                </p>

                {/* Email */}
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
      </div>
    </Layout>
  );
};

export default TrackOrder;
