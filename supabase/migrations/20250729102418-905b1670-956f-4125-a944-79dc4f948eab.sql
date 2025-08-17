-- Fix missing function for admin settings update
CREATE OR REPLACE FUNCTION public.update_admin_settings(
  p_site_name text,
  p_site_description text,
  p_contact_email text,
  p_contact_phone text,
  p_business_address text,
  p_delivery_fee numeric,
  p_min_order_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_settings
  SET 
    site_name = p_site_name,
    site_description = p_site_description,
    contact_email = p_contact_email,
    contact_phone = p_contact_phone,
    business_address = p_business_address,
    delivery_fee = p_delivery_fee,
    min_order_amount = p_min_order_amount,
    updated_at = NOW()
  WHERE id = 1;
  
  -- If no row exists, insert it
  IF NOT FOUND THEN
    INSERT INTO public.admin_settings (
      id, site_name, site_description, contact_email, contact_phone,
      business_address, delivery_fee, min_order_amount
    ) VALUES (
      1, p_site_name, p_site_description, p_contact_email, p_contact_phone,
      p_business_address, p_delivery_fee, p_min_order_amount
    );
  END IF;
END;
$$;