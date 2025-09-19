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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Get user role to determine permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Build query based on user role
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      // If user is doctor, filter by doctor_id
      if (userProfile?.role === 'doctor') {
        appointmentsQuery = appointmentsQuery.eq('doctor_id', user.id)
      }
      // If user is admin, no filter needed (will see all appointments)

      const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery

      if (appointmentsError) throw appointmentsError

      // Then get the user profiles for the doctors
      if (appointmentsData && appointmentsData.length > 0) {
        const doctorIds = [...new Set(appointmentsData.map(apt => apt.doctor_id))]
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, role, specialty')
          .in('user_id', doctorIds)

        if (doctorsError) throw doctorsError

        // Combine the data
        const appointmentsWithDoctors = appointmentsData.map(appointment => {
          const doctor = doctorsData?.find(doc => doc.user_id === appointment.doctor_id)
          return {
            ...appointment,
            doctor: doctor || null
          }
        })
        
        setAppointments(appointmentsWithDoctors)
      } else {
        setAppointments([])
      }
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

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'patient_id'> & { doctor_id?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Get user role to determine doctor_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Determine doctor_id based on user role and provided data
      let doctorId: string
      if (userProfile?.role === 'admin' && appointmentData.doctor_id) {
        // Admin can assign to any doctor
        doctorId = appointmentData.doctor_id
      } else if (userProfile?.role === 'doctor') {
        // Doctor can only assign to themselves
        doctorId = user.id
      } else {
        throw new Error('No se pudo determinar el médico asignado')
      }

      // Check for existing appointment at the same date/time for the specific doctor
      const { data: existingAppointments, error: checkError } = await supabase
        .from('appointments')
        .select('id, patient_name, time')
        .eq('date', appointmentData.date)
        .eq('time', appointmentData.time)
        .eq('doctor_id', doctorId)

      if (checkError) throw checkError

      if (existingAppointments && existingAppointments.length > 0) {
        const existing = existingAppointments[0]
        throw new Error(`Ya existe una cita programada para ${appointmentData.date} a las ${appointmentData.time} (Paciente: ${existing.patient_name})`)
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ 
          ...appointmentData, 
          doctor_id: doctorId,
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
      console.log('Attempting to delete appointment with ID:', id)
      
      const { data, error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .select() // Return deleted data to confirm deletion

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log('Appointment deleted successfully:', data)
      setAppointments(prev => prev.filter(a => a.id !== id))
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada correctamente",
      })
    } catch (error: any) {
      console.error('Delete appointment error:', error)
      toast({
        title: "Error al eliminar cita",
        description: error.message || "Error desconocido al eliminar la cita",
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