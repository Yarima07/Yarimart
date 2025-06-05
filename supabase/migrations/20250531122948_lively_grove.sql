-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] NOT NULL,
  images TEXT[] NOT NULL,
  colors TEXT[],
  sizes TEXT[],
  specifications JSONB,
  details JSONB,
  rating NUMERIC NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  stock INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reading of products
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create policy to allow authenticated users with admin role to manage products
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO PUBLIC
  USING (auth.jwt() ->> 'role' = 'admin');