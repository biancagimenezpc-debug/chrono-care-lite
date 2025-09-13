-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'doctor',
  specialty TEXT,
  license_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  insurance TEXT,
  medical_conditions TEXT[],
  medications TEXT[],
  allergies TEXT[]
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patients
CREATE POLICY "All authenticated users can view patients" 
ON public.patients 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  consultation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'programada' CHECK (status IN ('programada', 'confirmada', 'completada', 'cancelada')),
  notes TEXT,
  doctor_id UUID NOT NULL
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointments
CREATE POLICY "All authenticated users can view appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create medical records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  date DATE NOT NULL,
  consultation_type TEXT NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  notes TEXT,
  follow_up_date DATE,
  doctor_id UUID NOT NULL
);

-- Enable RLS on medical records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for medical records
CREATE POLICY "All authenticated users can view medical records" 
ON public.medical_records 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert medical records" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update medical records" 
ON public.medical_records 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();