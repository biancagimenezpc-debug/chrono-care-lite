-- Add missing DELETE policies for patients and appointments tables
-- This fixes the issue where delete operations fail due to missing RLS permissions

-- Add DELETE policy for patients table
CREATE POLICY "All authenticated users can delete patients" 
ON public.patients 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Add DELETE policy for appointments table  
CREATE POLICY "All authenticated users can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Add DELETE policy for medical records table (for completeness)
CREATE POLICY "All authenticated users can delete medical records" 
ON public.medical_records 
FOR DELETE 
USING (auth.role() = 'authenticated');