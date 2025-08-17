-- Remove any other admin users and ensure only b3fprintingsolutions@gmail.com can be admin
DELETE FROM public.admin_users WHERE email != 'b3fprintingsolutions@gmail.com';

-- Update the is_admin function to only allow the specific email
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN user_email = 'b3fprintingsolutions@gmail.com' AND EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
      AND role = ANY (ARRAY['admin', 'super_admin'])
  );
END;
$$;

-- Update admin_users RLS policies to be more restrictive
DROP POLICY IF EXISTS "Admin can view their own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read their own row" ON public.admin_users;
DROP POLICY IF EXISTS "Allow email check for login" ON public.admin_users;

-- Only allow the specific admin email to access admin_users table
CREATE POLICY "Only b3fprintingsolutions can access admin_users" 
ON public.admin_users 
FOR ALL 
USING (email = 'b3fprintingsolutions@gmail.com' AND auth.email() = 'b3fprintingsolutions@gmail.com');

-- Update orders policies to be more restrictive for admin access
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Only allow b3fprintingsolutions@gmail.com to have admin access to orders
CREATE POLICY "Only specific admin can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'b3fprintingsolutions@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);

CREATE POLICY "Only specific admin can update all orders" 
ON public.orders 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'b3fprintingsolutions@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);

CREATE POLICY "Only specific admin can delete orders" 
ON public.orders 
FOR DELETE 
USING (
  ((auth.uid() = user_id) AND ((payment_status IS NULL) OR (payment_status <> 'paid'::text))) OR
  (auth.email() = 'b3fprintingsolutions@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);