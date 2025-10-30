import React from "react";
import { Package, Truck, CheckCircle, Wallet } from "lucide-react";

interface Step {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface OrderTrackingStatusProps {
  currentStatus: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
}

const deliverySteps: Step[] = [
  { key: "processing", label: "Processing", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const returnSteps: Step[] = [
  { key: "return-acpt", label: "Return Accepted", icon: Package },
  { key: "return-pcs", label: "Picked by Courier", icon: Truck },
  { key: "return-wh", label: "At Warehouse", icon: Package },
  { key: "payment-rf", label: "Refund Initiated", icon: Wallet },
  { key: "payment-rf-ss", label: "Refund Complete", icon: CheckCircle },
];

export default function OrderTrackingStatus({
  currentStatus,
  estimatedDelivery,
  cancellationReason,
}: OrderTrackingStatusProps) {
  const status = currentStatus?.toLowerCase() || "";

  const isReturnFlow = returnSteps.some((step) => step.key === status);
  const stepsToRender = isReturnFlow ? returnSteps : deliverySteps;

  const currentStatusIndex = stepsToRender.findIndex((step) => step.key === status);

  const percentComplete =
    currentStatusIndex >= 0
      ? ((currentStatusIndex + 1) / stepsToRender.length) * 100
      : 0;

  return (
    <div className="w-full mx-auto p-1 bg-black rounded-none shadow-lg">
      <h2 className="text-md lg:text-lg font-semibold text-yellow-400 mb-3 text-center">
        {isReturnFlow ? "Return & Refund Progress" : "Order Progress"}
      </h2>

      {/* Steps Row */}
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 mt-2  w-full h-1 bg-gray-700 rounded-full -translate-y-1/2">
          <div
            className={`h-1 rounded-full transition-all duration-500 ${
              isReturnFlow ? "bg-yellow-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>

        {/* Step Icons */}
        {stepsToRender.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          return (
            <div key={step.key} className="flex flex-col items-center w-full relative z-10">
              <div
                className={`w-10 h-10 flex items-center justify-center   transition-all duration-300 ${
                  isCompleted
                    ? isReturnFlow
                      ? " text-yellow-400"
                      : " text-blue-5000"
                    : " text-gray-400"
                }`}
              >
                <step.icon size={14} />
              </div>
              <span
                className={`mt-3 text-[8px] lg:text-sm font-semibold text-center ${
                  isCompleted
                    ? isReturnFlow
                      ? "text-yellow-400"
                      : "text-blue-400"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {estimatedDelivery && (
        <p className="text-center text-gray-400 mt-6 text-xs lg:text-sm">
          Current Status : <span className="text-yellow-400 font-semibold">{estimatedDelivery}</span>
        </p>
      )}
 
      {cancellationReason && (
        <p className="text-center text-red-400 mt-2 text-sm font-medium">
          ❌ {cancellationReason}
        </p>
      )}
    </div>
  );
}
