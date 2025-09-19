-- Implement role-based permissions for appointments and medical records
-- This allows admins to see all data while doctors only see their own

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

-- Create new role-based policies for appointments
CREATE POLICY "Role-based appointment select" 
ON public.appointments 
FOR SELECT 
USING (
  -- Administradores pueden ver todas las citas
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Doctores solo ven sus propias citas
  doctor_id = auth.uid()
);

CREATE POLICY "Role-based appointment insert" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  -- Administradores pueden crear citas para cualquier médico
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Doctores solo pueden crear citas para sí mismos
  doctor_id = auth.uid()
);

CREATE POLICY "Role-based appointment update" 
ON public.appointments 
FOR UPDATE 
USING (
  -- Administradores pueden actualizar cualquier cita
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Doctores solo pueden actualizar sus propias citas
  doctor_id = auth.uid()
);

CREATE POLICY "Role-based appointment delete" 
ON public.appointments 
FOR DELETE 
USING (
  -- Administradores pueden eliminar cualquier cita
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
  OR 
  -- Doctores solo pueden eliminar sus propias citas
  doctor_id = auth.uid()
);

-- Drop existing medical records policies
DROP POLICY IF EXISTS "Users can view their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete their own medical records" ON public.medical_records;

-- Create new role-based policies for medical records
CREATE POLICY "Role-based medical records select" 
ON public.medical_records 
FOR SELECT 
USING (
  -- Todos los usuarios autenticados pueden ver historias clínicas
  -- (médicos necesitan ver historias de pacientes para consulta)
  auth.role() = 'authenticated'
);

CREATE POLICY "Role-based medical records insert" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (
  -- Solo doctores pueden crear historias clínicas
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'doctor' AND is_active = true
  )
  AND doctor_id = auth.uid()
);

CREATE POLICY "Role-based medical records update" 
ON public.medical_records 
FOR UPDATE 
USING (
  -- Solo el doctor que creó la historia puede actualizarla
  doctor_id = auth.uid()
);

CREATE POLICY "Role-based medical records delete" 
ON public.medical_records 
FOR DELETE 
USING (
  -- Solo el doctor que creó la historia puede eliminarla
  doctor_id = auth.uid()
);

-- Add comment explaining the new permission system
COMMENT ON POLICY "Role-based appointment select" ON public.appointments IS 
'Allows admins to see all appointments, doctors only see their own';

COMMENT ON POLICY "Role-based medical records select" ON public.medical_records IS 
'Allows all authenticated users to view medical records for consultation purposes';
