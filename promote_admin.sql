-- Script to promote a user to admin role
-- Replace 'your-email@example.com' with your actual email address

SELECT public.promote_user_to_admin('your-email@example.com');

-- To verify the user was promoted, run:
-- SELECT p.email, ur.role 
-- FROM public.profiles p 
-- JOIN public.user_roles ur ON p.id = ur.user_id 
-- WHERE p.email = 'your-email@example.com';
