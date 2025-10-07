-- Remove any other admin users and ensure only aijim.official@gmail.com can be admin
DELETE FROM public.admin_users WHERE email != 'aijim.official@gmail.com';

-- Update the is_admin function to only allow the specific email
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN user_email = 'aijim.official@gmail.com' AND EXISTS (
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
CREATE POLICY "Only aijimofficial can access admin_users" 
ON public.admin_users 
FOR ALL 
USING (email = 'aijim.official@gmail.com' AND auth.email() = 'aijim.official@gmail.com');

-- Update orders policies to be more restrictive for admin access
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Only allow aijim.official@gmail.com to have admin access to orders
CREATE POLICY "Only specific admin can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'aijim.official@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);

CREATE POLICY "Only specific admin can update all orders" 
ON public.orders 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (auth.email() = 'aijim.official@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);

CREATE POLICY "Only specific admin can delete orders" 
ON public.orders 
FOR DELETE 
USING (
  ((auth.uid() = user_id) AND ((payment_status IS NULL) OR (payment_status <> 'paid'::text))) OR
  (auth.email() = 'aijim.official@gmail.com' AND EXISTS (
    SELECT 1 FROM admin_users WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  ))
);