import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import type { Tables } from '@/integrations/supabase/types'

// Dynamic XLSX import with fallback
let XLSX: any = null;
const loadXLSX = async () => {
  if (!XLSX) {
    try {
      XLSX = await import('xlsx');
      return true;
    } catch (error) {
      console.warn('XLSX library not available. Using CSV export instead.');
      return false;
    }
  }
  return true;
};

type Patient = Tables<'patients'>
type Appointment = Tables<'appointments'>
type MedicalRecord = Tables<'medical_records'>

export const useExcelExport = () => {

  // CSV export fallback function
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

      const hasXLSX = await loadXLSX();
      
      if (hasXLSX && XLSX) {
        // Excel export
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes')

        // Auto-adjust column widths
        const colWidths = Object.keys(exportData[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }))
        worksheet['!cols'] = colWidths

        XLSX.writeFile(workbook, `pacientes-${new Date().toISOString().split('T')[0]}.xlsx`)
        
        toast({
          title: "Exportación exitosa",
          description: `${patients.length} pacientes exportados a Excel`,
        })
      } else {
        // CSV fallback
        exportToCSV(exportData, `pacientes-${new Date().toISOString().split('T')[0]}.csv`);
        
        toast({
          title: "Exportación exitosa (CSV)",
          description: `${patients.length} pacientes exportados a CSV. Instale la librería XLSX para exportar a Excel.`,
        })
      }

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

      const hasXLSX = await loadXLSX();
      
      if (hasXLSX && XLSX) {
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Turnos')

        const colWidths = Object.keys(exportData[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }))
        worksheet['!cols'] = colWidths

        XLSX.writeFile(workbook, `turnos-${new Date().toISOString().split('T')[0]}.xlsx`)
        
        toast({
          title: "Exportación exitosa",
          description: `${appointments.length} turnos exportados a Excel`,
        })
      } else {
        exportToCSV(exportData, `turnos-${new Date().toISOString().split('T')[0]}.csv`);
        
        toast({
          title: "Exportación exitosa (CSV)",
          description: `${appointments.length} turnos exportados a CSV. Instale la librería XLSX para exportar a Excel.`,
        })
      }

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

      const hasXLSX = await loadXLSX();
      
      if (hasXLSX && XLSX) {
        // Create workbook with multiple sheets
        const workbook = XLSX.utils.book_new()

        // Patients sheet
        const patientsData = patients.map(patient => ({
          'ID': patient.id,
          'Nombre': patient.name,
          'Email': patient.email || '',
          'Teléfono': patient.phone || '',
          'Fecha de Nacimiento': patient.birth_date || '',
          'Género': patient.gender || '',
          'Condiciones Médicas': patient.medical_conditions?.join(', ') || '',
          'Medicamentos': patient.medications?.join(', ') || '',
          'Alergias': patient.allergies?.join(', ') || ''
        }))

        const patientsSheet = XLSX.utils.json_to_sheet(patientsData)
        XLSX.utils.book_append_sheet(workbook, patientsSheet, 'Pacientes')

        // Medical records sheet
        const recordsData = records.map(record => ({
          'ID Historia': record.id,
          'ID Paciente': record.patient_id,
          'Nombre Paciente': record.patient_name,
          'Fecha': record.date,
          'Tipo de Consulta': record.consultation_type,
          'Síntomas': record.symptoms || '',
          'Diagnóstico': record.diagnosis || '',
          'Tratamiento': record.treatment || '',
          'Medicamentos': record.medications || '',
          'Notas': record.notes || '',
          'Fecha de Seguimiento': record.follow_up_date || '',
          'Doctor ID': record.doctor_id,
          'Fecha de Creación': new Date(record.created_at).toLocaleDateString('es-ES')
        }))

        const recordsSheet = XLSX.utils.json_to_sheet(recordsData)
        XLSX.utils.book_append_sheet(workbook, recordsSheet, 'Historias Clínicas')

        // Combined view
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

        const combinedSheet = XLSX.utils.json_to_sheet(combinedData)
        XLSX.utils.book_append_sheet(workbook, combinedSheet, 'Resumen Pacientes')

        XLSX.writeFile(workbook, `pacientes-historias-${new Date().toISOString().split('T')[0]}.xlsx`)
        
        toast({
          title: "Exportación completa exitosa",
          description: `${patients.length} pacientes y ${records.length} historias exportados`,
        })
      } else {
        // CSV fallback - export combined data
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
          title: "Exportación completa exitosa (CSV)",
          description: `${patients.length} pacientes exportados a CSV. Instale la librería XLSX para exportar a Excel con múltiples hojas.`,
        })
      }

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
      const hasXLSX = await loadXLSX();
      
      if (!hasXLSX || !XLSX) {
        throw new Error('La librería XLSX no está disponible. Por favor instale las dependencias necesarias: npm install xlsx @types/xlsx');
      }
      
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const patients: Omit<Patient, 'id' | 'created_at'>[] = []

      for (const row of jsonData as any[]) {
        // Map Excel columns to database fields
        const patient = {
          name: row['Nombre Completo'] || row['Nombre'] || '',
          email: row['Email'] || null,
          phone: row['Teléfono'] || row['Telefono'] || '',
          birth_date: row['Fecha de Nacimiento'] || row['Fecha Nacimiento'] || null,
          gender: row['Género'] || row['Genero'] || '',
          address: row['Dirección'] || row['Direccion'] || null,
          emergency_contact: row['Contacto de Emergencia'] || row['Contacto Emergencia'] || null,
          emergency_phone: row['Teléfono de Emergencia'] || row['Telefono Emergencia'] || null,
          insurance: row['Seguro Médico'] || row['Seguro'] || null,
          medical_conditions: row['Condiciones Médicas'] ? 
            row['Condiciones Médicas'].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          medications: row['Medicamentos'] ? 
            row['Medicamentos'].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          allergies: row['Alergias'] ? 
            row['Alergias'].split(',').map((s: string) => s.trim()).filter(Boolean) : []
        }

        // Validate required fields
        if (patient.name && patient.phone) {
          patients.push(patient)
        }
      }

      if (patients.length === 0) {
        throw new Error('No se encontraron pacientes válidos en el archivo')
      }

      // Insert patients in batches
      const batchSize = 50
      let insertedCount = 0

      for (let i = 0; i < patients.length; i += batchSize) {
        const batch = patients.slice(i, i + batchSize)
        const { error } = await supabase
          .from('patients')
          .insert(batch)

        if (error) throw error
        insertedCount += batch.length
      }

      toast({
        title: "Importación exitosa",
        description: `${insertedCount} pacientes importados desde Excel`,
      })

      return insertedCount

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