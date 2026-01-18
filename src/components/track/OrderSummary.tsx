
import React from 'react';

interface OrderSummaryProps {
  tracking: {
    order_number: string;
    payment_status: string;
    status: string;
    cancellation_reason: string | null;
  };
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ tracking }) => {
  if (!tracking) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-none p-6 shadow-lg flex justify-between flex-col">
      <div className="">
        <h2 className="text-xl font-bold text-yellow-400">
          {tracking.order_number}
        </h2>
      </div>

      <div className="flex gap-3 items-center">
        <p className="text-sm font-bold text-white">Payment -</p>
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
      
      <div className="flex gap-3 items-center">
        <p className="text-sm font-bold text-white">Order Status -</p>
        <span
          className={`text-sm font-semibold ${
            tracking.status === "delivered"
              ? "text-yellow-400"
              : "text-red-500"
          }`}
        >
          {tracking.status.toUpperCase()}
        </span>
      </div>

      {tracking.cancellation_reason && (
        <div className="flex gap-3 items-center">
          <p className="rounded text-white text-xs font-medium">
            Cancellation Reason - &nbsp;
            <span className="text-sm text-gray-300">
              {tracking.cancellation_reason}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
