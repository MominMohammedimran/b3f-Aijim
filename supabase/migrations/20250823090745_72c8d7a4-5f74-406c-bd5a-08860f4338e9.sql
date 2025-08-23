-- Update orders table to use JSONB for coupon_code and reward_points_used
ALTER TABLE orders 
ALTER COLUMN coupon_code TYPE JSONB USING 
  CASE 
    WHEN coupon_code IS NULL THEN NULL 
    WHEN coupon_code = '' THEN NULL
    ELSE jsonb_build_object('code', coupon_code, 'discount_amount', 0)
  END;

ALTER TABLE orders 
ALTER COLUMN reward_points_used TYPE JSONB USING 
  CASE 
    WHEN reward_points_used IS NULL THEN NULL 
    ELSE jsonb_build_object('points', reward_points_used, 'value_used', reward_points_used)
  END;

-- Make paymentproofs bucket public for admin uploaded images
UPDATE storage.buckets SET public = true WHERE id = 'paymentproofs';