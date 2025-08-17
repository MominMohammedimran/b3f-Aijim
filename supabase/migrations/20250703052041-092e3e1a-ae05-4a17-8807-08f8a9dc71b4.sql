
-- Add reward_points_earned column to orders table
ALTER TABLE public.orders ADD COLUMN reward_points_earned integer DEFAULT 0;

-- Create function to update user reward points
CREATE OR REPLACE FUNCTION public.update_user_reward_points(user_id uuid, points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET reward_points = COALESCE(reward_points, 0) + points_to_add
  WHERE id = user_id;
END;
$$;
