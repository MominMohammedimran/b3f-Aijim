-- Fix security issue: Restrict admin_users table access to authenticated admin only
-- Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Allow admin email lookup for login" ON public.admin_users;

-- Create a secure policy that only allows authenticated admin to view their own record
CREATE POLICY "Admin can view own record only" 
ON public.admin_users 
FOR SELECT 
USING (
  auth.email() = 'b3fprintingsolutions@gmail.com' 
  AND email = auth.email()
);

-- Ensure the admin management policy is also secure
DROP POLICY IF EXISTS "Admin can manage admin records" ON public.admin_users;

CREATE POLICY "Authenticated admin can manage own records" 
ON public.admin_users 
FOR ALL 
USING (
  auth.email() = 'b3fprintingsolutions@gmail.com' 
  AND email = auth.email()
) 
WITH CHECK (
  auth.email() = 'b3fprintingsolutions@gmail.com' 
  AND email = auth.email()
);