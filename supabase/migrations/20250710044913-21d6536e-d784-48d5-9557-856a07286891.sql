
-- Fix infinite recursion in admin_users RLS policy
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;

-- Create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.get_admin_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT, role TEXT, permissions JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.role, au.permissions
  FROM public.admin_users au
  WHERE au.email = user_email;
END;
$$;

-- Create a new safe policy for admin_users that doesn't cause recursion
CREATE POLICY "Admins can read their own row"
  ON public.admin_users
  FOR SELECT
  USING (auth.email() = email);

-- Update the is_admin function to be more robust
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = user_email
      AND role = ANY (ARRAY['admin', 'super_admin'])
  );
END;
$$;
