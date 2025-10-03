
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardPointsSectionProps {
  cartTotal: number;
  onPointsApplied: (points: number, discount: number) => void;
  onPointsRemoved: () => void;
  appliedPoints?: {
    points: number;
    discount: number;
  };
}

const RewardPointsSection: React.FC<RewardPointsSectionProps> = ({
  cartTotal,
  onPointsApplied,
  onPointsRemoved,
  appliedPoints
}) => {
  const { currentUser } = useAuth();
  const [pointsToUse, setPointsToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      fetchUserPoints();
    }
  }, [currentUser]);

  const fetchUserPoints = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reward_points')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      
      setAvailablePoints(data?.reward_points || 0);
    } catch (error) {
      console.error('Error fetching reward points:', error);
      setAvailablePoints(0);
    }
  };

  const handleApplyPoints = () => {
    if (pointsToUse <0) {
      toast.error('Please enter valid points to use');
      return;
    }

    if (pointsToUse > availablePoints) {
      toast.error('Not enough reward points available');
      return;
    }

    // 1 point = ₹1 discount
    const discount = pointsToUse;
    
    if (discount > cartTotal) {
      toast.error('Points discount cannot exceed cart total');
      return;
    }

    onPointsApplied(pointsToUse, discount);
    toast.success(`Applied ${pointsToUse} reward points`);
  };

  const handleRemovePoints = () => {
    setPointsToUse(0);
    onPointsRemoved();
    toast.success('Reward points removed');
  };

  const adjustPoints = (increment: boolean) => {
    const newPoints = increment ? pointsToUse + 10 : Math.max(0, pointsToUse - 10);
    const maxPoints = Math.min(availablePoints, cartTotal);
    setPointsToUse(Math.min(newPoints, maxPoints));
  };

  if (!currentUser || availablePoints <= 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 tracking-[1px] text-white">
          <Gift className="h-5 w-5 text-yellow-400 " />
          Reward Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300 font-semibold tracking-[1px]">
          Available : 
          {"  "  }<span className="font-semibold text-yellow-400 tracking-[1px]">{availablePoints} points</span>
          <span className="text-xs text-gray-400 tracking-[1px] ml-2">(1 point = ₹1)</span>
        </div>

        {appliedPoints ? (
          <div className="bg-green-50 border border-green-200 p-0 ">
            <div className="flex justify-between items-center">
              <div className="text-green-800 tracking-[1px] font-semibold">
                <div className="font-semibold text-sm">Points Applied</div>
                <div className="text-xs font-semibold">Using {appliedPoints.points} points for ₹{appliedPoints.discount} discount</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePoints}
                className="text-white bg-black border-none hover:text-red-500"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustPoints(false)}
                disabled={pointsToUse <= 0}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={pointsToUse}
                onChange={(e) => setPointsToUse(Math.min(Math.max(0, parseInt(e.target.value) || 0), Math.min(availablePoints, cartTotal)))}
                className="text-center"
                placeholder="Enter points"
                min="0"
                max={Math.min(availablePoints, cartTotal)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustPoints(true)}
                disabled={pointsToUse >= Math.min(availablePoints, cartTotal)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-1">
              <Button
                onClick={handleApplyPoints}
                disabled={loading || pointsToUse <= 0}
                className="flex-1 text-xs font-semibold rounded-none" 
              >
                {loading ? 'Applying...' : `Apply ${pointsToUse} Points`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPointsToUse(Math.min(availablePoints, cartTotal))}
                disabled={availablePoints <= 0}
              >
                Use Max
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardPointsSection;
