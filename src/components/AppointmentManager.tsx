import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User, Phone } from "lucide-react";

const AppointmentManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Datos mock de turnos
  const appointments = [
    {
      id: 1,
      patient: "María González",
      time: "09:00",
      type: "Consulta General",
      status: "Confirmada",
      phone: "+34 123 456 789",
      notes: "Control rutinario"
    },
    {
      id: 2,
      patient: "Carlos Rodríguez",
      time: "10:30",
      type: "Control",
      status: "Pendiente",
      phone: "+34 987 654 321",
      notes: "Seguimiento diabetes"
    },
    {
      id: 3,
      patient: "Ana López",
      time: "11:15",
      type: "Especialista",
      status: "Confirmada",
      phone: "+34 555 123 456",
      notes: "Consulta cardiología"
    },
    {
      id: 4,
      patient: "José Martínez",
      time: "14:00",
      type: "Urgencia",
      status: "En curso",
      phone: "+34 777 888 999",
      notes: "Dolor torácico"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-success text-success-foreground";
      case "Pendiente":
        return "bg-warning text-warning-foreground";
      case "En curso":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:15", 
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Turnos</h1>
          <p className="text-muted-foreground mt-2">Administre las citas y horarios</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nueva Cita</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Seleccionar Fecha</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            />
            
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">Horarios Disponibles</h4>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = appointments.some(apt => apt.time === time);
                  return (
                    <Button
                      key={time}
                      variant={isBooked ? "secondary" : "outline"}
                      size="sm"
                      disabled={isBooked}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Citas del Día - {selectedDate}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{appointment.patient}</span>
                        </h3>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time} - {appointment.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.phone}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-foreground">Notas: </span>
                          <span className="text-sm text-muted-foreground">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">Reprogramar</Button>
                      <Button variant="default" size="sm">Atender</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {appointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay citas programadas para esta fecha.</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Primera Cita
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentManager;