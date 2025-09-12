-- Crear las tablas necesarias para el sistema médico

-- Tabla de pacientes
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    insurance TEXT,
    medical_conditions TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}'
);

-- Tabla de citas
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    consultation_type TEXT NOT NULL,
    status TEXT DEFAULT 'programada' CHECK (status IN ('programada', 'confirmada', 'completada', 'cancelada')),
    notes TEXT,
    doctor_id UUID REFERENCES auth.users(id)
);

-- Tabla de historias clínicas
CREATE TABLE medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    date DATE NOT NULL,
    consultation_type TEXT NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    notes TEXT,
    follow_up_date DATE,
    doctor_id UUID REFERENCES auth.users(id)
);

-- Tabla de archivos médicos
CREATE TABLE medical_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad - Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can only see their own patients" ON patients
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own appointments" ON appointments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own medical records" ON medical_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own medical files" ON medical_files
    FOR ALL USING (auth.uid() = user_id);

-- Crear bucket para almacenamiento de archivos médicos
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false);

-- Política de almacenamiento - Solo el propietario puede acceder a sus archivos
CREATE POLICY "Users can upload their own medical files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own medical files" ON storage.objects
    FOR SELECT USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medical files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medical files" ON storage.objects
    FOR DELETE USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);