-- Create calls table for call-based workflow
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    call_type VARCHAR(50) NOT NULL DEFAULT 'inquiry',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    call_notes TEXT,
    call_duration INTEGER, -- in minutes
    call_outcome VARCHAR(50),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_patient_id ON public.calls(patient_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own calls" 
ON public.calls FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calls" 
ON public.calls FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls" 
ON public.calls FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calls" 
ON public.calls FOR DELETE 
USING (auth.uid() = user_id);

-- Add call types enum constraint
ALTER TABLE public.calls ADD CONSTRAINT check_call_type 
CHECK (call_type IN ('inquiry', 'consultation', 'follow_up', 'emergency', 'appointment_booking', 'prescription_follow_up'));

-- Add status constraint
ALTER TABLE public.calls ADD CONSTRAINT check_call_status 
CHECK (status IN ('active', 'completed', 'cancelled', 'transferred'));

-- Add outcome constraint
ALTER TABLE public.calls ADD CONSTRAINT check_call_outcome 
CHECK (call_outcome IN ('appointment_scheduled', 'prescription_given', 'referred', 'resolved', 'follow_up_needed', 'cancelled'));
