export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          consultation_type: string
          created_at: string
          date: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          status: string
          time: string
        }
        Insert: {
          consultation_type: string
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          status?: string
          time: string
        }
        Update: {
          consultation_type?: string
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          status?: string
          time?: string
        }
        Relationships: []
      }
      configurations: {
        Row: {
          appointment_duration: number | null
          break_time_end: string | null
          break_time_start: string | null
          clinic_address: string | null
          clinic_description: string | null
          clinic_email: string | null
          clinic_name: string | null
          clinic_phone: string | null
          created_at: string
          doctor_license: string | null
          doctor_name: string | null
          doctor_specialty: string | null
          email_reminders_enabled: boolean | null
          id: string
          is_active: boolean | null
          notifications_enabled: boolean | null
          sms_reminders_enabled: boolean | null
          updated_at: string
          user_id: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          appointment_duration?: number | null
          break_time_end?: string | null
          break_time_start?: string | null
          clinic_address?: string | null
          clinic_description?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string
          doctor_license?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          email_reminders_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          notifications_enabled?: boolean | null
          sms_reminders_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          appointment_duration?: number | null
          break_time_end?: string | null
          break_time_start?: string | null
          clinic_address?: string | null
          clinic_description?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinic_phone?: string | null
          created_at?: string
          doctor_license?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          email_reminders_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          notifications_enabled?: boolean | null
          sms_reminders_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          consultation_type: string
          created_at: string
          date: string
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          medications: string | null
          notes: string | null
          patient_id: string
          patient_name: string
          symptoms: string | null
          treatment: string | null
        }
        Insert: {
          consultation_type: string
          created_at?: string
          date: string
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id: string
          patient_name: string
          symptoms?: string | null
          treatment?: string | null
        }
        Update: {
          consultation_type?: string
          created_at?: string
          date?: string
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          patient_id?: string
          patient_name?: string
          symptoms?: string | null
          treatment?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          birth_date: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          gender: string | null
          id: string
          insurance: string | null
          medical_conditions: string[] | null
          medications: string[] | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          id?: string
          insurance?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: string | null
          id?: string
          insurance?: string | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          license_number: string | null
          role: string
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
