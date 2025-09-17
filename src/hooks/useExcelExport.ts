import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

type Patient = Tables<'patients'>
type Appointment = Tables<'appointments'>
type MedicalRecord = Tables<'medical_records'>

export const useExcelExport = () => {
  // CSV export function
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          const escapedValue = typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"`
            : value;
          return escapedValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPatientsToExcel = async () => {
    try {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data for export
      const exportData = patients.map(patient => ({
        'ID': patient.id,
        'Nombre Completo': patient.name,
        'Email': patient.email || '',
        'Teléfono': patient.phone || '',
        'Fecha de Nacimiento': patient.birth_date || '',
        'Género': patient.gender || '',
        'Dirección': patient.address || '',
        'Contacto de Emergencia': patient.emergency_contact || '',
        'Teléfono de Emergencia': patient.emergency_phone || '',
        'Seguro Médico': patient.insurance || '',
        'Condiciones Médicas': patient.medical_conditions?.join(', ') || '',
        'Medicamentos': patient.medications?.join(', ') || '',
        'Alergias': patient.allergies?.join(', ') || '',
        'Fecha de Registro': new Date(patient.created_at).toLocaleDateString('es-ES')
      }))

      exportToCSV(exportData, `pacientes-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Exportación exitosa",
        description: `${patients.length} pacientes exportados a CSV`,
      })

    } catch (error: any) {
      toast({
        title: "Error al exportar pacientes",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const exportAppointmentsToExcel = async () => {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      const exportData = appointments.map(appointment => ({
        'ID': appointment.id,
        'Paciente': appointment.patient_name,
        'Teléfono': appointment.patient_phone || '',
        'Fecha': appointment.date,
        'Hora': appointment.time,
        'Tipo de Consulta': appointment.consultation_type,
        'Estado': appointment.status,
        'Notas': appointment.notes || '',
        'Doctor ID': appointment.doctor_id,
        'Fecha de Creación': new Date(appointment.created_at).toLocaleDateString('es-ES')
      }))

      exportToCSV(exportData, `turnos-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Exportación exitosa",
        description: `${appointments.length} turnos exportados a CSV`,
      })

    } catch (error: any) {
      toast({
        title: "Error al exportar turnos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const exportPatientsWithRecordsToExcel = async () => {
    try {
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')

      if (patientsError) throw patientsError

      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')

      if (recordsError) throw recordsError

      // Export combined data to CSV
      const combinedData = patients.map(patient => {
        const patientRecords = records.filter(r => r.patient_id === patient.id)
        const recordCount = patientRecords.length
        const lastRecord = patientRecords.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        return {
          'Nombre Paciente': patient.name,
          'Teléfono': patient.phone || '',
          'Email': patient.email || '',
          'Total Historias': recordCount,
          'Última Consulta': lastRecord ? lastRecord.date : 'Sin consultas',
          'Último Diagnóstico': lastRecord ? lastRecord.diagnosis || 'N/A' : 'N/A',
          'Condiciones Médicas': patient.medical_conditions?.join(', ') || '',
          'Alergias': patient.allergies?.join(', ') || ''
        }
      })
      
      exportToCSV(combinedData, `pacientes-historias-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Exportación completa exitosa",
        description: `${patients.length} pacientes exportados a CSV`,
      })

    } catch (error: any) {
      toast({
        title: "Error al exportar datos completos",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const importPatientsFromExcel = async (file: File) => {
    try {
      throw new Error('La importación desde Excel requiere instalar dependencias adicionales. Use importación CSV por ahora.');
    } catch (error: any) {
      toast({
        title: "Error al importar pacientes",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    exportPatientsToExcel,
    exportAppointmentsToExcel,
    exportPatientsWithRecordsToExcel,
    importPatientsFromExcel
  }
}