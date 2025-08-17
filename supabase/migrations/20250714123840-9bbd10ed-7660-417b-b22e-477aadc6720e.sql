-- Create a policy that allows admin users to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.role IN ('admin', 'super_admin')
  )
);

-- Create a policy that allows admin users to update all orders
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.role IN ('admin', 'super_admin')
  )
);

-- Create a policy that allows admin users to delete orders
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.role IN ('admin', 'super_admin')
  )
);