-- Drops the existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;

-- Create the admin policy with proper syntax
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create the read policy with proper syntax
CREATE POLICY "Anyone can read products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Enable RLS on the products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;