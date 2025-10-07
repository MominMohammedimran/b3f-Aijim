-- Grant admin full access to products table for CRUD operations
CREATE POLICY "Admin can manage all products" ON products
FOR ALL
USING (auth.email() = 'aijim.official@gmail.com')
WITH CHECK (auth.email() = 'aijim.official@gmail.com');

-- Also allow admin to view all profiles (already has some access but ensure complete access)
CREATE POLICY "Admin can view all profiles" ON profiles
FOR SELECT
USING (auth.email() = 'aijim.official@gmail.com');