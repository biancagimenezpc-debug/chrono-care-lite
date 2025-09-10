import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import PatientList from "@/components/PatientList";
import AppointmentManager from "@/components/AppointmentManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "pacientes":
        return <PatientList />;
      case "turnos":
        return <AppointmentManager />;
      case "historias":
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Módulo de Historias Clínicas - En desarrollo</p>
          </div>
        );
      case "configuracion":
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Configuración - En desarrollo</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;