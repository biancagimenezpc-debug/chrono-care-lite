import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/components/ui/use-toast'

export type UserProfile = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string
  role: string
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
        .eq('user_id', user.id)
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
    role: string
    specialty?: string
    license_number?: string
  }) => {
    try {
      // Only admins can create users
      if (currentUserRole !== 'admin') {
        throw new Error('Solo los administradores pueden crear usuarios')
      }

      // Call edge function to create user
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-admin-user', {
        body: userData
      })

      if (functionError) throw functionError

      // Refresh users list
      await fetchUsers()
      
      toast({
        title: "Usuario creado",
        description: `${userData.full_name} ha sido registrado exitosamente`,
      })
      
      return functionData
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

      // First check if the user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('id', id)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error('Usuario no encontrado')
        }
        throw checkError
      }

      if (!existingUser) {
        throw new Error('Usuario no encontrado')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No se pudo actualizar el usuario')
      }

      setUsers(prev => prev.map(u => u.id === id ? data : u))
      toast({
        title: "Usuario actualizado",
        description: `${existingUser.full_name} ha sido actualizado correctamente`,
      })
      
      return data
    } catch (error: any) {
      console.error('Update user error:', error)
      toast({
        title: "Error al actualizar usuario",
        description: error.message || "Error desconocido al actualizar el usuario",
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

      // First check if the user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, full_name, is_active')
        .eq('id', id)
        .single()

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          throw new Error('Usuario no encontrado')
        }
        throw checkError
      }

      if (!existingUser) {
        throw new Error('Usuario no encontrado')
      }

      // Prevent admin from deactivating themselves
      const { data: { user } } = await supabase.auth.getUser()
      if (user && existingUser.id === user.id && !is_active) {
        throw new Error('No puedes desactivar tu propia cuenta')
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No se pudo actualizar el usuario')
      }

      setUsers(prev => prev.map(u => u.id === id ? data : u))
      toast({
        title: is_active ? "Usuario activado" : "Usuario desactivado",
        description: `${existingUser.full_name} ha sido ${is_active ? 'activado' : 'desactivado'} correctamente`,
      })
      
      return data
    } catch (error: any) {
      console.error('Toggle user status error:', error)
      toast({
        title: "Error al cambiar estado",
        description: error.message || "Error desconocido al cambiar el estado del usuario",
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