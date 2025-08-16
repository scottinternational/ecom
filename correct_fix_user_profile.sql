-- =====================================================
-- Correct Fix: Create Missing User Profile
-- =====================================================
-- This script creates the missing user profile for the current user

-- Create the missing profile for the user (without role column)
INSERT INTO public.profiles (id, email, full_name, avatar_url, department, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  au.raw_user_meta_data->>'avatar_url',
  au.raw_user_meta_data->>'department',
  au.created_at,
  au.created_at
FROM auth.users au
WHERE au.id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28'
ON CONFLICT (id) DO NOTHING;

-- Also create a default user role for the user
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  '2efc4733-1e0d-4bc2-85b1-0058b5caab28',
  'viewer',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28'
);

-- Verify the profile was created
SELECT 
  id,
  email,
  full_name,
  avatar_url,
  department,
  created_at
FROM public.profiles 
WHERE id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';

-- Verify the user role was created
SELECT 
  ur.user_id,
  ur.role,
  ur.created_at
FROM public.user_roles ur
WHERE ur.user_id = '2efc4733-1e0d-4bc2-85b1-0058b5caab28';
