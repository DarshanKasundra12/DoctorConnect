-- Add notes column to teleconsult_meetings table
ALTER TABLE public.teleconsult_meetings 
ADD COLUMN IF NOT EXISTS notes TEXT;