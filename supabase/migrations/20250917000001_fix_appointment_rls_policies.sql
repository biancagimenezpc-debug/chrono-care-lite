-- Fix RLS policies for appointments to ensure proper doctor isolation
-- This fixes the issue where appointments from all doctors were visible to everyone

-- Drop existing policies
DROP POLICY IF EXISTS "All authenticated users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "All authenticated users can insert appointments" ON public.appointments;  
DROP POLICY IF EXISTS "All authenticated users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "All authenticated users can delete appointments" ON public.appointments;

-- Create new policies that filter by doctor_id
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can delete their own appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.uid() = doctor_id);

-- Also fix medical records policies for consistency
DROP POLICY IF EXISTS "All authenticated users can view medical records" ON public.medical_records;
DROP POLICY IF EXISTS "All authenticated users can insert medical records" ON public.medical_records;
DROP POLICY IF EXISTS "All authenticated users can update medical records" ON public.medical_records;
DROP POLICY IF EXISTS "All authenticated users can delete medical records" ON public.medical_records;

CREATE POLICY "Users can view their own medical records" 
ON public.medical_records 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert their own medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update their own medical records" 
ON public.medical_records 
FOR UPDATE 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can delete their own medical records" 
ON public.medical_records 
FOR DELETE 
USING (auth.uid() = doctor_id);