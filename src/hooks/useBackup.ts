import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export const useBackup = () => {
  
  const createFullBackup = async () => {
    try {
      const backupData: any = {}
      
      // Backup all tables
      const tables = ['patients', 'appointments', 'medical_records', 'configurations', 'user_profiles'] as const
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
        
        if (error) throw error
        backupData[table] = data
      }
      
      // Add metadata
      backupData.metadata = {
        created_at: new Date().toISOString(),
        version: '1.0',
        tables_count: Object.keys(backupData).length - 1,
        total_records: Object.values(backupData).reduce((sum: number, table: any) => 
          sum + (Array.isArray(table) ? table.length : 0), 0
        )
      }
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chrono-care-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Backup creado exitosamente",
        description: `Backup completo con ${backupData.metadata.total_records} registros descargado`,
      })
      
      return backupData
    } catch (error: any) {
      toast({
        title: "Error al crear backup",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const restoreFromBackup = async (file: File) => {
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      
      if (!backupData.metadata || !backupData.metadata.version) {
        throw new Error('Archivo de backup inválido')
      }
      
      // This would require careful implementation with proper validation
      // and should probably be done with confirmation dialogs
      toast({
        title: "Funcionalidad de restauración",
        description: "La restauración debe implementarse con extremo cuidado. Contacte al administrador del sistema.",
        variant: "destructive",
      })
      
    } catch (error: any) {
      toast({
        title: "Error al restaurar backup",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    createFullBackup,
    restoreFromBackup
  }
}