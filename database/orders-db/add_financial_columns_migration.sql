-- =====================================================
-- MIGRATION: Add Financial Columns to Orders Table
-- Date: 2025-01-06
-- Description: Adds subtotal, tax_amount, shipping_amount, and discount_amount columns to orders table
-- =====================================================

-- Add missing financial columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- Update existing orders to have proper subtotal values based on total_amount
-- This assumes existing orders have total_amount set correctly
UPDATE public.orders 
SET subtotal = total_amount 
WHERE subtotal = 0 AND total_amount > 0;

-- Add comment to track migration
COMMENT ON COLUMN public.orders.subtotal IS 'Subtotal amount before tax, shipping, and discounts';
COMMENT ON COLUMN public.orders.tax_amount IS 'Tax amount applied to the order';
COMMENT ON COLUMN public.orders.shipping_amount IS 'Shipping cost for the order';
COMMENT ON COLUMN public.orders.discount_amount IS 'Discount amount applied to the order';
