-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percent')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Public can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (active = true);

-- Add coupon fields to orders table
ALTER TABLE public.orders 
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_applied NUMERIC DEFAULT 0;

-- Create function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code_input TEXT,
  cart_total NUMERIC
)
RETURNS TABLE(
  valid BOOLEAN,
  discount_amount NUMERIC,
  message TEXT,
  coupon_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  calculated_discount NUMERIC := 0;
BEGIN
  -- Find the coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code_input AND active = true;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired coupon'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if coupon is expired
  IF coupon_record.valid_to < now() THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired coupon'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if coupon hasn't started yet
  IF coupon_record.valid_from > now() THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired coupon'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF cart_total < coupon_record.min_order_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Minimum order amount not met'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check usage limits
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Coupon usage limit exceeded'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF coupon_record.discount_type = 'flat' THEN
    calculated_discount := coupon_record.discount_value;
  ELSE -- percent
    calculated_discount := (cart_total * coupon_record.discount_value / 100);
  END IF;
  
  -- Ensure discount doesn't exceed cart total
  IF calculated_discount > cart_total THEN
    calculated_discount := cart_total;
  END IF;
  
  RETURN QUERY SELECT true, calculated_discount, ('Coupon ' || coupon_code_input || ' applied successfully!')::TEXT, coupon_record.id;
END;
$$;

-- Insert sample coupons
INSERT INTO public.coupons (code, discount_type, discount_value, valid_from, valid_to, min_order_amount, max_uses) VALUES
('SAVE100', 'flat', 200, now(), now() + interval '30 days', 500, 100),
('WELCOME10', 'percent', 10, now(), now() + interval '60 days', 200, 1000),
('FIRST50', 'flat', 50, now(), now() + interval '15 days', 100, 500);