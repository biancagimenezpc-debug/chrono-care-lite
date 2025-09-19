-- Fix RLS policies for user_profiles to allow admins to manage all users
-- This fixes the error when trying to disable/enable users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create new role-based policies for user_profiles
CREATE POLICY "Role-based user profiles select" 
ON public.user_profiles 
FOR SELECT 
USING (
  -- All authenticated users can view profiles
  auth.role() = 'authenticated'
);

CREATE POLICY "Role-based user profiles update" 
ON public.user_profiles 
FOR UPDATE 
USING (
  -- Administradores pueden actualizar cualquier perfil
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Usuarios pueden actualizar su propio perfil
  auth.uid() = user_id
);

CREATE POLICY "Role-based user profiles insert" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  -- Administradores pueden crear perfiles para cualquier usuario
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Usuarios pueden crear su propio perfil
  auth.uid() = user_id
);

-- Add comment explaining the new permission system
COMMENT ON POLICY "Role-based user profiles update" ON public.user_profiles IS 
'Allows admins to update any user profile, users can only update their own';

COMMENT ON POLICY "Role-based user profiles select" ON public.user_profiles IS 
'Allows all authenticated users to view user profiles';
