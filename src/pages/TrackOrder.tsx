
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // Keep Link for the 'Back' button
import OrderLoadingState from "../components/orders/OrderLoadingState";
import OrderErrorState from "../components/orders/OrderErrorState";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { supabase } from "@/integrations/supabase/client";
import OrderSummary from "@/components/track/OrderSummary";
import TrackingDetails from "@/components/track/TrackingDetails";
import OrderRelatedProducts from "@/components/track/OrderRelatedProducts";

// --- Interface Definitions (Kept) ---

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
    items: any[];
}

// --- Component Prop Interface ---
interface TrackOrderProps {
    orderNumber: string; // The specific order number passed from the parent
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

// 🆕 Accept orderNumber as prop instead of using useParams
const TrackOrder: React.FC<TrackOrderProps> = ({ orderNumber }) => {
    // ⚠️ NOTE: We must still fetch all orders if useOrderTracking relies on a global list fetch.
    const { orders, loading, error } = useOrderTracking() as {
        orders: Order[];
        loading: boolean;
        error: string | null;
    };
    

    // Use the prop to find the specific order
    const tracking = orders.find((o) => o.order_number === orderNumber);

    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    // --- Helper function (Kept) ---
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

    // --- Fetching Logic (Kept and refactored slightly) ---
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
                setTrackingError("No detailed tracking data available yet.");
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
            console.error("Tracking API call failed:", err);
            setTrackingData(getFallbackTrackingData());
            setTrackingError("Failed to connect to tracking service.");
        } finally {
            setLoadingTracking(false);
        }
    }, []);

    // --- Tracking Loop (Kept) ---
    useEffect(() => {
        // Only run if tracking object exists and has an AWB
        if (!tracking?.courier?.awb) return;

        let timeout: NodeJS.Timeout;

        const loop = async () => {
            // Use the specific AWB and Order ID from the found order object
            await fetchTracking(tracking.courier.awb!, tracking.order_number);
            timeout = setTimeout(loop, TRACKING_RETRY_INTERVAL);
        };

        loop();
        return () => clearTimeout(timeout);
    }, [tracking, fetchTracking]);

    // --- Conditional Rendering (Removed Layout wrapper) ---
    if (loading || (loadingTracking && !trackingData))
        return (
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <OrderLoadingState />
            </div>
        );

    if (error || !tracking)
        return (
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <OrderErrorState error={error || `Order ${orderNumber} not found.`} />
            </div>
        );

    return (
        <div className="w-full mx-auto px-1 py-2 space-y-8">
            <h2 className="text-xl font-bold text-center text-white border-b borderr-gray-100 ">
                Tracking status
            </h2>
            <OrderSummary tracking={tracking} />
            <TrackingDetails tracking={tracking} trackingData={trackingData} />
            <OrderRelatedProducts excludeItems={tracking.items} />
        </div>
    );
};

export default TrackOrder;
