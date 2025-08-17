import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LiveViewingCounterProps {
  productId: string;
}

const LiveViewingCounter: React.FC<LiveViewingCounterProps> = ({ productId }) => {
  const [viewCount, setViewCount] = useState(0);
  const [realUserCount, setRealUserCount] = useState(0);
  const [staticBaseCount, setStaticBaseCount] = useState(0);

  useEffect(() => {
    // Generate a static base count between 5-12 people
    const baseCount = Math.floor(Math.random() * 8) + 5; // 5-12
    setStaticBaseCount(baseCount);
    setViewCount(baseCount);

    // Set up real-time presence for this product
    const channel = supabase.channel(`product-${productId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userCount = Object.keys(state).length;
        setRealUserCount(userCount);
        
        // If there are real users, add to base count, otherwise use just base count
        setViewCount(userCount > 0 ? baseCount + userCount : baseCount);
      })
     

    // Subscribe and track current user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user as viewing this product
        await channel.track({
          user_id: Math.random().toString(36).substr(2, 9), // Generate random user ID for demo
          viewing_at: new Date().toISOString(),
        });
      }
    });

    // Update the static base count occasionally with slight variations
    const interval = setInterval(() => {
      if (realUserCount === 0) {
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const newBaseCount = Math.max(5, Math.min(12, baseCount + variation));
        setStaticBaseCount(newBaseCount);
        setViewCount(newBaseCount);
      }
    }, Math.random() * 20000 + 15000); // 15-35 seconds

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [productId]);

 return (
   <div className="flex  mb-4">
      <div className="flex  gap-2  py-3   bordershadow-sm text-sm sm:text-base font-semibold text-gray-900 animate-fade-in">
        {/* Animated Eye Icon */}
        <Eye className="w-5 h-5 text-yellow-200  dark:text-gray-800 animate-eyeBlink" />

        {/* Viewer Count */}
        <span className='text-yellow-400 lowercase text-sm font-semibold'>
          {viewCount} {viewCount === 1 ? 'person' : 'people'} Live viewing now
        </span>
      </div>
    </div>
);


};

export default LiveViewingCounter;