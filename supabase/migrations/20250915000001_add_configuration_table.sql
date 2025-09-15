-- Crear tabla de configuración para horarios y configuración de la clínica
CREATE TABLE configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_name TEXT DEFAULT 'MediClinic',
    clinic_address TEXT,
    clinic_phone TEXT,
    clinic_email TEXT,
    clinic_description TEXT,
    doctor_name TEXT,
    doctor_specialty TEXT,
    doctor_license TEXT,
    appointment_duration INTEGER DEFAULT 30,
    working_hours_start TIME DEFAULT '08:00',
    working_hours_end TIME DEFAULT '18:00',
    working_days TEXT[] DEFAULT '{"monday","tuesday","wednesday","thursday","friday"}',
    notifications_enabled BOOLEAN DEFAULT true,
    email_reminders_enabled BOOLEAN DEFAULT true,
    sms_reminders_enabled BOOLEAN DEFAULT false,
    break_time_start TIME DEFAULT '12:00',
    break_time_end TIME DEFAULT '14:00',
    is_active BOOLEAN DEFAULT true
);

-- Habilitar Row Level Security
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Política de seguridad - Los usuarios solo pueden ver y editar su configuración
CREATE POLICY "Users can only see their own configuration" ON configurations
    FOR ALL USING (auth.uid() = user_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración por defecto para usuarios existentes
INSERT INTO configurations (user_id, clinic_name)
SELECT id, 'MediClinic'
FROM auth.users
ON CONFLICT DO NOTHING;