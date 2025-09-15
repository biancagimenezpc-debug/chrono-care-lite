import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, FileText, Calendar, User, Eye, Edit, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { usePatients } from "@/hooks/usePatients";
import { PatientSelector } from "@/components/PatientSelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Tables } from "@/integrations/supabase/types";

type MedicalRecord = Tables<'medical_records'>;

// Form validation schema
const medicalRecordSchema = z.object({
  patient_name: z.string().min(2, "El nombre del paciente es requerido"),
  consultation_type: z.string().min(1, "El tipo de consulta es requerido"),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
  follow_up_date: z.string().optional(),
});

type MedicalRecordForm = z.infer<typeof medicalRecordSchema>;

const MedicalHistory = () => {
  const { toast } = useToast();
  const { records, loading, createRecord, updateRecord } = useMedicalRecords();
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const form = useForm<MedicalRecordForm>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_name: "",
      consultation_type: "",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      medications: "",
      notes: "",
      follow_up_date: "",
    },
  });

  const editForm = useForm<MedicalRecordForm>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_name: "",
      consultation_type: "",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      medications: "",
      notes: "",
      follow_up_date: "",
    },
  });

  // Handle patient selection
  const handlePatientSelect = (patient: { id: string; name: string; phone: string }) => {
    setSelectedPatientId(patient.id);
    form.setValue("patient_name", patient.name);
  };

  // Handle edit patient selection  
  const handleEditPatientSelect = (patient: { id: string; name: string; phone: string }) => {
    setSelectedPatientId(patient.id);
    editForm.setValue("patient_name", patient.name);
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || record.consultation_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const onSubmit = async (data: MedicalRecordForm) => {
    try {
      // Find the selected patient
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) {
        toast({
          title: "Error",
          description: "Por favor selecciona un paciente válido",
          variant: "destructive"
        });
        return;
      }

      const recordData = {
        patient_id: patient.id,
        patient_name: data.patient_name,
        date: new Date().toISOString().split('T')[0],
        consultation_type: data.consultation_type,
        symptoms: data.symptoms || null,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        medications: data.medications || null,
        notes: data.notes || null,
        follow_up_date: data.follow_up_date || null,
      };

      await createRecord(recordData);
      form.reset();
      setSelectedPatientId("");
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const onEditSubmit = async (data: MedicalRecordForm) => {
    if (!editingRecord) return;
    
    try {
      const updates = {
        consultation_type: data.consultation_type,
        symptoms: data.symptoms || null,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        medications: data.medications || null,
        notes: data.notes || null,
        follow_up_date: data.follow_up_date || null,
      };

      await updateRecord(editingRecord.id, updates);
      editForm.reset();
      setEditingRecord(null);
      setIsEditModalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    editForm.reset({
      patient_name: record.patient_name,
      consultation_type: record.consultation_type,
      symptoms: record.symptoms || "",
      diagnosis: record.diagnosis || "",
      treatment: record.treatment || "",
      medications: record.medications || "",
      notes: record.notes || "",
      follow_up_date: record.follow_up_date || "",
    });
    setIsEditModalOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Consulta General":
      case "consulta": 
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Urgencia":
      case "urgencia": 
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Control":
      case "control": 
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Especialista":
      case "cirugia": 
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: 
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historias Clínicas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los registros médicos y historial de pacientes
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Historia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Historia Clínica</DialogTitle>
              <DialogDescription>
                Completa los datos del registro médico del paciente
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Paciente *</FormLabel>
                      <FormControl>
                        <PatientSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          onPatientSelect={handlePatientSelect}
                          placeholder="Buscar y seleccionar paciente..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="consultation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de consulta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Consulta General">Consulta General</SelectItem>
                          <SelectItem value="Urgencia">Urgencia</SelectItem>
                          <SelectItem value="Control">Control</SelectItem>
                          <SelectItem value="Especialista">Especialista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Síntomas</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descripción de síntomas presentados"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Diagnóstico principal"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="treatment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tratamiento</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tratamiento prescrito"
                          rows={3}
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
                      <FormLabel>Medicamentos</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Medicamentos prescritos"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observaciones y notas adicionales"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="follow_up_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de seguimiento</FormLabel>
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
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Historia'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por paciente o diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Consulta General">Consulta General</SelectItem>
                  <SelectItem value="Urgencia">Urgencia</SelectItem>
                  <SelectItem value="Control">Control</SelectItem>
                  <SelectItem value="Especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-foreground">
                      {record.patient_name}
                    </h3>
                    <Badge className={getTypeColor(record.consultation_type)}>
                      {record.consultation_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  
                  <p className="text-foreground font-medium">
                    <span className="text-muted-foreground">Diagnóstico:</span> {record.diagnosis || 'No especificado'}
                  </p>
                  
                  {record.symptoms && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Síntomas:</span> {record.symptoms}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Historia Clínica - {record.patient_name}</DialogTitle>
                        <DialogDescription>
                          ID: {record.id} | Fecha: {new Date(record.date).toLocaleDateString('es-ES')}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(record.consultation_type)}>
                            {record.consultation_type}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid gap-4">
                          {record.diagnosis && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Diagnóstico</h4>
                              <p className="text-muted-foreground">{record.diagnosis}</p>
                            </div>
                          )}
                          
                          {record.symptoms && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Síntomas</h4>
                              <p className="text-muted-foreground">{record.symptoms}</p>
                            </div>
                          )}
                          
                          {record.treatment && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Tratamiento</h4>
                              <p className="text-muted-foreground">{record.treatment}</p>
                            </div>
                          )}
                          
                          {record.medications && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Medicamentos</h4>
                              <p className="text-muted-foreground">{record.medications}</p>
                            </div>
                          )}
                          
                          {record.notes && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Notas adicionales</h4>
                              <p className="text-muted-foreground">{record.notes}</p>
                            </div>
                          )}
                          
                          {record.follow_up_date && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Fecha de seguimiento</h4>
                              <p className="text-muted-foreground">{new Date(record.follow_up_date).toLocaleDateString('es-ES')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron historias clínicas
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Crea la primera historia clínica para comenzar"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;