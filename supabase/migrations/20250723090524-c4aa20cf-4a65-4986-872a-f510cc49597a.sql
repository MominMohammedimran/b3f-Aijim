-- Create a trigger to automatically add reward points to user profiles when orders are paid

CREATE OR REPLACE FUNCTION add_reward_points_on_order_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add points if payment status changed to 'paid' and order has reward points earned
  IF NEW.payment_status = 'paid' AND 
     (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') AND 
     NEW.reward_points_earned > 0 THEN
    
    -- Add reward points to user profile
    UPDATE profiles 
    SET reward_points = COALESCE(reward_points, 0) + NEW.reward_points_earned,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic reward points addition
CREATE TRIGGER trigger_add_reward_points_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION add_reward_points_on_order_payment();