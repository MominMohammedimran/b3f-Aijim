-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_admin_settings();
DROP FUNCTION IF EXISTS public.update_admin_settings(jsonb);

-- Create admin_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'AIJIM',
  site_description TEXT DEFAULT 'Premium Oversized Tees @Affordable',
  contact_email TEXT DEFAULT 'aijim.official@gmail.com',
  contact_phone TEXT DEFAULT '+91 - 7672080881',
  business_address TEXT DEFAULT 'India',
  delivery_fee NUMERIC DEFAULT 80,
  min_order_amount NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admin can manage settings" ON public.admin_settings;

-- Create policy for admins only
CREATE POLICY "Admin can manage settings" ON public.admin_settings
FOR ALL USING (auth.email() = 'aijim.official@gmail.com');

-- Insert default settings if not exists
INSERT INTO public.admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create get_admin_settings function that returns actual data
CREATE OR REPLACE FUNCTION public.get_admin_settings()
RETURNS TABLE(
  site_name TEXT,
  site_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  business_address TEXT,
  delivery_fee NUMERIC,
  min_order_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.site_name,
    s.site_description,
    s.contact_email,
    s.contact_phone,
    s.business_address,
    s.delivery_fee,
    s.min_order_amount
  FROM public.admin_settings s
  WHERE s.id = 1;
END;
$$;

-- Create update_admin_settings function that matches AdminSettings.tsx parameters
CREATE OR REPLACE FUNCTION public.update_admin_settings(
  p_site_name TEXT,
  p_site_description TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_business_address TEXT,
  p_delivery_fee NUMERIC,
  p_min_order_amount NUMERIC
)
RETURNS VOID
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