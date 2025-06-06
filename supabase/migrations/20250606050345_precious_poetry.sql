/*
  # Fix Order-User Relationship

  1. Fixes
    - Create users table if it doesn't exist
    - Copy user data from auth.users to users table
    - Fix the foreign key relationship between orders and users tables
    - Update RLS policies for proper data access

  This migration resolves the relationship issues between orders and users tables
  to ensure proper data querying and relationships.
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Copy existing users from auth.users table to public.users table
INSERT INTO users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Fix orders table relationship
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_user_id_fkey'
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;

  -- Set any invalid user_id references to NULL to avoid constraint errors
  UPDATE orders
  SET user_id = NULL
  WHERE user_id IS NOT NULL AND
        NOT EXISTS (SELECT 1 FROM users WHERE users.id = orders.user_id);

  -- Add the constraint back properly
  ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;
END $$;

-- Create RLS policies for users table if they don't exist
DO $$
BEGIN
  -- Users can view their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data"
      ON users FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Users can update their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data"
      ON users FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  -- Admins can view all users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users"
      ON users FOR SELECT
      TO authenticated
      USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);
  END IF;
END $$;