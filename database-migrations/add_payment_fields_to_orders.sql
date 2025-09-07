-- Add payment tracking fields to orders table
-- Run this in your Supabase SQL editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Update existing orders to have payment_method
UPDATE orders SET payment_method = 'UNKNOWN' WHERE payment_method IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: STRIPE, COD, etc.';
COMMENT ON COLUMN orders.payment_intent_id IS 'Stripe PaymentIntent ID for tracking';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, completed, failed, refunded';
