import * as XLSX from 'xlsx';

// Sample patient data
const patientData = [
  {
    "Nombre Completo": "María García López",
    "Email": "maria.garcia@email.com",
    "Teléfono": "+54 11 1234-5678",
    "Fecha de Nacimiento": "15/03/1985",
    "Género": "Femenino",
    "Dirección": "Av. Corrientes 1234, CABA",
    "Contacto de Emergencia": "Juan García",
    "Teléfono de Emergencia": "+54 11 9876-5432",
    "Seguro Médico": "OSDE",
    "Condiciones Médicas": "Hipertensión, Diabetes tipo 2",
    "Medicamentos": "Metformina, Enalapril",
    "Alergias": "Penicilina"
  },
  {
    "Nombre Completo": "Carlos Rodríguez",
    "Email": "carlos.rodriguez@email.com",
    "Teléfono": "+54 11 2345-6789",
    "Fecha de Nacimiento": "28/07/1978",
    "Género": "Masculino",
    "Dirección": "San Martín 567, CABA",
    "Contacto de Emergencia": "Ana Rodríguez",
    "Teléfono de Emergencia": "+54 11 8765-4321",
    "Seguro Médico": "Swiss Medical",
    "Condiciones Médicas": "Asma",
    "Medicamentos": "Salbutamol",
    "Alergias": "Ácaros"
  },
  {
    "Nombre Completo": "Ana Fernández",
    "Email": "ana.fernandez@email.com",
    "Teléfono": "+54 11 3456-7890",
    "Fecha de Nacimiento": "12/11/1992",
    "Género": "Femenino",
    "Dirección": "Rivadavia 890, CABA",
    "Contacto de Emergencia": "Pedro Fernández",
    "Teléfono de Emergencia": "+54 11 7654-3210",
    "Seguro Médico": "Galeno",
    "Condiciones Médicas": "",
    "Medicamentos": "",
    "Alergias": ""
  },
  {
    "Nombre Completo": "Luis Martínez",
    "Email": "luis.martinez@email.com",
    "Teléfono": "+54 11 4567-8901",
    "Fecha de Nacimiento": "05/09/1960",
    "Género": "Masculino",
    "Dirección": "Belgrano 345, CABA",
    "Contacto de Emergencia": "Carmen Martínez",
    "Teléfono de Emergencia": "+54 11 6543-2109",
    "Seguro Médico": "PAMI",
    "Condiciones Médicas": "Artritis",
    "Medicamentos": "Ibuprofeno, Glucosamina",
    "Alergias": "Aspirina"
  },
  {
    "Nombre Completo": "Sofia Morales",
    "Email": "sofia.morales@email.com",
    "Teléfono": "+54 11 5678-9012",
    "Fecha de Nacimiento": "22/01/1988",
    "Género": "Femenino",
    "Dirección": "Florida 678, CABA",
    "Contacto de Emergencia": "Roberto Morales",
    "Teléfono de Emergencia": "+54 11 5432-1098",
    "Seguro Médico": "Medicus",
    "Condiciones Médicas": "Migraña",
    "Medicamentos": "Sumatriptán",
    "Alergias": ""
  },
  {
    "Nombre Completo": "Diego Castro",
    "Email": "diego.castro@email.com",
    "Teléfono": "+54 11 6789-0123",
    "Fecha de Nacimiento": "14/05/1975",
    "Género": "Masculino",
    "Dirección": "Santa Fe 912, CABA",
    "Contacto de Emergencia": "Elena Castro",
    "Teléfono de Emergencia": "+54 11 4321-0987",
    "Seguro Médico": "OSDE",
    "Condiciones Médicas": "Colesterol alto",
    "Medicamentos": "Atorvastatina",
    "Alergias": "Mariscos"
  },
  {
    "Nombre Completo": "Patricia Ruiz",
    "Email": "patricia.ruiz@email.com",
    "Teléfono": "+54 11 7890-1234",
    "Fecha de Nacimiento": "30/12/1983",
    "Género": "Femenino",
    "Dirección": "9 de Julio 456, CABA",
    "Contacto de Emergencia": "Miguel Ruiz",
    "Teléfono de Emergencia": "+54 11 3210-9876",
    "Seguro Médico": "Swiss Medical",
    "Condiciones Médicas": "",
    "Medicamentos": "",
    "Alergias": ""
  },
  {
    "Nombre Completo": "Fernando López",
    "Email": "fernando.lopez@email.com",
    "Teléfono": "+54 11 8901-2345",
    "Fecha de Nacimiento": "18/08/1970",
    "Género": "Masculino",
    "Dirección": "Callao 789, CABA",
    "Contacto de Emergencia": "Silvia López",
    "Teléfono de Emergencia": "+54 11 2109-8765",
    "Seguro Médico": "Galeno",
    "Condiciones Médicas": "Gastritis",
    "Medicamentos": "Omeprazol",
    "Alergias": ""
  },
  {
    "Nombre Completo": "Claudia Díaz",
    "Email": "claudia.diaz@email.com",
    "Teléfono": "+54 11 9012-3456",
    "Fecha de Nacimiento": "03/04/1995",
    "Género": "Femenino",
    "Dirección": "Alem 123, CABA",
    "Contacto de Emergencia": "Jorge Díaz",
    "Teléfono de Emergencia": "+54 11 1098-7654",
    "Seguro Médico": "Medicus",
    "Condiciones Médicas": "Ansiedad, Depresión",
    "Medicamentos": "Sertralina, Alprazolam",
    "Alergias": "Lactosa"
  },
  {
    "Nombre Completo": "Roberto Silva",
    "Email": "roberto.silva@email.com",
    "Teléfono": "+54 11 0123-4567",
    "Fecha de Nacimiento": "25/06/1982",
    "Género": "Masculino",
    "Dirección": "Maipú 234, CABA",
    "Contacto de Emergencia": "Laura Silva",
    "Teléfono de Emergencia": "+54 11 0987-6543",
    "Seguro Médico": "OSDE",
    "Condiciones Médicas": "",
    "Medicamentos": "",
    "Alergias": "Gluten"
  }
];

// Create Excel file
const worksheet = XLSX.utils.json_to_sheet(patientData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes Ejemplo');

// Auto-adjust column widths
const colWidths = Object.keys(patientData[0]).map(key => ({
  wch: Math.max(key.length, 20)
}));
worksheet['!cols'] = colWidths;

// Write file
XLSX.writeFile(workbook, 'ejemplo-pacientes.xlsx');

console.log('Archivo ejemplo-pacientes.xlsx creado exitosamente');