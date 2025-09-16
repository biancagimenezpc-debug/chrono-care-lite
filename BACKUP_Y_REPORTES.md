# Sistema de Backup y Reportes - MediClinic

## 📋 Resumen

Se ha implementado un sistema completo de backup y reportes con las siguientes características:

- **Sistema de Backup robusto** con exportación JSON completa
- **Sección "Informes"** exclusiva para administradores
- **Exportación a Excel** de pacientes, turnos e historias clínicas
- **Importación masiva** de pacientes desde Excel
- **Controles de acceso** basados en roles de usuario

## 🔐 Control de Acceso

### Solo Administradores
- El menú "Informes" solo es visible para usuarios con rol de administrador
- La página de reportes valida permisos de administrador al cargar
- Users no administradores ven un mensaje de acceso restringido

### Validación
- Se utiliza el hook `useUserManagement` para verificar permisos
- Control automático en navegación y componentes

## 💾 Sistema de Backup

### Características
- **Backup completo**: Incluye todas las tablas del sistema
- **Formato JSON**: Estructurado y legible
- **Metadatos**: Información sobre fecha, versión y cantidad de registros
- **Descarga automática**: Archivo nombrado con fecha actual

### Tablas incluidas en el backup
- `patients` (Pacientes)
- `appointments` (Turnos)
- `medical_records` (Historias clínicas)
- `configurations` (Configuraciones)
- `user_profiles` (Perfiles de usuario)

### Uso
1. Ir a la sección "Informes" (solo administradores)
2. Hacer clic en "Crear Respaldo Completo"
3. El archivo se descarga automáticamente como `chrono-care-backup-YYYY-MM-DD.json`

## 📊 Exportación a Excel

### Tipos de reportes disponibles

#### 1. Exportación de Pacientes
- **Contenido**: Lista completa de pacientes con toda su información
- **Formato**: Excel (.xlsx)
- **Columnas incluidas**:
  - ID, Nombre Completo, Email, Teléfono
  - Fecha de Nacimiento, Género, Dirección
  - Contactos de emergencia, Seguro médico
  - Condiciones médicas, Medicamentos, Alergias
  - Fecha de registro

#### 2. Exportación de Turnos
- **Contenido**: Historial completo de citas y turnos
- **Formato**: Excel (.xlsx)
- **Columnas incluidas**:
  - ID, Paciente, Teléfono, Fecha, Hora
  - Tipo de consulta, Estado, Notas
  - Doctor ID, Fecha de creación

#### 3. Exportación Completa (Pacientes + Historias)
- **Contenido**: Reporte integral con múltiples hojas
- **Formato**: Excel (.xlsx) con 3 hojas:
  1. **Pacientes**: Información básica de pacientes
  2. **Historias Clínicas**: Registros médicos completos
  3. **Resumen**: Vista consolidada con estadísticas

### Características técnicas
- **Auto-ajuste de columnas**: Ancho optimizado automáticamente
- **Nombres descriptivos**: Archivos con fecha (ej: `pacientes-2024-09-16.xlsx`)
- **Codificación UTF-8**: Soporte completo para caracteres especiales
- **Procesamiento por lotes**: Manejo eficiente de grandes volúmenes

## 📥 Importación de Pacientes

### Formato requerido
El archivo Excel debe contener las siguientes columnas (las marcadas con * son obligatorias):

- **Nombre Completo*** (requerido)
- **Teléfono*** (requerido)
- Email
- Fecha de Nacimiento (formato DD/MM/AAAA)
- Género
- Dirección
- Contacto de Emergencia
- Teléfono de Emergencia
- Seguro Médico
- Condiciones Médicas (separadas por comas)
- Medicamentos (separados por comas)
- Alergias (separadas por comas)

### Proceso de importación
1. Preparar archivo Excel con el formato correcto
2. Ir a la sección "Informes"
3. Seleccionar archivo en "Importación de Pacientes"
4. Hacer clic en "Importar Pacientes"
5. El sistema procesa en lotes de 50 registros

### Validación
- Solo se importan registros con nombre y teléfono válidos
- Validación automática de formato de archivo (.xlsx)
- Manejo de errores con mensajes descriptivos

## 📁 Archivos de Ejemplo

### CSV de ejemplo
Se incluye `ejemplo-pacientes.csv` con datos de muestra que muestra el formato exacto requerido.

### Generador de Excel
Se incluye `generate-sample-excel.js` para crear archivos de ejemplo en formato Excel.

## 🛠️ Implementación Técnica

### Dependencias agregadas
```bash
npm install xlsx @types/xlsx
```

### Hooks creados
- **`useBackup.ts`**: Manejo de backups completos del sistema
- **`useExcelExport.ts`**: Importación/exportación Excel
- **Integración con `useUserManagement.ts`**: Control de acceso

### Componentes actualizados
- **`Reports.tsx`**: Nueva página de informes (admin-only)
- **`Navigation.tsx`**: Menú "Informes" con filtro por rol
- **`Index.tsx`**: Routing para la nueva sección

## 🔄 Mejores Prácticas de Backup

### Recomendaciones
1. **Frecuencia**: Realizar backups diarios o semanales
2. **Almacenamiento**: Guardar en múltiples ubicaciones seguras
3. **Verificación**: Revisar integridad de archivos periódicamente
4. **Versionado**: Mantener múltiples versiones históricas

### Seguridad
- Los backups incluyen datos sensibles de pacientes
- Almacenar en ubicaciones cifradas
- Implementar políticas de retención de datos
- Controlar acceso a archivos de backup

## 🚀 Características Avanzadas

### Point-in-Time Recovery (PITR)
- Los backups incluyen timestamps precisos
- Permite restauración a momentos específicos
- Metadatos completos para auditoría

### Batch Processing
- Importación optimizada en lotes
- Manejo de archivos grandes sin timeouts
- Progreso visual para operaciones largas

### Error Handling
- Validación completa de datos
- Mensajes de error descriptivos
- Rollback automático en caso de fallas

## 📈 Monitoreo y Logs

### Notificaciones
- Toast notifications para todas las operaciones
- Confirmación de éxito con estadísticas
- Alertas de error con detalles técnicos

### Auditoria
- Tracking de exportaciones/importaciones
- Registros de acceso a funciones administrativas
- Timestamps precisos en todas las operaciones

---

## 📝 Notas Importantes

1. **Solo administradores** pueden acceder a estas funcionalidades
2. **Instalar dependencias** antes de usar: `npm install xlsx @types/xlsx`
3. **Archivos grandes** se procesan en lotes para evitar timeouts
4. **Seguridad**: Los datos exportados contienen información sensible
5. **Formato consistente**: Usar los archivos de ejemplo como referencia

## 🆘 Solución de Problemas

### Errores comunes
- **"Cannot find module 'xlsx'"**: Instalar dependencias faltantes
- **"Archivo inválido"**: Verificar formato .xlsx y estructura
- **"Acceso denegado"**: Confirmar permisos de administrador
- **"Error de importación"**: Validar formato de datos requeridos

### Soporte
Para problemas técnicos, verificar:
1. Permisos de usuario (administrador)
2. Dependencias instaladas
3. Formato de archivos Excel
4. Conexión a Supabase