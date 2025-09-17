# Solución al Problema de Citas No Sincronizadas

## Problema Identificado
Los turnos/citas no se estaban registrando correctamente entre el Dashboard y la sección de Turnos debido a inconsistencias en la consulta de datos y las políticas de seguridad (RLS) de la base de datos.

## Causa Raíz
1. **Filtrado inconsistente**: El hook `useAppointments` no filtraba las citas por `doctor_id`, mostrando citas de todos los doctores en el dashboard, pero esperando solo las del doctor actual en la sección de turnos.

2. **Políticas RLS incorrectas**: Las políticas de Row Level Security permitían ver todas las citas a todos los usuarios autenticados, en lugar de filtrar por doctor.

## Cambios Realizados

### 1. Corrección en useAppointments.ts
- Añadido filtro por `doctor_id` en la función `fetchAppointments`
- Ahora solo se obtienen las citas del doctor autenticado actual

### 2. Corrección en useMedicalRecords.ts  
- Añadido filtro por `doctor_id` en la función `fetchRecords`
- Consistencia con el sistema de múltiples doctores

### 3. Nueva migración de base de datos
Creado archivo: `supabase/migrations/20250917000001_fix_appointment_rls_policies.sql`

Esta migración:
- Corrige las políticas RLS para appointments
- Corrige las políticas RLS para medical_records
- Garantiza que cada doctor solo vea sus propias citas e historias clínicas

## Aplicar la Solución

### Paso 1: Aplicar la migración de base de datos
```bash
# Si estás usando Supabase CLI local
supabase db reset

# O aplicar la migración específica
supabase migration up --target 20250917000001
```

### Paso 2: Verificar el funcionamiento
1. Ejecutar `npm run dev`
2. Iniciar sesión como doctor
3. Crear una cita para una fecha específica (ej: 24/09/2025)
4. Verificar que aparece tanto en el Dashboard como en la sección Turnos
5. Confirmar que al seleccionar esa fecha en Turnos, la cita aparece marcada como ocupada

## Impacto de los Cambios
- ✅ Las citas ahora se muestran consistentemente entre Dashboard y Turnos
- ✅ Cada doctor solo ve sus propias citas (mejor seguridad)
- ✅ Los horarios ocupados se muestran correctamente
- ✅ No hay más discrepancias entre las diferentes secciones

## Archivos Modificados
1. `src/hooks/useAppointments.ts` - Filtrado por doctor_id
2. `src/hooks/useMedicalRecords.ts` - Filtrado por doctor_id  
3. `supabase/migrations/20250917000001_fix_appointment_rls_policies.sql` - Nuevas políticas RLS

La solución garantiza que el sistema funcione correctamente en un entorno multi-doctor, donde cada profesional médico solo puede acceder a sus propias citas e historias clínicas.