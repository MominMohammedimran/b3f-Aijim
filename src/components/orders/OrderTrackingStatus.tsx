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
  { key: "return-accepted", label: "Return Accepted", icon: Package },

  { key: "return-picked", label: "Picked by Courier", icon: Truck },
  { key: "return-warehouse", label: "At Warehouse", icon: Package },
  { key: "payment-refund", label: "Refund Initiated", icon: Wallet },
  { key: "payment-refund-successfull", label: "Refund Complete", icon: CheckCircle },
];

export default function OrderTrackingStatus({ currentStatus, estimatedDelivery, cancellationReason }: OrderTrackingStatusProps) {
  const status = currentStatus?.toLowerCase() || "";

  const isReturnFlow = returnSteps.some((step) => step.key === status);
  const stepsToRender = isReturnFlow ? returnSteps : deliverySteps;

  const currentStatusIndex = stepsToRender.findIndex((step) => step.key === status);

  const percentComplete =
    currentStatusIndex >= 0
      ? ((currentStatusIndex + 1) / stepsToRender.length) * 100
      : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        {isReturnFlow ? "Return & Refund Status" : "Order Status"}
      </h2>

      {/* Steps Row */}
      <div className="flex justify-between items-center mb-4 relative">
        {stepsToRender.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isRefundStep =
            step.key === "payment refund" ||
            step.key === "payment refund successfull";

          return (
            <div key={step.key} className="flex flex-col items-center w-full">
              <div
                className={`w-10 h-10 flex items-center  justify-center rounded-full shadow-md z-10 ${
                  isCompleted
                    ? isRefundStep
                      ? "bg-green-500 text-white"
                      : isReturnFlow
                      ? "bg-yellow-500 text-black"
                      : "bg-blue-500 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                <step.icon size={20} />
              </div>
              <span className="mt-2 text-[10px] font-normal text-center text-white">{step.label}</span>
            </div>
          );
        })}

        {/* Progress Bar Behind Icons */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-700 z-0">
          <div
            className={`h-1 ${
              isReturnFlow ? "bg-yellow-400" : "bg-blue-500"
            }`}
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
