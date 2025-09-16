import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Database, 
  Users, 
  Calendar, 
  FileText, 
  Loader2,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useExcelExport } from "@/hooks/useExcelExport";
import { useBackup } from "@/hooks/useBackup";

const Reports = () => {
  const { toast } = useToast();
  const { isAdmin } = useUserManagement();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    exportPatientsToExcel,
    exportAppointmentsToExcel,
    exportPatientsWithRecordsToExcel,
    importPatientsFromExcel
  } = useExcelExport();
  
  const { createFullBackup } = useBackup();

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Acceso Restringido</h3>
          <p className="text-muted-foreground">
            Esta sección está disponible solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      switch (type) {
        case 'patients':
          await exportPatientsToExcel();
          break;
        case 'appointments':
          await exportAppointmentsToExcel();
          break;
        case 'patients-records':
          await exportPatientsWithRecordsToExcel();
          break;
        default:
          throw new Error('Tipo de exportación no válido');
      }
    } catch (error) {
      // Error handled in hooks
    } finally {
      setLoading(null);
    }
  };

  const handleBackup = async () => {
    setLoading('backup');
    try {
      await createFullBackup();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Archivo requerido",
        description: "Por favor seleccione un archivo Excel para importar",
        variant: "destructive",
      });
      return;
    }

    setLoading('import');
    try {
      await importPatientsFromExcel(selectedFile);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          !file.name.endsWith('.xlsx')) {
        toast({
          title: "Formato de archivo inválido",
          description: "Por favor seleccione un archivo Excel (.xlsx)",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Informes y Exportaciones</h1>
        <p className="text-muted-foreground mt-2">
          Genere informes, exporte datos y gestione copias de seguridad
        </p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exportación de Datos
          </CardTitle>
          <CardDescription>
            Exporte datos del sistema a archivos CSV (upgrade a Excel instalando: npm install xlsx @types/xlsx)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Pacientes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Lista completa de pacientes (formato CSV)
                </p>
                <Button 
                  onClick={() => handleExport('patients')}
                  disabled={loading === 'patients'}
                  className="w-full"
                >
                  {loading === 'patients' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar Pacientes (CSV)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Turnos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Historial completo de citas (formato CSV)
                </p>
                <Button 
                  onClick={() => handleExport('appointments')}
                  disabled={loading === 'appointments'}
                  className="w-full"
                >
                  {loading === 'appointments' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar Turnos (CSV)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-success mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Pacientes + Historias</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Resumen con historias clínicas (formato CSV)
                </p>
                <Button 
                  onClick={() => handleExport('patients-records')}
                  disabled={loading === 'patients-records'}
                  className="w-full"
                >
                  {loading === 'patients-records' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar Resumen (CSV)
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importación de Pacientes
          </CardTitle>
          <CardDescription>
            Importe pacientes desde un archivo Excel con el formato correcto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Archivo Excel (.xlsx)</Label>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || loading === 'import'}
              className="flex-1"
            >
              {loading === 'import' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Importar Pacientes
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Formato de archivo requerido:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Nombre Completo</strong> (requerido)</li>
              <li>• <strong>Teléfono</strong> (requerido)</li>
              <li>• Email</li>
              <li>• Fecha de Nacimiento (DD/MM/AAAA)</li>
              <li>• Género</li>
              <li>• Dirección</li>
              <li>• Contacto de Emergencia</li>
              <li>• Teléfono de Emergencia</li>
              <li>• Seguro Médico</li>
              <li>• Condiciones Médicas (separadas por comas)</li>
              <li>• Medicamentos (separados por comas)</li>
              <li>• Alergias (separadas por comas)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Respaldo de Base de Datos
          </CardTitle>
          <CardDescription>
            Cree una copia de seguridad completa de todos los datos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> El respaldo incluye todos los datos del sistema. 
                Guarde el archivo en un lugar seguro y realice respaldos regularmente.
              </p>
            </div>
            
            <Button 
              onClick={handleBackup}
              disabled={loading === 'backup'}
              className="w-full"
              size="lg"
            >
              {loading === 'backup' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Crear Respaldo Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;