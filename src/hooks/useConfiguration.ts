import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface Configuration {
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  clinic_name: string
  clinic_address?: string
  clinic_phone?: string
  clinic_email?: string
  clinic_description?: string
  doctor_name?: string
  doctor_specialty?: string
  doctor_license?: string
  appointment_duration: number
  working_hours_start: string
  working_hours_end: string
  working_days: string[]
  notifications_enabled: boolean
  email_reminders_enabled: boolean
  sms_reminders_enabled: boolean
  break_time_start?: string
  break_time_end?: string
  is_active: boolean
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
        setConfiguration(data)
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
          doctor_specialty: '',
          doctor_license: '',
          appointment_duration: 30,
          working_hours_start: '08:00',
          working_hours_end: '18:00',
          working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          notifications_enabled: true,
          email_reminders_enabled: true,
          sms_reminders_enabled: false,
          break_time_start: '12:00',
          break_time_end: '14:00',
          is_active: true
        }

        console.log('Creating default configuration:', defaultConfig)
        
        const { data: newConfig, error: createError } = await supabase
          .from('configurations')
          .insert([defaultConfig])
          .select()
          .single()

        if (createError) throw createError
        setConfiguration(newConfig)
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

      setConfiguration(data)
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
    const breakStart = configuration.break_time_start
    const breakEnd = configuration.break_time_end

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
    const breakStartMin = breakStart ? timeToMinutes(breakStart) : null
    const breakEndMin = breakEnd ? timeToMinutes(breakEnd) : null

    for (let time = start; time < end; time += duration) {
      // Skip break time if defined
      if (breakStartMin && breakEndMin && time >= breakStartMin && time < breakEndMin) {
        continue
      }
      
      // Make sure we don't go past end time
      if (time + duration <= end) {
        slots.push(minutesToTime(time))
      }
    }

    return slots
  }

  const isWorkingDay = (date: string): boolean => {
    if (!configuration || !configuration.working_days) {
      console.log('No configuration or working_days:', { configuration: !!configuration, working_days: configuration?.working_days })
      return false
    }

    const dayOfWeek = new Date(date).getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayOfWeek]

    console.log('Checking working day:', { date, dayOfWeek, dayName, working_days: configuration.working_days, isWorking: configuration.working_days.includes(dayName) })

    return configuration.working_days.includes(dayName)
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
    refetch: fetchConfiguration
  }
}