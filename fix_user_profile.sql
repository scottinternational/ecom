-- =====================================================
-- Fix Missing User Profile Issue
-- =====================================================
-- This script ensures the current user exists in the profiles table

-- First, let's check if the user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';

-- Check if the user exists in profiles table
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';

-- If the user doesn't exist in profiles, create them
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  'user',
  au.created_at,
  au.created_at
FROM auth.users au
WHERE au.id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the profile was created
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';

-- Also, let's make sure the handle_new_user trigger is working
-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';

-- If the trigger doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'handle_new_user'
  ) THEN
    -- Create the function first
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        'user',
        NEW.created_at,
        NEW.created_at
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Then create the trigger
    CREATE TRIGGER handle_new_user
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
