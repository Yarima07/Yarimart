/*
  # Fix Products Table RLS Policy for Admin Access

  1. Security Changes
    - Drop the incorrect admin policy for products table
    - Create a proper admin policy that checks app_metadata for role
    - Ensure admins can perform all operations (INSERT, UPDATE, DELETE) on products

  This fixes the "new row violates row-level security policy" error by properly 
  checking the admin role in the JWT token's app_metadata section.
*/

-- Drop the existing incorrect admin policy
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create the correct admin policy that checks app_metadata for role
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);