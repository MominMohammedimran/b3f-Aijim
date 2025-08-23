-- Update orders table to use JSONB for coupon_code and reward_points_used safely
-- First handle coupon_code conversion
ALTER TABLE orders 
ALTER COLUMN coupon_code TYPE JSONB USING 
  CASE 
    WHEN coupon_code IS NULL OR coupon_code = '' OR coupon_code = '""' THEN NULL 
    WHEN coupon_code::text LIKE '{%}' THEN coupon_code::jsonb
    ELSE jsonb_build_object('code', coupon_code::text, 'discount_amount', 0)
  END;

-- Handle reward_points_used conversion  
ALTER TABLE orders 
ALTER COLUMN reward_points_used TYPE JSONB USING 
  CASE 
    WHEN reward_points_used IS NULL THEN NULL 
    WHEN reward_points_used = 0 THEN NULL
    ELSE jsonb_build_object('points', reward_points_used, 'value_used', reward_points_used)
  END;

-- Make paymentproofs bucket public for admin uploaded images
UPDATE storage.buckets SET public = true WHERE id = 'paymentproofs';