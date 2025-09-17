import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Phone, Mail, Calendar, Eye, Loader2, Edit, FileText, User, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePatients } from "@/hooks/usePatients";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { Patient } from "@/lib/supabase";
import type { Tables } from "@/integrations/supabase/types";
import { BirthDatePicker, convertToISODate } from "@/components/BirthDatePicker";

type MedicalRecord = Tables<'medical_records'>;

// Esquema de validación para nuevo paciente
const newPatientSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  dni: z.string().min(7, "El DNI debe tener al menos 7 caracteres").max(20, "El DNI no puede tener más de 20 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  birth_date: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.string().min(1, "El género es requerido"),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  insurance: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
});

type NewPatientForm = z.infer<typeof newPatientSchema>;

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const { patients, loading, createPatient, updatePatient, deletePatient } = usePatients();
  const { records: allRecords, loading: recordsLoading } = useMedicalRecords();

  const form = useForm<NewPatientForm>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      name: "",
      dni: "",
      email: "",
      phone: "",
      birth_date: "",
      gender: "",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      insurance: "",
      medical_conditions: "",
      medications: "",
      allergies: "",
    },
  });

  const onSubmit = async (data: NewPatientForm) => {
    try {
      // Since we're using HTML date input, the date is already in ISO format (YYYY-MM-DD)
      const patientData: Omit<Patient, 'id' | 'created_at'> = {
        name: data.name,
        dni: data.dni,
        email: data.email || undefined,
        phone: data.phone,
        birth_date: data.birth_date, // Already in ISO format
        gender: data.gender,
        address: data.address || undefined,
        emergency_contact: data.emergency_contact || undefined,
        emergency_phone: data.emergency_phone || undefined,
        insurance: data.insurance || undefined,
        medical_conditions: data.medical_conditions ? data.medical_conditions.split(',').map(s => s.trim()) : [],
        medications: data.medications ? data.medications.split(',').map(s => s.trim()) : [],
        allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
      };
      
      await createPatient(patientData);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const editForm = useForm<NewPatientForm>({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      name: "",
      dni: "",
      email: "",
      phone: "",
      birth_date: "",
      gender: "",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      insurance: "",
      medical_conditions: "",
      medications: "",
      allergies: "",
    },
  });

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    editForm.reset({
      name: patient.name,
      dni: patient.dni,
      email: patient.email || "",
      phone: patient.phone,
      birth_date: patient.birth_date,
      gender: patient.gender,
      address: patient.address || "",
      emergency_contact: patient.emergency_contact || "",
      emergency_phone: patient.emergency_phone || "",
      insurance: patient.insurance || "",
      medical_conditions: patient.medical_conditions.join(', '),
      medications: patient.medications.join(', '),
      allergies: patient.allergies.join(', '),
    });
    setIsEditDialogOpen(true);
  };

  const handleViewHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsHistoryDialogOpen(true);
  };

  // Get medical records for selected patient
  const patientRecords = selectedPatient 
    ? allRecords.filter(record => record.patient_id === selectedPatient.id)
    : [];

  const onEditSubmit = async (data: NewPatientForm) => {
    if (!editingPatient) return;
    
    try {
      // Since we're using HTML date input, the date is already in ISO format (YYYY-MM-DD)
      const patientData: Partial<Patient> = {
        name: data.name,
        dni: data.dni,
        email: data.email || undefined,
        phone: data.phone,
        birth_date: data.birth_date, // Already in ISO format
        gender: data.gender,
        address: data.address || undefined,
        emergency_contact: data.emergency_contact || undefined,
        emergency_phone: data.emergency_phone || undefined,
        insurance: data.insurance || undefined,
        medical_conditions: data.medical_conditions ? data.medical_conditions.split(',').map(s => s.trim()) : [],
        medications: data.medications ? data.medications.split(',').map(s => s.trim()) : [],
        allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
      };
      
      await updatePatient(editingPatient.id, patientData);
      editForm.reset();
      setIsEditDialogOpen(false);
      setEditingPatient(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Pacientes</h1>
          <p className="text-muted-foreground mt-2">Administre la información de sus pacientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nuevo Paciente</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI *</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento Nacional de Identidad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seguro Médico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del seguro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacto de Emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergency_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones Médicas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Hipertensión, Diabetes..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamentos Actuales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Aspirina, Metformina..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Penicilina, Frutos secos..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Registrar Paciente'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI *</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento Nacional de Identidad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seguro Médico</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del seguro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacto de Emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="emergency_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones Médicas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Hipertensión, Diabetes..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamentos Actuales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Aspirina, Metformina..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Separar por comas: Penicilina, Frutos secos..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={editForm.formState.isSubmitting}>
                    {editForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Paciente'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      
        {/* Patient History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Historia Clínica - {selectedPatient?.name}
              </DialogTitle>
            </DialogHeader>
                
            <div className="space-y-4">
              {recordsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No hay historias clínicas
                  </h3>
                  <p className="text-muted-foreground">
                    Este paciente no tiene registros médicos aún.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {patientRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <Card key={record.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {record.consultation_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(record.date).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          </div>
                              
                          {record.diagnosis && (
                            <div className="mb-2">
                              <h4 className="font-medium text-sm text-foreground mb-1">Diagnóstico</h4>
                              <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                            </div>
                          )}
                              
                          {record.symptoms && (
                            <div className="mb-2">
                              <h4 className="font-medium text-sm text-foreground mb-1">Síntomas</h4>
                              <p className="text-sm text-muted-foreground">{record.symptoms}</p>
                            </div>
                          )}
                              
                          {record.treatment && (
                            <div className="mb-2">
                              <h4 className="font-medium text-sm text-foreground mb-1">Tratamiento</h4>
                              <p className="text-sm text-muted-foreground">{record.treatment}</p>
                            </div>
                          )}
                              
                          {record.medications && (
                            <div className="mb-2">
                              <h4 className="font-medium text-sm text-foreground mb-1">Medicamentos</h4>
                              <p className="text-sm text-muted-foreground">{record.medications}</p>
                            </div>
                          )}
                              
                          {record.notes && (
                            <div className="mb-2">
                              <h4 className="font-medium text-sm text-foreground mb-1">Notas</h4>
                              <p className="text-sm text-muted-foreground">{record.notes}</p>
                            </div>
                          )}
                              
                          {record.follow_up_date && (
                            <div>
                              <h4 className="font-medium text-sm text-foreground mb-1">Fecha de seguimiento</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(record.follow_up_date).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Lista de Pacientes ({patients.length})</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                      <Badge variant="secondary">
                        {calculateAge(patient.birth_date)} años
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>DNI: {(patient as any).dni || 'No registrado'}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Nacimiento: {new Date(patient.birth_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Género:</span> {patient.gender}
                      </div>
                    </div>
                    
                    {patient.medical_conditions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-foreground">Condiciones: </span>
                        <span className="text-sm text-muted-foreground">
                          {patient.medical_conditions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto flex items-center justify-center space-x-1"
                      onClick={() => handleViewHistory(patient)}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Historia</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Eliminar</span>
                          <span className="sm:hidden">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la información del paciente {patient.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePatient(patient.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {patients.length === 0 
                  ? "No hay pacientes registrados. Registre el primer paciente."
                  : "No se encontraron pacientes con ese criterio de búsqueda."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;