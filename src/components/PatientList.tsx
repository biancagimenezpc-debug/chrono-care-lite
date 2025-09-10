import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, Calendar, Eye } from "lucide-react";

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos mock de pacientes
  const patients = [
    {
      id: 1,
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+34 123 456 789",
      age: 34,
      lastVisit: "2024-01-15",
      status: "Activo",
      condition: "Hipertensión"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "+34 987 654 321",
      age: 45,
      lastVisit: "2024-01-10",
      status: "Activo",
      condition: "Diabetes"
    },
    {
      id: 3,
      name: "Ana López",
      email: "ana.lopez@email.com",
      phone: "+34 555 123 456",
      age: 28,
      lastVisit: "2024-01-08",
      status: "Inactivo",
      condition: "Control rutinario"
    },
    {
      id: 4,
      name: "José Martínez",
      email: "jose.martinez@email.com",
      phone: "+34 777 888 999",
      age: 52,
      lastVisit: "2024-01-12",
      status: "Activo",
      condition: "Cardiología"
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === "Activo" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Pacientes</h1>
          <p className="text-muted-foreground mt-2">Administre la información de sus pacientes</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Lista de Pacientes</CardTitle>
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
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Última visita: {patient.lastVisit}</span>
                      </div>
                      <div>
                        <span className="font-medium">Edad:</span> {patient.age} años
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-sm font-medium text-foreground">Condición: </span>
                      <span className="text-sm text-muted-foreground">{patient.condition}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Ver Historia</span>
                    </Button>
                    <Button variant="default" size="sm">Editar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron pacientes con ese criterio de búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;