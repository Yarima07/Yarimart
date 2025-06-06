/*
  # Fix Orders-Users Relationship

  1. Changes
    - Fix the relationship between orders.user_id and users.id
    - Ensures the users table exists (if it doesn't already)
    - Sets up the foreign key constraint properly for join queries
  
  2. Security
    - No changes to RLS policies
*/

-- First ensure the users table exists (if it doesn't already)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Make sure the orders table has the correct foreign key constraint
DO $$
BEGIN
  -- Check if the constraint exists and drop it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
  
  -- Add the constraint properly
  ALTER TABLE orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
END $$;

-- Make sure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add basic policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data" 
      ON users FOR SELECT 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data" 
      ON users FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END $$;