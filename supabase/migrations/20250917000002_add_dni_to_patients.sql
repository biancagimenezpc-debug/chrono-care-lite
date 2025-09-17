-- Add DNI field to patients table with unique constraint
ALTER TABLE public.patients 
ADD COLUMN dni TEXT;

-- Create unique index for DNI to prevent duplicates
CREATE UNIQUE INDEX idx_patients_dni_unique 
ON public.patients (dni) 
WHERE dni IS NOT NULL;

-- Add comment explaining the DNI field
COMMENT ON COLUMN public.patients.dni IS 'Documento Nacional de Identidad - must be unique per patient';