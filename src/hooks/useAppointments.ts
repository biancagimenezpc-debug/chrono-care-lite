import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

type Appointment = Tables<'appointments'>

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar citas",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'doctor_id' | 'patient_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ 
          ...appointmentData, 
          doctor_id: user.id,
          patient_id: null
        }])
        .select()
        .single()

      if (error) throw error

      setAppointments(prev => [...prev, data].sort((a, b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateComparison !== 0) return dateComparison
        return a.time.localeCompare(b.time)
      }))
      
      toast({
        title: "Cita agendada",
        description: `Cita para ${data.patient_name} el ${data.date} a las ${data.time}`,
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al agendar cita",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAppointments(prev => prev.map(a => a.id === id ? data : a))
      toast({
        title: "Cita actualizada",
        description: "La cita ha sido actualizada correctamente",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al actualizar cita",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAppointments(prev => prev.filter(a => a.id !== id))
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al eliminar cita",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  }
}