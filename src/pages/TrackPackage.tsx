import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, Truck } from "lucide-react";

const TrackPackage = () => {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any | null>(null);                                                                                                                       


  const [errorMessage, setErrorMessage] = useState("");

  const handleTrack = async () => {
    if (!awb.trim()) return;

    setLoading(true);
    setTrackingData(null);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("track-package", {
        body: JSON.stringify({ awb }),
      });

      const shipment = data?.data?.ShipmentData?.[0]?.Shipment;

      if (error || !shipment) {
        setErrorMessage("❌ No tracking found. Please check the AWB number.");
        return;
      }

      setTrackingData(shipment);
    } catch {
      setErrorMessage("⚠️ Network issue. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <Layout>
  <div className="max-w-xl mx-auto px-6 py-10 text-center mt-14">
 {/* Header */}
          <div className="container-custom  pb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Link
                to="/"
                className="hover:text-yellow-400 transition-colors"
              >
                Home
              </Link>
          
              <span>/</span>
          
              <span className="text-white font-semibold">
                Track-Package
              </span>
            </nav>
          
          
          </div>
    {/* Title */}
    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-yellow-400 flex items-center gap-2 justify-center mb-2">
      Track Your Package
    </h1>

    {/* NOTE: AIJIM Restriction Message */}
    <p className="text-xs text-gray-400 font-medium mb-6">
      "Tracking applies only to orders placed through AIJIM. Third-party or unrelated tracking numbers will not work"
    </p>

    {/* INPUT + BUTTON */}
    <div className="bg-black border border-gray-700 p-4 rounded-none flex flex-col sm:flex-row gap-3">

      <input
        value={awb}
        onChange={(e) => setAwb(e.target.value)}
        placeholder="Enter AWB / Tracking Number"
        className="flex-1 bg-black text-yellow-300 border border-gray-600 rounded-none px-3 py-2 text-sm focus:border-red-500 outline-none"
      />

      <button
        onClick={handleTrack}
        disabled={loading}
        className="bg-red-600 text-white font-semibold px-6 py-2 rounded-none hover:bg-red-700 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? "Checking..." : <>Track</>}
      </button>
    </div>

    {/* ERROR MESSAGE */}
    {errorMessage && (
      <div className="mt-4 bg-black border border-gray-700 text-red-500 px-4 py-2 text-xs font-semibold rounded-none">
        {errorMessage}
      </div>
    )}

    {/* TRACKING RESULT BOX */}
    {trackingData && (
      <div className="bg-black border border-gray-700 p-5 mt-6 rounded-none text-left space-y-4 animate-fadeIn">

        <h2 className="text-yellow-400 font-semibold text-lg">
          Shipment Details
        </h2>

        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-white">Status:</span>{" "}
            {trackingData.Status?.Status || "Unknown"}
          </p>

          {/* Delivered To Name */}
          {trackingData.Status?.Status?.toLowerCase() === "delivered" &&
            trackingData?.Status?.ReceivedBy && (
              <p className="text-green-400 font-semibold">
                Delivered to: {trackingData.Status.ReceivedBy}
              </p>
          )}

          <p>
            <span className="font-semibold text-white">Last Location:</span>{" "}
            {trackingData.Status?.StatusLocation || "Unavailable"}
          </p>

          <p>
            <span className="font-semibold text-white">Updated:</span>{" "}
            {trackingData.Status?.StatusDateTime
              ? new Date(trackingData.Status.StatusDateTime).toLocaleString()
              : "Not Available"}
          </p>

          <p>
            <span className="font-semibold text-white">Courier Partner:</span>{" "}
            Delhivery
          </p>
        </div>
      </div>
    )}

  </div>
</Layout>

  );
};

export default TrackPackage;
