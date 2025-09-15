-- Create configuration table for clinic settings
CREATE TABLE public.configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  clinic_email TEXT,
  clinic_description TEXT,
  doctor_name TEXT,
  specialty TEXT,
  license_number TEXT,
  notifications BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT false,
  appointment_duration INTEGER DEFAULT 30,
  working_hours_start TIME DEFAULT '08:00:00',
  working_hours_end TIME DEFAULT '18:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for configuration access
CREATE POLICY "Users can view their own configuration" 
ON public.configurations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configuration" 
ON public.configurations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuration" 
ON public.configurations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_configurations_updated_at
BEFORE UPDATE ON public.configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();