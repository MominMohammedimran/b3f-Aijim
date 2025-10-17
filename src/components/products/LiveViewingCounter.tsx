import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LiveViewingCounterProps {
  productId: string;
}

const LiveViewingCounter: React.FC<LiveViewingCounterProps> = ({ productId }) => {
  const [viewCount, setViewCount] = useState(0);
  const [realUserCount, setRealUserCount] = useState(0);
  const [staticBaseCount, setStaticBaseCount] = useState(0);

  useEffect(() => {
    const baseCount = Math.floor(Math.random() * 8) + 5;
    setStaticBaseCount(baseCount);
    setViewCount(baseCount);

    const channel = supabase
      .channel(`product-${productId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const userCount = Object.keys(state).length;
        setRealUserCount(userCount);
        setViewCount(userCount > 0 ? baseCount + userCount : baseCount);
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: Math.random().toString(36).substr(2, 9),
          viewing_at: new Date().toISOString(),
        });
      }
    });

    const interval = setInterval(() => {
      if (realUserCount === 0) {
        const variation = Math.floor(Math.random() * 3) - 1;
        const newBaseCount = Math.max(5, Math.min(12, baseCount + variation));
        setStaticBaseCount(newBaseCount);
        setViewCount(newBaseCount);
      }
    }, Math.random() * 20000 + 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return (
    <div className="flex items-center gap-2 m-4 mb-6">
      {/* Glowing Yellow Live Dot */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
          boxShadow: [
            "0 0 4px rgba(255, 255, 0, 0.3)",
            "0 0 12px rgba(255, 255, 0, 0.8)",
            "0 0 4px rgba(255, 255, 0, 0.3)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="w-3 h-3 bg-yellow-400 rounded-full"
      />

      {/* Eye Icon */}
      

      {/* View Count Text */}
      <div className="flex items-baseline gap-1 ml-2">
        <span className="text-yellow-300 font-semibold text-sm sm:text-base transition-all duration-300">
          {viewCount}
        </span>
        <span className="text-xs text-gray-200 font-medium tracking-wide">
          {viewCount === 1 ? "person" : "people"} viewing now
        </span>
      </div>
    </div>
  );
};

export default LiveViewingCounter;
