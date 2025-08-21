-- Update orders table structure for coupon_code and reward_points_used
ALTER TABLE public.orders 
ALTER COLUMN coupon_code TYPE jsonb USING 
  CASE 
    WHEN coupon_code IS NULL THEN NULL
    WHEN coupon_code = '' THEN NULL
    ELSE jsonb_build_object('code', coupon_code, 'discount', 0)
  END;

ALTER TABLE public.orders 
ALTER COLUMN reward_points_used TYPE jsonb USING 
  CASE 
    WHEN reward_points_used IS NULL THEN NULL
    ELSE jsonb_build_object('points', reward_points_used, 'discount', 0)
  END;