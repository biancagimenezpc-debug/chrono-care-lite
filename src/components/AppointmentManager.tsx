import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus, User, Phone, Loader2, RotateCcw, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppointments } from "@/hooks/useAppointments";
import { useConfiguration } from "@/hooks/useConfiguration";
import { PatientSelector } from "@/components/PatientSelector";

// Esquema de validación para nueva cita
const newAppointmentSchema = z.object({
  patient_name: z.string().min(2, "El nombre del paciente es requerido"),
  patient_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  consultation_type: z.string().min(1, "El tipo de consulta es requerido"),
  notes: z.string().optional(),
});

type NewAppointmentForm = z.infer<typeof newAppointmentSchema>;

const AppointmentManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedPatientPhone, setSelectedPatientPhone] = useState("");
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  const { appointments, loading, createAppointment, updateAppointment } = useAppointments();
  const { configuration, getAvailableTimeSlots, isWorkingDay } = useConfiguration();

  const form = useForm<NewAppointmentForm>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      patient_name: "",
      patient_phone: "",
      date: selectedDate,
      time: "",
      consultation_type: "",
      notes: "",
    },
  });

  // Función para abrir el diálogo con datos preconfigurados
  const openAppointmentDialog = (prefilledData?: { date?: string; time?: string }) => {
    if (prefilledData) {
      form.reset({
        patient_name: "",
        patient_phone: "",
        date: prefilledData.date || selectedDate,
        time: prefilledData.time || "",
        consultation_type: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  // Manejar selección de paciente
  const handlePatientSelect = (patient: { name: string; phone: string }) => {
    setSelectedPatientPhone(patient.phone);
    form.setValue("patient_phone", patient.phone);
  };

  // Actualizar fecha en el formulario cuando cambia la fecha seleccionada
  useEffect(() => {
    form.setValue("date", selectedDate);
  }, [selectedDate, form]);

  // Reschedule form
  const rescheduleForm = useForm<NewAppointmentForm>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      patient_name: "",
      patient_phone: "",
      date: selectedDate,
      time: "",
      consultation_type: "",
      notes: "",
    },
  });

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    rescheduleForm.reset({
      patient_name: appointment.patient_name,
      patient_phone: appointment.patient_phone,
      date: selectedDate,
      time: "",
      consultation_type: appointment.consultation_type,
      notes: appointment.notes || "",
    });
    setIsRescheduleDialogOpen(true);
  };

  const handleAttend = async (appointment: any) => {
    try {
      await updateAppointment(appointment.id, {
        status: 'completada'
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const onRescheduleSubmit = async (data: NewAppointmentForm) => {
    if (!appointmentToReschedule) return;
    
    try {
      await updateAppointment(appointmentToReschedule.id, {
        date: data.date!,
        time: data.time!,
        consultation_type: data.consultation_type!,
        notes: data.notes || '',
      });
      rescheduleForm.reset();
      setIsRescheduleDialogOpen(false);
      setAppointmentToReschedule(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const onSubmit = async (data: NewAppointmentForm) => {
    try {
      const appointmentData = {
        patient_name: data.patient_name!,
        patient_phone: data.patient_phone!,
        date: data.date!,
        time: data.time!,
        consultation_type: data.consultation_type!,
        notes: data.notes || '',
        status: 'programada' as const,
      };
      
      await createAppointment(appointmentData);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-success text-success-foreground";
      case "programada":
        return "bg-warning text-warning-foreground";
      case "completada":
        return "bg-primary text-primary-foreground";
      case "cancelada":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get available time slots from configuration
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  
  // Filter appointments for selected date
  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  
  // Create a set of booked times for faster lookup
  const bookedTimes = new Set(todayAppointments.map(apt => apt.time));
  
  // Check if selected date is a working day
  const isSelectedDateWorkingDay = isWorkingDay(selectedDate);

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
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Turnos</h1>
          <p className="text-muted-foreground mt-2">Administre las citas y horarios</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={() => openAppointmentDialog()}>
              <Plus className="w-4 h-4" />
              <span>Nueva Cita</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Paciente</FormLabel>
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
                  name="patient_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+34 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="consultation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Consulta General">Consulta General</SelectItem>
                          <SelectItem value="Control">Control</SelectItem>
                          <SelectItem value="Especialista">Especialista</SelectItem>
                          <SelectItem value="Urgencia">Urgencia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones adicionales..." 
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
                        Agendando...
                      </>
                    ) : (
                      'Agendar Cita'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reprogramar Cita</DialogTitle>
            </DialogHeader>
            <Form {...rescheduleForm}>
              <form onSubmit={rescheduleForm.handleSubmit(onRescheduleSubmit)} className="space-y-4">
                <FormField
                  control={rescheduleForm.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Paciente</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={rescheduleForm.control}
                  name="patient_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={rescheduleForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={rescheduleForm.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva Hora</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={rescheduleForm.control}
                  name="consultation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Consulta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Consulta General">Consulta General</SelectItem>
                          <SelectItem value="Control">Control</SelectItem>
                          <SelectItem value="Especialista">Especialista</SelectItem>
                          <SelectItem value="Urgencia">Urgencia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={rescheduleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observaciones adicionales..." 
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
                    onClick={() => setIsRescheduleDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={rescheduleForm.formState.isSubmitting}>
                    {rescheduleForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reprogramando...
                      </>
                    ) : (
                      'Reprogramar Cita'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
            
            {/* Botón para volver al día actual */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ir a Hoy
            </Button>
            
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-3">Horarios Disponibles</h4>
              {!isSelectedDateWorkingDay ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No es un día laborable
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((time) => {
                    const isBooked = bookedTimes.has(time);
                    return (
                      <Button
                        key={time}
                        variant={isBooked ? "secondary" : "outline"}
                        size="sm"
                        disabled={isBooked}
                        className={`text-xs ${isBooked ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground' : 'hover:bg-primary hover:text-primary-foreground cursor-pointer'}`}
                        onClick={() => !isBooked && openAppointmentDialog({ date: selectedDate, time })}
                      >
                        {time} {isBooked && '(Ocupado)'}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Citas del Día - {selectedDate} ({todayAppointments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{appointment.patient_name}</span>
                        </h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time} - {appointment.consultation_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.patient_phone}</span>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReschedule(appointment)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reprogramar
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleAttend(appointment)}
                        disabled={appointment.status === 'completada'}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        {appointment.status === 'completada' ? 'Atendido' : 'Atender'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {todayAppointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay citas programadas para esta fecha.</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => openAppointmentDialog()}
                >
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