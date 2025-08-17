-- Enable RLS on tables that don't have it enabled
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Add policies for product_images (public read access)
CREATE POLICY "Public can view product images" 
ON product_images 
FOR SELECT 
USING (true);

-- Add policies for product_variants (public read access)
CREATE POLICY "Public can view product variants" 
ON product_variants 
FOR SELECT 
USING (true);