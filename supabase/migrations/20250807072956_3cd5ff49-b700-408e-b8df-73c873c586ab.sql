-- Create RLS policies for paymentproofs storage bucket
CREATE POLICY "Users can upload their own payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'paymentproofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own payment proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'paymentproofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own payment proofs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'paymentproofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own payment proofs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'paymentproofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'paymentproofs' AND auth.email() = 'b3fprintingsolutions@gmail.com');

-- Create order_issues table
CREATE TABLE IF NOT EXISTS public.order_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  transaction_id TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_issues table
ALTER TABLE public.order_issues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_issues
CREATE POLICY "Users can create their own order issues" 
ON public.order_issues 
FOR INSERT 
WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can view their own order issues" 
ON public.order_issues 
FOR SELECT 
USING (user_email = auth.email());

CREATE POLICY "Admin can view all order issues" 
ON public.order_issues 
FOR SELECT 
USING (auth.email() = 'b3fprintingsolutions@gmail.com');

CREATE POLICY "Admin can update all order issues" 
ON public.order_issues 
FOR UPDATE 
USING (auth.email() = 'b3fprintingsolutions@gmail.com');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_order_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_order_issues_updated_at
BEFORE UPDATE ON public.order_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_order_issues_updated_at();