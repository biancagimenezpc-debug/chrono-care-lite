import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

type MedicalRecord = Tables<'medical_records'>

export const useMedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar historias clínicas",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createRecord = async (recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'doctor_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('medical_records')
        .insert([{ 
          ...recordData, 
          doctor_id: user.id 
        }])
        .select()
        .single()

      if (error) throw error

      setRecords(prev => [data, ...prev])
      toast({
        title: "Historia clínica creada",
        description: `Historia para ${data.patient_name} creada exitosamente`,
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al crear historia clínica",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateRecord = async (id: string, updates: Partial<MedicalRecord>) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRecords(prev => prev.map(r => r.id === id ? data : r))
      toast({
        title: "Historia clínica actualizada",
        description: "Los datos han sido actualizados correctamente",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al actualizar historia clínica",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecords(prev => prev.filter(r => r.id !== id))
      toast({
        title: "Historia clínica eliminada",
        description: "La historia clínica ha sido eliminada correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error al eliminar historia clínica",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return {
    records,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  }
}