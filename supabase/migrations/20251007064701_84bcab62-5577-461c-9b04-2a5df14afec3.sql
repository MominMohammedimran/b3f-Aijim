-- Update admin email from b3fprintingsolutions@gmail.com to aijim.official@gmail.com
UPDATE public.admin_users 
SET email = 'aijim.official@gmail.com', 
    updated_at = NOW()
WHERE email = 'b3fprintingsolutions@gmail.com';

-- Update admin settings contact email
UPDATE public.admin_settings 
SET contact_email = 'aijim.official@gmail.com',
    updated_at = NOW()
WHERE contact_email = 'b3fprintingsolutions@gmail.com';

-- Update RLS policies to use new admin email
DROP POLICY IF EXISTS "Admin can manage settings" ON public.admin_settings;
CREATE POLICY "Admin can manage settings" 
ON public.admin_settings 
FOR ALL 
USING (auth.email() = 'aijim.official@gmail.com')
WITH CHECK (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can manage all products" ON public.products;
CREATE POLICY "Admin can manage all products" 
ON public.products 
FOR ALL 
USING (auth.email() = 'aijim.official@gmail.com')
WITH CHECK (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can manage all coupons" ON public.coupons;
CREATE POLICY "Admin can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (auth.email() = 'aijim.official@gmail.com')
WITH CHECK (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id) OR (auth.email() = 'aijim.official@gmail.com'));

DROP POLICY IF EXISTS "Admin can update all orders" ON public.orders;
CREATE POLICY "Admin can update all orders" 
ON public.orders 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (auth.email() = 'aijim.official@gmail.com'));

DROP POLICY IF EXISTS "Only specific admin can delete orders" ON public.orders;
CREATE POLICY "Only specific admin can delete orders" 
ON public.orders 
FOR DELETE 
USING (
  ((auth.uid() = user_id) AND ((payment_status IS NULL) OR (payment_status <> 'paid'))) 
  OR 
  ((auth.email() = 'aijim.official@gmail.com') AND (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.email() AND role = ANY (ARRAY['admin', 'super_admin'])
  )))
);

DROP POLICY IF EXISTS "Admin can view all payment issues" ON public.payment_issues;
CREATE POLICY "Admin can view all payment issues" 
ON public.payment_issues 
FOR SELECT 
USING (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can update all payment issues" ON public.payment_issues;
CREATE POLICY "Admin can update all payment issues" 
ON public.payment_issues 
FOR UPDATE 
USING (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can view all order issues" ON public.order_issues;
CREATE POLICY "Admin can view all order issues" 
ON public.order_issues 
FOR SELECT 
USING (auth.email() = 'aijim.official@gmail.com');

DROP POLICY IF EXISTS "Admin can update all order issues" ON public.order_issues;
CREATE POLICY "Admin can update all order issues" 
ON public.order_issues 
FOR UPDATE 
USING (auth.email() = 'aijim.official@gmail.com');

-- Update the is_admin function
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