import React from 'react';

interface Item {
  image: string;
  name: string;
  sizes: {
    size: string;
    quantity: number;
  }[];
}

interface OrderSummaryProps {
  items: Item[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  return (
    <div className="p-4 space-y-3 overflow-y-auto h-auto custom-scroll">
      {(items || []).map((item, i) => (
        <div
          key={i}
          className="flex gap-3 bg-black border border-gray-700 p-2 rounded-md"
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-16 w-16 object-cover rounded-md border border-gray-700"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-white line-clamp-2">
              {item.name}
            </p>

            <div className="flex flex-wrap gap-2 mt-1">
              {(item.sizes || []).map((s, j) => (
                <span
                  key={j}
                  className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded"
                >
                  {s.size} × {s.quantity}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummary;
