import {
  IndianRupee,
  Truck,
  Shirt,
  Coins,
  Lock,
  MessageCircle,
  RotateCcw,
  Mail,
} from "lucide-react";

export default function TrustHighlights() {
  return (
    <div className="mt-4 p-3 bg-[#111] border border-gray-800 rounded-none">
      {/* --- Main Feature Icons --- */}
      <div className="grid grid-cols-4 gap-2 mt-2 mb-3 text-center">
        {[
          { icon: IndianRupee, label: "Free Delivery" },
          { icon: Truck, label: "Fast Delivery" },
          { icon: Shirt, label: "100% Cotton" },
          { icon: Coins, label: "Reward Points" },
        ].map(({ icon: Icon, label }, index) => (
          <div
            key={index}
            className="group flex flex-col items-center justify-center transition-all duration-300 p-2"
          >
            <div className="flex items-center justify-center bg-gray-800 hover:bg-yellow-500 transition-all duration-300 rounded-full w-9 h-9 mb-1">
              <Icon className="w-4 h-4 text-white group-hover:scale-110 transition-all" />
            </div>
            <p className="text-[10px] sm:text-[13px] font-medium leading-tight group-hover:text-yellow-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* --- Secondary Details: Perfect Alignment with Above Grid --- 
      <div className="grid grid-cols-3 gap-4 text-gray-300 text-sm mt-5 pt-5 text-center">
        {[
          { icon: Lock, text: "Secure Payment" },
          { icon: Truck, text: "Express Shipping" },
          { icon: MessageCircle, text: "WhatsApp Support" },
          { icon: RotateCcw, text: "Return Available" },
          { icon: Mail, text: "Email Support" },
        ].map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1"
          >
            <Icon className="w-6 h-6 text-yellow-400" />
            <span className="font-medium text-xs">{text}</span>
          </div>
        ))}
      </div>
      */}
    </div>
  );
}
