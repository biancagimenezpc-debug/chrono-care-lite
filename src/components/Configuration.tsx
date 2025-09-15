import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Building2, User, Bell, Clock, Users, Plus, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useConfiguration } from "@/hooks/useConfiguration";

const Configuration = () => {
  const { toast } = useToast();
  const { users, loading: usersLoading, createUser, updateUser, toggleUserStatus, isAdmin } = useUserManagement();
  const { configuration, loading: configLoading, updateConfiguration } = useConfiguration();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'doctor' as 'admin' | 'doctor',
    specialty: '',
    license_number: ''
  });
  
  // Local state for form values
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    clinic_email: '',
    clinic_description: '',
    doctor_name: '',
    doctor_specialty: '',
    doctor_license: '',
    appointment_duration: 30,
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    notifications_enabled: true,
    email_reminders_enabled: true,
    sms_reminders_enabled: false,
    break_time_start: '12:00',
    break_time_end: '14:00'
  });

  // Load settings from Supabase configuration
  useEffect(() => {
    if (configuration) {
      setFormData({
        clinic_name: configuration.clinic_name || '',
        clinic_address: configuration.clinic_address || '',
        clinic_phone: configuration.clinic_phone || '',
        clinic_email: configuration.clinic_email || '',
        clinic_description: configuration.clinic_description || '',
        doctor_name: configuration.doctor_name || '',
        doctor_specialty: configuration.doctor_specialty || '',
        doctor_license: configuration.doctor_license || '',
        appointment_duration: configuration.appointment_duration || 30,
        working_hours_start: configuration.working_hours_start || '08:00',
        working_hours_end: configuration.working_hours_end || '18:00',
        working_days: configuration.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        notifications_enabled: configuration.notifications_enabled ?? true,
        email_reminders_enabled: configuration.email_reminders_enabled ?? true,
        sms_reminders_enabled: configuration.sms_reminders_enabled ?? false,
        break_time_start: configuration.break_time_start || '12:00',
        break_time_end: configuration.break_time_end || '14:00'
      });
    }
  }, [configuration]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateConfiguration(formData);
    } catch (error) {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      working_days: checked 
        ? [...(prev.working_days || []), day]
        : (prev.working_days || []).filter(d => d !== day)
    }));
  };

  const workingDaysOptions = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

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

  if (configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la configuración de tu clínica y preferencias del sistema
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2" disabled={saving || configLoading}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
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
                {usersLoading ? (
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
                value={formData.clinic_name}
                onChange={(e) => setFormData(prev => ({ ...prev, clinic_name: e.target.value }))}
                placeholder="Nombre de tu clínica"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-address">Dirección</Label>
              <Textarea
                id="clinic-address"
                value={formData.clinic_address}
                onChange={(e) => setFormData(prev => ({ ...prev, clinic_address: e.target.value }))}
                placeholder="Dirección completa de la clínica"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">Teléfono</Label>
                <Input
                  id="clinic-phone"
                  value={formData.clinic_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinic_phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinic-email">Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={formData.clinic_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinic_email: e.target.value }))}
                  placeholder="contacto@clinica.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-description">Descripción</Label>
              <Textarea
                id="clinic-description"
                value={formData.clinic_description}
                onChange={(e) => setFormData(prev => ({ ...prev, clinic_description: e.target.value }))}
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
                value={formData.doctor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                placeholder="Dr. Juan Pérez"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Select
                value={formData.doctor_specialty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_specialty: value }))}
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
                value={formData.doctor_license}
                onChange={(e) => setFormData(prev => ({ ...prev, doctor_license: e.target.value }))}
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
                    checked={formData.notifications_enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, notifications_enabled: checked }))
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
                    checked={formData.email_reminders_enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, email_reminders_enabled: checked }))
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
                    checked={formData.sms_reminders_enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, sms_reminders_enabled: checked }))
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
                    value={formData.appointment_duration.toString()}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, appointment_duration: parseInt(value) }))
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
                      value={formData.working_hours_start}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, working_hours_start: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Hora de fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formData.working_hours_end}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, working_hours_end: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="break-start">Descanso inicio</Label>
                    <Input
                      id="break-start"
                      type="time"
                      value={formData.break_time_start}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, break_time_start: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="break-end">Descanso fin</Label>
                    <Input
                      id="break-end"
                      type="time"
                      value={formData.break_time_end}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, break_time_end: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Días laborables</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {workingDaysOptions.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={(formData.working_days || []).includes(day.value)}
                          onCheckedChange={(checked) => handleWorkingDayChange(day.value, checked as boolean)}
                        />
                        <Label htmlFor={day.value} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
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