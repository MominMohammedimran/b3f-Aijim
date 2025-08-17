-- Create payment_issues table
CREATE TABLE IF NOT EXISTS public.payment_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  phone_number TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  admin_response TEXT,
  admin_uploaded_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_issues
ALTER TABLE public.payment_issues ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_issues
CREATE POLICY "Users can create their own payment issues"
  ON public.payment_issues FOR INSERT
  WITH CHECK (user_email = auth.email());

CREATE POLICY "Users can view their own payment issues"
  ON public.payment_issues FOR SELECT
  USING (user_email = auth.email());

CREATE POLICY "Admin can view all payment issues"
  ON public.payment_issues FOR SELECT
  USING (auth.email() = 'b3fprintingsolutions@gmail.com');

CREATE POLICY "Admin can update all payment issues"
  ON public.payment_issues FOR UPDATE
  USING (auth.email() = 'b3fprintingsolutions@gmail.com');

-- Add missing fields to orders table if they don't exist
DO $$ 
BEGIN
  -- Add status_note if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status_note') THEN
    ALTER TABLE public.orders ADD COLUMN status_note TEXT;
  END IF;
END $$;

-- Create update trigger for payment_issues
CREATE OR REPLACE FUNCTION update_payment_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_issues_updated_at
  BEFORE UPDATE ON public.payment_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_issues_updated_at();