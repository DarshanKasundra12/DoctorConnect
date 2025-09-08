-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for clinic logo uploads
CREATE POLICY "Clinic logo images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'clinic-logos');

CREATE POLICY "Users can upload their own clinic logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'clinic-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own clinic logo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'clinic-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clinic logo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'clinic-logos' AND auth.uid()::text = (storage.foldername(name))[1]);