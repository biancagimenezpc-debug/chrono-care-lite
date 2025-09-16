import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

type Patient = Tables<'patients'>

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar pacientes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) throw error

      setPatients(prev => [data, ...prev])
      toast({
        title: "Paciente creado",
        description: `${data.name} ha sido registrado exitosamente`,
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al crear paciente",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPatients(prev => prev.map(p => p.id === id ? data : p))
      toast({
        title: "Paciente actualizado",
        description: "Los datos han sido actualizados correctamente",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al actualizar paciente",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deletePatient = async (id: string) => {
    try {
      console.log('Attempting to delete patient with ID:', id)
      
      const { data, error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)
        .select() // Return deleted data to confirm deletion

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }

      console.log('Patient deleted successfully:', data)
      setPatients(prev => prev.filter(p => p.id !== id))
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado correctamente",
      })
    } catch (error: any) {
      console.error('Delete patient error:', error)
      toast({
        title: "Error al eliminar paciente",
        description: error.message || "Error desconocido al eliminar el paciente",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  return {
    patients,
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    refetch: fetchPatients
  }
}