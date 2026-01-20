import React, { useEffect, useState } from "react";
import DOMPurify from 'dompurify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Minus, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RewardPointsSectionProps {
  cartTotal: number;
  onPointsApplied: (points: number, discount: number) => void;
  onPointsRemoved: () => void;
  appliedPoints?: { points: number; discount: number } | null;
}

const RewardPointsSection: React.FC<RewardPointsSectionProps> = ({
  cartTotal,
  onPointsApplied,
  onPointsRemoved,
  appliedPoints,
}) => {
  const { currentUser } = useAuth();
  const [pointsToUse, setPointsToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);

  useEffect(() => {
    if (currentUser) fetchUserPoints();
  }, [currentUser]);

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("reward_points")
        .eq("id", currentUser?.id)
        .single();

      if (error) throw error;
      setAvailablePoints(data?.reward_points || 0);
    } catch (error) {
      toast.error("Failed to load reward points");
    }
  };

  const handleApplyPoints = () => {
    if (pointsToUse <= 0) return toast.error("Enter valid points");
    if (pointsToUse > availablePoints) return toast.error("Not enough points");
    if (pointsToUse > cartTotal) return toast.error("Points exceed cart total");

    const discount = pointsToUse;
    onPointsApplied(pointsToUse, discount);
    toast.success(`Applied ${pointsToUse} points for ₹${discount} off`);
  };

  const handleRemovePoints = () => {
    setPointsToUse(0); // reset input
    onPointsRemoved(); // set appliedPoints to null in parent
    toast.success("Reward points removed");
  };

  const adjustPoints = (increment: boolean) => {
    const maxPoints = Math.min(availablePoints, cartTotal);
    const newPoints = increment
      ? Math.min(pointsToUse + 10, maxPoints)
      : Math.max(pointsToUse - 10, 0);
    setPointsToUse(newPoints);
  };

  if (!currentUser) return null;

  if (availablePoints <= 0) {
    return (
      <div className="w-full mb-5 p-3 bg-black text-white border border-gray-700 rounded-none text-center font-semibold">
        No reward points available
      </div>
    );
  }

  const progressPercent =
    (pointsToUse / Math.min(availablePoints, cartTotal)) * 100;

  return (
    <div className="w-full mb-5 p-2 border border-gray-700 rounded-none">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-700 pb-2 mb-3">
        <Gift className="text-yellow-400 w-5 h-5" />
        <h3 className="text-lg font-semibold text-yellow-400 tracking-wide uppercase">
          Reward Points
        </h3>
      </div>

      {/* Available points info */}
      <div className="text-sm font-medium text-gray-300 mb-2">
        Available: <span className="text-yellow-400">{availablePoints} Points</span>{" "}
        <span className="text-xs text-gray-400">(1 Point = ₹1)</span>
      </div>

      {/* Apply / Remove Section */}
      <AnimatePresence mode="wait">
        {appliedPoints && appliedPoints.points > 0 ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border border-yellow-500/40 rounded-none p-2"
          >
            <div className="flex justify-between items-center text-sm text-gray-200">
              <div>
                <p className="font-semibold text-yellow-400">Points Applied</p>
                <p className="text-xs text-gray-400">
                  Using {appliedPoints.points} points for ₹{appliedPoints.discount} off
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRemovePoints}
                className="border-none rounded-none px-1.5 py-1 font-semibold text-white bg-red-500 hover:bg-red-600"
              >
                Remove
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="apply"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustPoints(false)}
                disabled={pointsToUse <= 0}
                className="h-8 w-8 p-0 border-gray-600 bg-gray-800"
              >
                <Minus className="h-4 w-4 text-gray-300" />
              </Button>

              <Input
                type="number"
                value={pointsToUse}
                onChange={(e) =>
                  setPointsToUse(
                    Math.min(
                      Math.max(0, parseInt(DOMPurify.sanitize(e.target.value)) || 0),
                      Math.min(availablePoints, cartTotal)
                    )
                  )
                }
                className="text-center bg-gray-800 text-gray-200 border-gray-600 focus:ring-yellow-400"
                placeholder="Enter points"
                min={0}
                max={Math.min(availablePoints, cartTotal)}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustPoints(true)}
                disabled={pointsToUse >= Math.min(availablePoints, cartTotal)}
                className="h-8 w-8 p-0 border-gray-600 bg-gray-800"
              >
                <Plus className="h-4 w-4 text-gray-300" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Manual Action Buttons */}
            <div className="flex gap-2 mb-10">
              <Button
                onClick={handleApplyPoints}
                disabled={pointsToUse <= 0}
                className="flex-1 text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-black rounded-none"
              >
                Apply Points
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const maxUse = Math.min(availablePoints, cartTotal);
                  setPointsToUse(maxUse);
                  toast.info(`Set to max usable points: ${maxUse}`);
                }}
                className="text-xs border-gray-600 hover:bg-gray-800 text-gray-300"
              >
                Use Max
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardPointsSection;
