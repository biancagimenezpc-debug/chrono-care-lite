import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

export type UserProfile = {
  id: string
  created_at: string
  email: string
  full_name: string
  role: 'admin' | 'doctor'
  specialty?: string
  license_number?: string
  is_active: boolean
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar usuarios",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setCurrentUserRole(data?.role || null)
    } catch (error: any) {
      console.error('Error getting user role:', error)
    }
  }

  const createUser = async (userData: {
    email: string
    password: string
    full_name: string
    role: 'admin' | 'doctor'
    specialty?: string
    license_number?: string
  }) => {
    try {
      // Only admins can create users
      if (currentUserRole !== 'admin') {
        throw new Error('Solo los administradores pueden crear usuarios')
      }

      // Create auth user (this would typically be done via admin SDK or edge function)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      })

      if (authError) throw authError

      // Create user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          specialty: userData.specialty,
          license_number: userData.license_number
        }])
        .select()
        .single()

      if (error) throw error

      setUsers(prev => [data, ...prev])
      toast({
        title: "Usuario creado",
        description: `${data.full_name} ha sido registrado exitosamente`,
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    try {
      if (currentUserRole !== 'admin') {
        throw new Error('Solo los administradores pueden modificar usuarios')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setUsers(prev => prev.map(u => u.id === id ? data : u))
      toast({
        title: "Usuario actualizado",
        description: "Los datos han sido actualizados correctamente",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al actualizar usuario",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const toggleUserStatus = async (id: string, is_active: boolean) => {
    try {
      if (currentUserRole !== 'admin') {
        throw new Error('Solo los administradores pueden cambiar el estado de usuarios')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setUsers(prev => prev.map(u => u.id === id ? data : u))
      toast({
        title: is_active ? "Usuario activado" : "Usuario desactivado",
        description: "El estado del usuario ha sido actualizado",
      })
      
      return data
    } catch (error: any) {
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    getCurrentUserRole()
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    currentUserRole,
    createUser,
    updateUser,
    toggleUserStatus,
    refetch: fetchUsers,
    isAdmin: currentUserRole === 'admin'
  }
}