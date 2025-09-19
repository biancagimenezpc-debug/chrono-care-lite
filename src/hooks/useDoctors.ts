import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

type Doctor = {
  user_id: string
  full_name: string
  specialty: string | null
  email: string
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, specialty, email')
        .eq('role', 'doctor')
        .eq('is_active', true)
        .order('full_name', { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar médicos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  return {
    doctors,
    loading,
    refetch: fetchDoctors
  }
}
