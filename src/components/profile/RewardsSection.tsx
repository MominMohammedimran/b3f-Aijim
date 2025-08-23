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
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);

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

        const used = orderData.reduce((sum, order) => sum + (order.reward_points_used || 0), 0);
        const earned = orderData.reduce(
          (sum, order) => sum + (order.reward_points_earned || 0) - (order.reward_points_used || 0),
          0
        );

        const currentPoints = userProfile.reward_points || 0;
        const updatedTotal = earned > 0 ? earned : currentPoints;

        if (earned > 0 && currentPoints !== updatedTotal) {
          await supabase
            .from('profiles')
            .update({ reward_points: updatedTotal })
            .eq('id', userProfile.id);
        }

        setRewardPointsUsed(used);
        setRewardPoints(updatedTotal);
        setOrders(orderData);
      } catch (err) {
        console.error('Reward points error:', err);
        setRewardPoints(userProfile?.reward_points || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSyncRewards();
  }, [currentUser, userProfile]);

  const nextRewardLevel = Math.ceil((rewardPoints + 100) / 100) * 100;
  const progress = ((rewardPoints % 100) / 100) * 100;

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
    <div className="space-y-4 p-6 pl-0 pr-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl">
      {/* Header */}
      <div className="flex p-4 justify-between items-center">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
        Rewards
        </h2>
        <button
          onClick={handleEarnPoints}
          className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center transition"
        >
          How to earn more <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      {/* Reward Card */}
      <div className=" p-3 border border-gray-700 shadow-lg ">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">Available Points</p>
            <div className="flex items-center space-x-2">
              <Award className="text-yellow-400 drop-shadow-glow" />
              <span className="text-4xl font-bold text-white">{rewardPoints}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Next Reward at</p>
            <p className="text-2xl font-semibold text-gray-200">{nextRewardLevel} pts</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Current</span>
            <span>Next Reward</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-900/60 p-2  border border-gray-700">
          <p className="text-sm text-yellow-300 mb-1">💰 Use points as cash! at checkout.</p>
          <p className="text-xs text-gray-300">1 Point = ₹1. Minimum 70 points required.</p>
        </div>

        {/* Actions 
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleEarnPoints}
            className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-90"
          >
            <ShoppingBag size={18} />
            <span>Earn Points</span>
          </button>
          <button
            onClick={handleUsePoints}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg font-semibold transition ${
              rewardPoints >= 80
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Gift size={18} />
            <span>Use Points</span>
          </button>
        </div>*/}

      </div>

      {/* Orders */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-3"> Orders & Rewards</h3>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="rounded-none bg-gradient-to-r from-gray-800/70 to-gray-900/70 border border-gray-700 shadow hover:shadow-green-400/10 transition"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{order.order_number}</p>
                    <p className="text-sm text-gray-300">₹{order.total}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-yellow-400 font-medium">
                      + &nbsp;{order.reward_points_earned || 0} pts
                    </p>
                    {(order.reward_points_used?.points || 0) > 0 && (
                      <p className="text-xs text-red-300">-&nbsp; {order.reward_points_used?.points || 0} pts </p>
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
