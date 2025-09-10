import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Activity } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Pacientes Registrados",
      value: "347",
      icon: Users,
      trend: "+12% este mes",
      color: "text-primary"
    },
    {
      title: "Citas Hoy",
      value: "28",
      icon: Calendar,
      trend: "6 pendientes",
      color: "text-accent"
    },
    {
      title: "Historias Clínicas",
      value: "1,247",
      icon: FileText,
      trend: "+8 esta semana",
      color: "text-success"
    },
    {
      title: "Consultas Activas",
      value: "15",
      icon: Activity,
      trend: "En curso",
      color: "text-warning"
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
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
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
              {[
                { paciente: "María González", hora: "09:00", tipo: "Consulta General" },
                { paciente: "Carlos Rodríguez", hora: "10:30", tipo: "Control" },
                { paciente: "Ana López", hora: "11:15", tipo: "Especialista" },
                { paciente: "José Martínez", hora: "14:00", tipo: "Urgencia" }
              ].map((cita, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{cita.paciente}</p>
                    <p className="text-sm text-muted-foreground">{cita.tipo}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{cita.hora}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { accion: "Nueva historia clínica creada", paciente: "Laura Fernández", tiempo: "Hace 15 min" },
                { accion: "Cita programada", paciente: "Roberto Silva", tiempo: "Hace 1 hora" },
                { accion: "Consulta completada", paciente: "Elena Torres", tiempo: "Hace 2 horas" },
                { accion: "Paciente registrado", paciente: "Miguel Herrera", tiempo: "Hace 3 horas" }
              ].map((actividad, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{actividad.accion}</p>
                    <p className="text-sm text-muted-foreground">{actividad.paciente}</p>
                    <p className="text-xs text-muted-foreground">{actividad.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;