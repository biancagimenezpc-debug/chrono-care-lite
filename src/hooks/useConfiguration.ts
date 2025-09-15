import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Configuration {
  id?: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  clinic_email?: string;
  clinic_description?: string;
  doctor_name?: string;
  specialty?: string;
  license_number?: string;
  notifications?: boolean;
  email_reminders?: boolean;
  sms_reminders?: boolean;
  appointment_duration?: number;
  working_hours_start?: string;
  working_hours_end?: string;
}

export const useConfiguration = () => {
  const [configuration, setConfiguration] = useState<Configuration>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user configuration
  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching configuration:', error);
        return;
      }

      if (data) {
        setConfiguration(data);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfiguration = async (configData: Configuration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user authenticated');
      }

      // Check if configuration exists
      const { data: existingConfig } = await supabase
        .from('configurations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existingConfig) {
        // Update existing configuration
        result = await supabase
          .from('configurations')
          .update({
            ...configData,
            user_id: user.id
          })
          .eq('user_id', user.id);
      } else {
        // Create new configuration
        result = await supabase
          .from('configurations')
          .insert({
            ...configData,
            user_id: user.id
          });
      }

      if (result.error) {
        throw result.error;
      }

      setConfiguration(prev => ({ ...prev, ...configData }));
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente en la base de datos.",
      });

    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConfiguration();
  }, []);

  return {
    configuration,
    loading,
    saveConfiguration,
    refetch: fetchConfiguration
  };
};