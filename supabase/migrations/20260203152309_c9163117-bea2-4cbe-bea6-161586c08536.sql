-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDFs bucket
CREATE POLICY "Anyone can view PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdfs');

CREATE POLICY "Admins can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Admins can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Add admin RLS policies for PDFs table
CREATE POLICY "Admins can insert PDFs"
ON public.pdfs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update PDFs"
ON public.pdfs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete PDFs"
ON public.pdfs FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin RLS policies for categories table
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));