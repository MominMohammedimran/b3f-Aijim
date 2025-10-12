-- Create push_subscribers table for Web Push API
CREATE TABLE IF NOT EXISTS public.push_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscribers ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can insert their own subscription"
  ON public.push_subscribers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscribers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscribers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all subscriptions
CREATE POLICY "Admin can view all subscriptions"
  ON public.push_subscribers
  FOR SELECT
  USING (auth.email() = 'aijim.official@gmail.com');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscribers_user_id ON public.push_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscribers_endpoint ON public.push_subscribers(endpoint);