import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { validatePincode } from "@/utils/pincodeService";

const PinCodeCheckAvailable = () => {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const [result, setResult] = useState<{
    isServiceable: boolean;
    message: string;
  } | null>(null);

  const checkPincode = async () => {
    if (!pincode || pincode.length < 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setChecked(true);

    try {
      const res = await validatePincode(pincode);
      setResult({ isServiceable: res.isServiceable, message: res.message });
    } catch {
      setResult({
        isServiceable: false,
        message: "Unable to verify pincode. Try later.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-black via-gray-900 to-black border border-gray-700 rounded-none m-2 mt-4">
      <h3 className="text-md font-semibold text-yellow-300 mb-2">
        Delivery & Returns
      </h3>

      <div className="space-y-3">
        {/* --- PIN Search --- */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            maxLength={6}
            inputMode="numeric"
            placeholder="Enter PIN Code"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            className="w-80 flex-1 text-xs px-1 py-1.5 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 font-semibold focus:ring-1 focus:ring-yellow-400 outline-none"
          />

          <button
            onClick={checkPincode}
            disabled={loading}
            className="px-2 py-1.5 bg-yellow-500 text-xs text-black font-semibold rounded-none hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        {/* --- Result Message --- */}
        {checked && result && (
          <p
            className={`text-[10px] font-semibold ${
              result.isServiceable ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.message}
          </p>
        )}

        {/* --- Delivery Instructions Dropdown --- */}
        <div className="border-t border-gray-700 pt-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-200 hover:text-yellow-400 transition-colors"
          >
            Delivery Instructions
            <ChevronDown
              className={`w-4 h-4 transform transition-transform duration-300 ${
                showInstructions ? "rotate-180 text-yellow-400" : "rotate-0"
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showInstructions ? "max-h-[300px] mt-2" : "max-h-0"
            }`}
          >
            <div className="bg-gray-800 text-gray-300 text-xs font-medium p-3 border border-gray-700 rounded-none space-y-1 leading-relaxed">
              <p>• Easy 7-day exchange available on eligible items.</p>
              <p>• No Cash on Delivery available.</p>

              <Link
                to="/cancellation-refund"
                className="text-yellow-400 hover:text-yellow-300 underline block mt-1"
              >
                View Cancellation & Refund Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinCodeCheckAvailable;
