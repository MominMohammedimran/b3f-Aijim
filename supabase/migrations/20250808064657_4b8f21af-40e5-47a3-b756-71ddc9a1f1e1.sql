-- Add order_issue column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_issue'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_issue jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Update payment_issue and order_issue to be arrays instead of objects
UPDATE orders 
SET payment_issue = CASE 
    WHEN payment_issue IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(payment_issue) = 'object' THEN jsonb_build_array(payment_issue)
    ELSE payment_issue
END;

UPDATE orders 
SET order_issue = CASE 
    WHEN order_issue IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(order_issue) = 'object' THEN jsonb_build_array(order_issue)
    ELSE order_issue
END;