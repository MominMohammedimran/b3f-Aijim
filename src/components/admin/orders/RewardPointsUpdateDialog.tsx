import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardPointsUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: () => void;
}

const RewardPointsUpdateDialog: React.FC<RewardPointsUpdateDialogProps> = ({
  isOpen,
  onClose,
  order,
  onUpdate
}) => {
  const [rewardPoints, setRewardPoints] = useState(order?.reward_points_earned || 0);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!order?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          reward_points_earned: parseInt(rewardPoints.toString()) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Reward points updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
     // console.error('Error updating reward points:', error);
      toast.error('Failed to update reward points');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Reward Points</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Order Number</Label>
            <div className="text-sm text-gray-600">{order?.order_number}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="text-sm text-gray-600">₹{order?.total}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rewardPoints">Reward Points Earned</Label>
            <Input
              id="rewardPoints"
              type="number"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(e.target.value)}
              placeholder="Enter reward points"
            />
            <p className="text-xs text-gray-500">
              Current: {order?.reward_points_earned || 0} points
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Points'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RewardPointsUpdateDialog;