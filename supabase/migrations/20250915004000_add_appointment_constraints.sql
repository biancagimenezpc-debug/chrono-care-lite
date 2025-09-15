-- Add unique constraint to prevent double booking of same time slot
-- This will prevent two appointments at the same date/time
ALTER TABLE public.appointments 
ADD CONSTRAINT unique_appointment_datetime 
UNIQUE (date, time, doctor_id);

-- Create index for better performance on appointment lookups
CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
ON public.appointments (date, time, doctor_id);

-- Create index for better performance on appointment lookups by patient
CREATE INDEX IF NOT EXISTS idx_appointments_patient 
ON public.appointments (patient_name, patient_phone);