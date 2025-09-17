import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, FileText, UserCheck, Stethoscope, Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<'appointments'> & {
  doctor?: {
    full_name: string | null;
    role: string;
    specialty: string | null;
  };
};

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentDetails = ({ appointment, isOpen, onClose }: AppointmentDetailsProps) => {
  if (!appointment) return null;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : Stethoscope;
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Doctor';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Detalles de la Cita</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Información del Paciente</h3>
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{appointment.patient_name}</span>
              </div>
              {appointment.patient_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.patient_phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Información de la Cita</h3>
            <div className="grid gap-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{appointment.consultation_type}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Notas</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Creator Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Creado por</h3>
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
              {(() => {
                const IconComponent = getRoleIcon(appointment.doctor?.role || 'doctor');
                return <IconComponent className="w-5 h-5 text-primary" />;
              })()}
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {appointment.doctor?.full_name || 'Usuario desconocido'}
                </p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{getRoleLabel(appointment.doctor?.role || 'doctor')}</span>
                  {appointment.doctor?.specialty && (
                    <>
                      <span>•</span>
                      <span>{appointment.doctor.specialty}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Creation Date */}
          <div className="text-xs text-muted-foreground text-center">
            Cita creada el {new Date(appointment.created_at).toLocaleString('es-ES')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetails;