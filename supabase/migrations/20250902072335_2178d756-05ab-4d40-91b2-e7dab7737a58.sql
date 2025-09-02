-- Add RLS policies for admin to manage coupons
CREATE POLICY "Admin can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (auth.email() = 'b3fprintingsolutions@gmail.com'::text)
WITH CHECK (auth.email() = 'b3fprintingsolutions@gmail.com'::text);