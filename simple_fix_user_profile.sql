-- =====================================================
-- Simple Fix: Create Missing User Profile
-- =====================================================
-- This script creates the missing user profile for the current user

-- Create the missing profile for the user
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
ON CONFLICT (id) DO NOTHING;

-- Verify the profile was created
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';

-- Check if handle_new_user trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';
