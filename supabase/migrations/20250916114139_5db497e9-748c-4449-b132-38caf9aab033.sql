-- Add courier tracking information to orders table
ALTER TABLE public.orders 
ADD COLUMN courier JSONB DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.courier IS 'Stores courier information including waybill, awb, etc.';