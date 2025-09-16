import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Home, Users, Calendar, FileText, Settings, LogOut, Menu, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserManagement } from "@/hooks/useUserManagement";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserManagement();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "pacientes", label: "Pacientes", icon: Users },
    { id: "turnos", label: "Turnos", icon: Calendar },
    { id: "historias", label: "Historias", icon: FileText },
    { id: "informes", label: "Informes", icon: BarChart3, adminOnly: true },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  // Filter navigation items based on admin status
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const handleMobileNavigation = (tab: string) => {
    onTabChange(tab);
    setIsSheetOpen(false);
  };

  const handleLogoClick = () => {
    // Only open sheet on mobile devices
    if (window.innerWidth < 768) {
      setIsSheetOpen(true);
    }
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo with Mobile Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <div 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 cursor-pointer md:cursor-default"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">MediClinic</h1>
              <Menu className="w-4 h-4 text-muted-foreground md:hidden" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <span>MediClinic</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              {/* User Info */}
              <div className="pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handleMobileNavigation(item.id)}
                      className="w-full justify-start flex items-center space-x-3 h-12 px-4"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Sign Out Button */}
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full justify-start flex items-center space-x-3 h-12 px-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base">Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {filteredNavItems.map((item) => {
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

        {/* Desktop User Actions */}
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