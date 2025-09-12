import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { user, signOut } = useAuth();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "pacientes", label: "Pacientes", icon: Users },
    { id: "turnos", label: "Turnos", icon: Calendar },
    { id: "historias", label: "Historias", icon: FileText },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">MediClinic</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden md:block">
            {user?.email}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;