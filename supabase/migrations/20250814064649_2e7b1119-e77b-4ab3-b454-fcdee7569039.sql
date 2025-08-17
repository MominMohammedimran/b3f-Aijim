-- Add missing user_email column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_email text;