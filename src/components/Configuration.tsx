import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, User, Bell, Clock, Users, Plus, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";

const Configuration = () => {
  const { toast } = useToast();
  const { users, loading, createUser, updateUser, toggleUserStatus, isAdmin } = useUserManagement();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'doctor' as 'admin' | 'doctor',
    specialty: '',
    license_number: ''
  });
  const [clinicSettings, setClinicSettings] = useState({
    name: "MediClinic",
    address: "",
    phone: "",
    email: "",
    description: ""
  });

  const [userSettings, setUserSettings] = useState({
    doctorName: "",
    specialty: "",
    license: ""
  });

  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    emailReminders: true,
    smsReminders: false,
    appointmentDuration: "30",
    workingHours: {
      start: "08:00",
      end: "18:00"
    }
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado correctamente.",
    });
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'doctor',
        specialty: '',
        license_number: ''
      });
      setShowCreateUser(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la configuración de tu clínica y preferencias del sistema
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>

      {/* Gestión de Usuarios - Solo para Administradores */}
      {isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios
              </div>
              <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Crea un nuevo usuario médico para el sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="doctor@mediclinic.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="********"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Nombre Completo</Label>
                      <Input
                        id="new-name"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Dr. Juan Pérez"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Rol</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: 'admin' | 'doctor') => setNewUser(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Médico</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-license">Número de Colegiado</Label>
                        <Input
                          id="new-license"
                          value={newUser.license_number}
                          onChange={(e) => setNewUser(prev => ({ ...prev, license_number: e.target.value }))}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-specialty">Especialidad</Label>
                      <Select
                        value={newUser.specialty}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, specialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medicina-general">Medicina General</SelectItem>
                          <SelectItem value="cardiologia">Cardiología</SelectItem>
                          <SelectItem value="dermatologia">Dermatología</SelectItem>
                          <SelectItem value="pediatria">Pediatría</SelectItem>
                          <SelectItem value="ginecologia">Ginecología</SelectItem>
                          <SelectItem value="traumatologia">Traumatología</SelectItem>
                          <SelectItem value="neurologia">Neurología</SelectItem>
                          <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Crear Usuario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              Administra los usuarios del sistema médico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Médico'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.specialty || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, !user.is_active)}
                        >
                          {user.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de la Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información de la Clínica
            </CardTitle>
            <CardDescription>
              Configura los datos básicos de tu clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-name">Nombre de la Clínica</Label>
              <Input
                id="clinic-name"
                value={clinicSettings.name}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de tu clínica"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-address">Dirección</Label>
              <Textarea
                id="clinic-address"
                value={clinicSettings.address}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa de la clínica"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">Teléfono</Label>
                <Input
                  id="clinic-phone"
                  value={clinicSettings.phone}
                  onChange={(e) => setClinicSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinic-email">Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinicSettings.email}
                  onChange={(e) => setClinicSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contacto@clinica.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-description">Descripción</Label>
              <Textarea
                id="clinic-description"
                value={clinicSettings.description}
                onChange={(e) => setClinicSettings(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción de los servicios"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Configura tu información como profesional médico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-name">Nombre del Doctor</Label>
              <Input
                id="doctor-name"
                value={userSettings.doctorName}
                onChange={(e) => setUserSettings(prev => ({ ...prev, doctorName: e.target.value }))}
                placeholder="Dr. Juan Pérez"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Select
                value={userSettings.specialty}
                onValueChange={(value) => setUserSettings(prev => ({ ...prev, specialty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicina-general">Medicina General</SelectItem>
                  <SelectItem value="cardiologia">Cardiología</SelectItem>
                  <SelectItem value="dermatologia">Dermatología</SelectItem>
                  <SelectItem value="pediatria">Pediatría</SelectItem>
                  <SelectItem value="ginecologia">Ginecología</SelectItem>
                  <SelectItem value="traumatologia">Traumatología</SelectItem>
                  <SelectItem value="neurologia">Neurología</SelectItem>
                  <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license">Número de Colegiado</Label>
              <Input
                id="license"
                value={userSettings.license}
                onChange={(e) => setUserSettings(prev => ({ ...prev, license: e.target.value }))}
                placeholder="12345"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Sistema */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Configuración del Sistema
            </CardTitle>
            <CardDescription>
              Personaliza las preferencias y notificaciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificaciones del sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones sobre citas y recordatorios
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={systemSettings.notifications}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-reminders">Recordatorios por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorios automáticos por email
                    </p>
                  </div>
                  <Switch
                    id="email-reminders"
                    checked={systemSettings.emailReminders}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, emailReminders: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-reminders">Recordatorios por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorios automáticos por SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-reminders"
                    checked={systemSettings.smsReminders}
                    onCheckedChange={(checked) => 
                      setSystemSettings(prev => ({ ...prev, smsReminders: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horarios y Citas
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="appointment-duration">Duración predeterminada de cita</Label>
                  <Select
                    value={systemSettings.appointmentDuration}
                    onValueChange={(value) => 
                      setSystemSettings(prev => ({ ...prev, appointmentDuration: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1.5 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Hora de inicio</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={systemSettings.workingHours.start}
                      onChange={(e) => 
                        setSystemSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Hora de fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={systemSettings.workingHours.end}
                      onChange={(e) => 
                        setSystemSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuration;