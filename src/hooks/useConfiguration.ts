import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface Configuration {
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  clinic_name?: string
  clinic_address?: string
  clinic_phone?: string
  clinic_email?: string
  clinic_description?: string
  doctor_name?: string
  specialty?: string
  license_number?: string
  appointment_duration: number
  working_hours_start: string
  working_hours_end: string
  notifications: boolean
  email_reminders: boolean
  sms_reminders: boolean
}

export const useConfiguration = () => {
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfiguration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (data) {
        console.log('Configuration loaded:', data)
        const config: Configuration = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id,
          clinic_name: data.clinic_name,
          clinic_address: data.clinic_address,
          clinic_phone: data.clinic_phone,
          clinic_email: data.clinic_email,
          clinic_description: data.clinic_description,
          doctor_name: data.doctor_name,
          specialty: (data as any).specialty || '',
          license_number: (data as any).license_number || '',
          appointment_duration: data.appointment_duration || 30,
          working_hours_start: data.working_hours_start || '08:00',
          working_hours_end: data.working_hours_end || '18:00',
          notifications: (data as any).notifications ?? true,
          email_reminders: (data as any).email_reminders ?? true,
          sms_reminders: (data as any).sms_reminders ?? false
        }
        setConfiguration(config)
      } else {
        // Create default configuration if none exists
        const defaultConfig: Omit<Configuration, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          clinic_name: 'MediClinic',
          clinic_address: '',
          clinic_phone: '',
          clinic_email: '',
          clinic_description: '',
          doctor_name: '',
          specialty: '',
          license_number: '',
          appointment_duration: 30,
          working_hours_start: '08:00',
          working_hours_end: '18:00',
          notifications: true,
          email_reminders: true,
          sms_reminders: false
        }

        console.log('Creating default configuration:', defaultConfig)
        
        const { data: newConfig, error: createError } = await supabase
          .from('configurations')
          .insert([defaultConfig])
          .select()
          .single()

        if (createError) throw createError
        
        const config: Configuration = {
          id: newConfig.id,
          created_at: newConfig.created_at,
          updated_at: newConfig.updated_at,
          user_id: newConfig.user_id,
          clinic_name: newConfig.clinic_name,
          clinic_address: newConfig.clinic_address,
          clinic_phone: newConfig.clinic_phone,
          clinic_email: newConfig.clinic_email,
          clinic_description: newConfig.clinic_description,
          doctor_name: newConfig.doctor_name,
          specialty: (newConfig as any).specialty || '',
          license_number: (newConfig as any).license_number || '',
          appointment_duration: newConfig.appointment_duration || 30,
          working_hours_start: newConfig.working_hours_start || '08:00',
          working_hours_end: newConfig.working_hours_end || '18:00',
          notifications: (newConfig as any).notifications ?? true,
          email_reminders: (newConfig as any).email_reminders ?? true,
          sms_reminders: (newConfig as any).sms_reminders ?? false
        }
        setConfiguration(config)
      }
    } catch (error: any) {
      console.error('Error fetching configuration:', error)
      toast({
        title: "Error al cargar configuración",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfiguration = async (updates: Partial<Configuration>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      if (!configuration?.id) {
        throw new Error('No hay configuración para actualizar')
      }

      const { data, error } = await supabase
        .from('configurations')
        .update(updates)
        .eq('id', configuration.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      const config: Configuration = {
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        clinic_name: data.clinic_name,
        clinic_address: data.clinic_address,
        clinic_phone: data.clinic_phone,
        clinic_email: data.clinic_email,
        clinic_description: data.clinic_description,
        doctor_name: data.doctor_name,
        specialty: (data as any).specialty || '',
        license_number: (data as any).license_number || '',
        appointment_duration: data.appointment_duration || 30,
        working_hours_start: data.working_hours_start || '08:00',
        working_hours_end: data.working_hours_end || '18:00',
        notifications: (data as any).notifications ?? true,
        email_reminders: (data as any).email_reminders ?? true,
        sms_reminders: (data as any).sms_reminders ?? false
      }
      setConfiguration(config)
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al actualizar configuración",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const getAvailableTimeSlots = (date: string): string[] => {
    if (!configuration || !configuration.working_hours_start || !configuration.working_hours_end || !configuration.appointment_duration) return []

    const slots: string[] = []
    const startTime = configuration.working_hours_start
    const endTime = configuration.working_hours_end
    const duration = configuration.appointment_duration

    // Convert time strings to minutes since midnight
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)

    for (let time = start; time < end; time += duration) {
      // Make sure we don't go past end time
      if (time + duration <= end) {
        slots.push(minutesToTime(time))
      }
    }

    return slots
  }

  const isWorkingDay = (date: string): boolean => {
    // Since working_days is not in the current schema, default to Monday-Friday
    // Using Buenos Aires timezone (GMT-3) for consistent day calculation
    const dateObj = new Date(date + 'T12:00:00-03:00') // Force Buenos Aires timezone
    const dayOfWeek = dateObj.getDay()
    // 0=Sunday, 1=Monday, ..., 6=Saturday
    // Return true for Monday (1) through Friday (5)
    return dayOfWeek >= 1 && dayOfWeek <= 5
  }

  // Helper function to get current date in Buenos Aires timezone
  const getCurrentDateBuenosAires = (): string => {
    const now = new Date()
    // Create a date object using local timezone (which should be Buenos Aires GMT-3)
    // Use local timezone methods instead of UTC conversion
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    fetchConfiguration()
  }, [])

  return {
    configuration,
    loading,
    updateConfiguration,
    getAvailableTimeSlots,
    isWorkingDay,
    getCurrentDateBuenosAires,
    refetch: fetchConfiguration
  }
}