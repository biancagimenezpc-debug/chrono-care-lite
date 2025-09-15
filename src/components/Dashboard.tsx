import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Activity, Loader2 } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const { patients, loading: patientsLoading } = usePatients();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { records: medicalRecords, loading: recordsLoading } = useMedicalRecords();
  const [navigationAction, setNavigationAction] = useState<string | null>(null);

  // Calculate today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const pendingAppointments = todayAppointments.filter(apt => apt.status === 'programada' || apt.status === 'confirmada');
  const activeConsultations = appointments.filter(apt => apt.status === 'confirmada').length;

  // Calculate recent activity
  const thisWeekRecords = medicalRecords.filter(record => {
    const recordDate = new Date(record.created_at || record.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate >= weekAgo;
  });

  const thisMonthPatients = patients.filter(patient => {
    const patientDate = new Date(patient.created_at!);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return patientDate >= monthAgo;
  });

  const handleCardClick = (type: string) => {
    setNavigationAction(type);
    toast({
      title: "Navegación",
      description: `Navegando a ${type}...`,
    });
    
    // Simulate navigation - in a real app, you'd use a router
    setTimeout(() => {
      setNavigationAction(null);
      switch(type) {
        case 'patients':
          window.location.hash = '#/patients';
          break;
        case 'appointments':
          window.location.hash = '#/appointments';
          break;
        case 'records':
          window.location.hash = '#/medical-history';
          break;
        case 'consultations':
          window.location.hash = '#/appointments';
          break;
      }
    }, 1000);
  };

  const loading = patientsLoading || appointmentsLoading || recordsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  const stats = [
    {
      title: "Pacientes Registrados",
      value: patients.length.toString(),
      icon: Users,
      trend: `+${thisMonthPatients.length} este mes`,
      color: "text-primary",
      clickable: true,
      type: "patients"
    },
    {
      title: "Citas Hoy",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      trend: `${pendingAppointments.length} pendientes`,
      color: "text-accent",
      clickable: true,
      type: "appointments"
    },
    {
      title: "Historias Clínicas",
      value: medicalRecords.length.toString(),
      icon: FileText,
      trend: `+${thisWeekRecords.length} esta semana`,
      color: "text-success",
      clickable: true,
      type: "records"
    },
    {
      title: "Consultas Activas",
      value: activeConsultations.toString(),
      icon: Activity,
      trend: "En curso",
      color: "text-warning",
      clickable: true,
      type: "consultations"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard Médico</h1>
        <p className="text-muted-foreground mt-2">Resumen general de su clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isLoading = navigationAction === stat.type;
          return (
            <Card 
              key={stat.title} 
              className={`hover:shadow-lg transition-all duration-200 ${
                stat.clickable ? 'cursor-pointer hover:scale-105' : ''
              }`}
              onClick={() => stat.clickable && handleCardClick(stat.type)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay citas programadas para hoy
                </p>
              ) : (
                todayAppointments.slice(0, 4).map((cita, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{cita.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{cita.consultation_type}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{cita.time}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicalRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay actividad reciente
                </p>
              ) : (
                medicalRecords.slice(0, 4).map((actividad, index) => {
                  const timeAgo = new Date(actividad.created_at || actividad.date).toLocaleString();
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {actividad.consultation_type} - {actividad.patient_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {actividad.diagnosis || 'Consulta realizada'}
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;