import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Patient = {
  id: string
  created_at: string
  name: string
  dni: string
  email: string
  phone: string
  birth_date: string
  gender: string
  address: string
  emergency_contact: string
  emergency_phone: string
  insurance: string
  medical_conditions: string[]
  medications: string[]
  allergies: string[]
}

export type Appointment = {
  id: string
  created_at: string
  patient_id?: string
  patient_name: string
  patient_phone: string
  date: string
  time: string
  consultation_type: string
  status: 'programada' | 'confirmada' | 'completada' | 'cancelada'
  notes: string
  doctor_id: string
}

export type MedicalRecord = {
  id: string
  created_at: string
  patient_id: string
  patient_name: string
  date: string
  consultation_type: string
  symptoms: string
  diagnosis: string
  treatment: string
  medications: string
  notes: string
  follow_up_date: string
  doctor_id: string
}