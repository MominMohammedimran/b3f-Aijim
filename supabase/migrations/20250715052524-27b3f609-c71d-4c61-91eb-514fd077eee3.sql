-- Fix admin login and order update issues

-- Temporarily disable RLS for admin_users to allow login check
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with a more permissive policy for login checks
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Only b3fprintingsolutions can access admin_users" ON public.admin_users;

-- Create new policy that allows email checks for login
CREATE POLICY "Allow admin email lookup for login" 
ON public.admin_users 
FOR SELECT 
USING (email = 'b3fprintingsolutions@gmail.com');

-- Allow admin user management for authenticated admins
CREATE POLICY "Admin can manage admin records" 
ON public.admin_users 
FOR ALL 
USING (auth.email() = 'b3fprintingsolutions@gmail.com' AND email = 'b3fprintingsolutions@gmail.com');

-- Update the is_admin function to be more reliable
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simply check if the email matches and exists in admin_users
  RETURN user_email = 'b3fprintingsolutions@gmail.com' AND EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
      AND role = ANY (ARRAY['admin', 'super_admin'])
  );
END;
$$;

-- Update orders policies to ensure admin can update order status
DROP POLICY IF EXISTS "Only specific admin can update all orders" ON public.orders;

CREATE POLICY "Admin can update all orders" 
ON public.orders 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'b3fprintingsolutions@gmail.com')
);

-- Also ensure admin can view all orders
DROP POLICY IF EXISTS "Only specific admin can view all orders" ON public.orders;

CREATE POLICY "Admin can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'b3fprintingsolutions@gmail.com')
);