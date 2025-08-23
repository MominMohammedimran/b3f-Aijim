-- Update reward_points_used to use JSONB format (coupon_code is already JSONB)
ALTER TABLE orders 
ALTER COLUMN reward_points_used TYPE JSONB USING 
  CASE 
    WHEN reward_points_used IS NULL OR reward_points_used = 0 THEN NULL 
    ELSE jsonb_build_object('points', reward_points_used, 'value_used', reward_points_used)
  END;

-- Make paymentproofs bucket public for admin uploaded images
UPDATE storage.buckets SET public = true WHERE id = 'paymentproofs';