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
import { Plus, Search, FileText, Calendar, User, Eye, Edit, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: "consulta" | "urgencia" | "control" | "cirugia";
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  doctor: string;
  status: "activo" | "finalizado" | "seguimiento";
}

const MedicalHistory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data for medical records
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      patientId: "P001",
      patientName: "Ana García",
      date: "2024-01-15",
      type: "consulta",
      diagnosis: "Hipertensión arterial",
      symptoms: "Dolor de cabeza, mareos ocasionales",
      treatment: "Enalapril 10mg, dieta hiposódica",
      notes: "Controlar presión arterial semanalmente",
      doctor: "Dr. Juan Pérez",
      status: "seguimiento"
    },
    {
      id: "2",
      patientId: "P002",
      patientName: "Carlos López",
      date: "2024-01-10",
      type: "urgencia",
      diagnosis: "Fractura de muñeca",
      symptoms: "Dolor intenso en muñeca derecha post-caída",
      treatment: "Inmovilización con yeso, analgésicos",
      notes: "Control radiológico en 4 semanas",
      doctor: "Dr. María Rodríguez",
      status: "activo"
    },
    {
      id: "3",
      patientId: "P003",
      patientName: "Elena Martín",
      date: "2024-01-08",
      type: "control",
      diagnosis: "Diabetes tipo 2",
      symptoms: "Asintomática",
      treatment: "Metformina 850mg, control glucémico",
      notes: "HbA1c: 7.2%. Mejorar adherencia dietética",
      doctor: "Dr. Juan Pérez",
      status: "seguimiento"
    }
  ]);

  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    patientName: "",
    type: "consulta",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    notes: "",
    doctor: "Dr. Juan Pérez",
    status: "activo"
  });

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateRecord = () => {
    if (!newRecord.patientName || !newRecord.diagnosis) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const record: MedicalRecord = {
      ...newRecord as MedicalRecord,
      id: Date.now().toString(),
      patientId: `P${String(medicalRecords.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0]
    };

    setMedicalRecords(prev => [record, ...prev]);
    setNewRecord({
      patientName: "",
      type: "consulta",
      diagnosis: "",
      symptoms: "",
      treatment: "",
      notes: "",
      doctor: "Dr. Juan Pérez",
      status: "activo"
    });
    setIsCreateModalOpen(false);
    
    toast({
      title: "Historia clínica creada",
      description: "El registro médico se ha guardado correctamente"
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consulta": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "urgencia": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "control": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cirugia": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "seguimiento": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "finalizado": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Nombre del Paciente *</Label>
                  <Input
                    id="patient-name"
                    value={newRecord.patientName}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="record-type">Tipo de consulta</Label>
                  <Select
                    value={newRecord.type}
                    onValueChange={(value) => setNewRecord(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="urgencia">Urgencia</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="cirugia">Cirugía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico *</Label>
                <Input
                  id="diagnosis"
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnóstico principal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symptoms">Síntomas</Label>
                <Textarea
                  id="symptoms"
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Descripción de síntomas presentados"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatment">Tratamiento</Label>
                <Textarea
                  id="treatment"
                  value={newRecord.treatment}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Tratamiento prescrito"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observaciones y notas adicionales"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input
                    id="doctor"
                    value={newRecord.doctor}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, doctor: e.target.value }))}
                    placeholder="Nombre del médico"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={newRecord.status}
                    onValueChange={(value) => setNewRecord(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRecord}>
                Crear Historia
              </Button>
            </div>
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
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="urgencia">Urgencia</SelectItem>
                  <SelectItem value="control">Control</SelectItem>
                  <SelectItem value="cirugia">Cirugía</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
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
                      {record.patientName}
                    </h3>
                    <Badge className={getTypeColor(record.type)}>
                      {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {record.doctor}
                    </div>
                  </div>
                  
                  <p className="text-foreground font-medium">
                    <span className="text-muted-foreground">Diagnóstico:</span> {record.diagnosis}
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
                        <DialogTitle>Historia Clínica - {record.patientName}</DialogTitle>
                        <DialogDescription>
                          ID: {record.patientId} | Fecha: {new Date(record.date).toLocaleDateString('es-ES')}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(record.type)}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Diagnóstico</h4>
                            <p className="text-muted-foreground">{record.diagnosis}</p>
                          </div>
                          
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
                          
                          {record.notes && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Notas adicionales</h4>
                              <p className="text-muted-foreground">{record.notes}</p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Médico responsable</h4>
                            <p className="text-muted-foreground">{record.doctor}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
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
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
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