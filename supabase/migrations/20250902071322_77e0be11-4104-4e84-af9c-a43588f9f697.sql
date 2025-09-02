-- Fix validate_coupon function security by setting search_path
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code_input text, cart_total numeric, user_id_input uuid DEFAULT NULL)
 RETURNS TABLE(valid boolean, discount_amount numeric, message text, coupon_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  coupon_record RECORD;
  calculated_discount NUMERIC := 0;
  user_has_used_coupon BOOLEAN := false;
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
  
  -- Check if user has already used this coupon (if user_id is provided)
  IF user_id_input IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 
      FROM public.orders 
      WHERE user_id = user_id_input 
        AND coupon_code::text ILIKE '%' || coupon_code_input || '%'
        AND payment_status = 'paid'
    ) INTO user_has_used_coupon;
    
    IF user_has_used_coupon THEN
      RETURN QUERY SELECT false, 0::NUMERIC, 'Coupon already used'::TEXT, NULL::UUID;
      RETURN;
    END IF;
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
$function$;