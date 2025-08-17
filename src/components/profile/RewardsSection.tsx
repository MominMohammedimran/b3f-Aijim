import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Award, ArrowRight, Gift, ShoppingBag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const RewardsSection = () => {
  const { currentUser, userProfile } = useAuth();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const[rewardPointsused,setRewardPointsused]=useState(0);

  useEffect(() => {
    const fetchAndSyncRewards = async () => {
      if (!currentUser || !userProfile?.id) return;

      setLoading(true);
      try {
        const { data: orderData, error: ordersError } = await supabase
          .from('orders')
          .select('id, user_id, order_number, total, reward_points_earned, reward_points_used')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        const pointsdecrease=orderData.reduce((sum, order) => {
          return sum + (order.reward_points_used||0);
        }, 0);
        
        const earnedPoints = orderData.reduce((sum, order) => {
          return sum + (order.reward_points_earned || 0)-(order.reward_points_used||0);
        }, 0);

        const currentPoints = userProfile.reward_points || 0;
        const updatedTotal = earnedPoints > 0 ? earnedPoints : currentPoints;

        if (earnedPoints > 0 && currentPoints !== updatedTotal) {
          await supabase
            .from('profiles')
            .update({ reward_points: updatedTotal })
            .eq('id', userProfile.id);
        }
       setRewardPointsused(pointsdecrease);
        setRewardPoints(updatedTotal);
        setOrders(orderData);
      } catch (err) {
        console.error('Reward points error:', err);
        setRewardPoints(userProfile?.reward_points || 0); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchAndSyncRewards();
  }, [currentUser, userProfile]);

  const nextRewardLevel = Math.ceil((rewardPoints + 100) / 100) * 100;
  const progress = (rewardPoints % 100) / 100 * 100;

  const handleEarnPoints = () => {
    toast.info('Complete purchases to earn reward points!');
  };

  const handleUsePoints = () => {
    if (rewardPoints < 100) {
      toast.warning('You need at least 100 points to redeem rewards');
      return;
    }
    toast.info('Reward points can be used during checkout');
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Reward Points</h2>
        <button
          onClick={handleEarnPoints}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
        >
          How to earn more <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">Available Points</p>
            <div className="flex items-center space-x-2">
              <Award className="text-yellow-400" />
              <span className="text-3xl font-bold text-white">{rewardPoints}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Next Reward at</p>
            <p className="text-xl font-semibold text-blue-400">{nextRewardLevel} pts</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Current</span>
            <span>Next Reward</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-4 bg-gray-800 p-3 ">
          <p className="text-sm text-gray-300 mb-1">💰 Use your reward points as money!</p>
          <p className="text-xs text-gray-400">Every point = ₹1. Minimum 70 points required to redeem.</p>
        </div>{rewardPointsused >= 0 && (
  <div className="space-y-3">
    {orders.map((order) => (
      <Card key={order.id} className="bg-gray-800 border rounded-none border-gray-700">
        <CardContent className="p-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Reward Points Used : {rewardPointsused}
              </h3>
             
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}

                
    
        <div className="grid grid-cols-2 gap-2  mt-4">
          <button
            onClick={handleEarnPoints}
            className="flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white pl-2 hover:bg-blue-700"
          >
            <ShoppingBag size={18} />
            <span>Earn Points</span>
          </button>
          <button
            onClick={handleUsePoints}
            className={`flex items-center justify-center space-x-2 py-2 pl-2 ${
              rewardPoints >= 80
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Gift size={18} />
            <span>Use Points</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Orders & Earned Points</h3>
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-800 border border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-semibold">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-400">₹{order.total}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-yellow-400 font-medium">
                      +{order.reward_points_earned || 0} pts earned
                    </p>
                    {order.reward_points_used > 0 && (
                      <p className="text-xs text-green-400">
                        Used: {order.reward_points_used} pts
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsSection;
