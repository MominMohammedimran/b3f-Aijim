
-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Add missing columns to profiles table  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- Create missing database functions for admin settings
CREATE OR REPLACE FUNCTION get_admin_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return default admin settings
  RETURN '{"site_name": "AIJIM", "maintenance_mode": false}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION update_admin_settings(settings JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, just return the input settings
  -- In a real implementation, you'd store these in a settings table
  RETURN settings;
END;
$$;

CREATE OR REPLACE FUNCTION update_payment_status(order_id UUID, status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders 
  SET payment_status = status, updated_at = NOW() 
  WHERE id = order_id;
  
  RETURN FOUND;
END;
$$;
