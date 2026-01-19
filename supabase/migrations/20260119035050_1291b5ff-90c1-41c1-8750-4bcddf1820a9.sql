-- Create storage bucket for lost and found item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-found-images', 'lost-found-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload lost found images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lost-found-images' AND auth.uid() IS NOT NULL);

-- Allow public read access to images
CREATE POLICY "Anyone can view lost found images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lost-found-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'lost-found-images' AND auth.uid() IS NOT NULL);