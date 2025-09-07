-- =====================================================
-- ORDERS DATABASE SCHEMA
-- Handles: Orders, Payments, Delivery, Transactions
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, returned
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Shipping Information (denormalized for performance)
    shipping_first_name VARCHAR(100),
    shipping_last_name VARCHAR(100),
    shipping_company VARCHAR(150),
    shipping_address_line_1 VARCHAR(255),
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(20),
    
    -- Billing Information (denormalized for performance)
    billing_first_name VARCHAR(100),
    billing_last_name VARCHAR(100),
    billing_company VARCHAR(150),
    billing_address_line_1 VARCHAR(255),
    billing_address_line_2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    billing_phone VARCHAR(20),
    
    -- Order dates
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional metadata
    notes TEXT,
    admin_notes TEXT,
    cancellation_reason TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- Reference to products.id from products DB
    product_variant_id UUID, -- Reference to product_variants.id from products DB
    
    -- Product details at time of order (denormalized)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    variant_name VARCHAR(255),
    variant_sku VARCHAR(100),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Product attributes at time of purchase
    size VARCHAR(20),
    color VARCHAR(50),
    material VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- razorpay, stripe, cod, wallet
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled, refunded
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Payment gateway details
    gateway_transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    
    -- Payment method specific data
    payment_data JSONB, -- Store gateway-specific data
    
    -- Timestamps
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENT ATTEMPTS TABLE
-- =====================================================
CREATE TABLE public.payment_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL, -- initiated, processing, completed, failed
    error_code VARCHAR(100),
    error_message TEXT,
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REFUNDS TABLE
-- =====================================================
CREATE TABLE public.refunds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    refund_amount DECIMAL(12,2) NOT NULL,
    refund_reason VARCHAR(255),
    refund_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    gateway_refund_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SHIPPING TABLE
-- =====================================================
CREATE TABLE public.shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    carrier VARCHAR(100), -- Blue Dart, Delhivery, India Post, etc.
    tracking_number VARCHAR(200),
    tracking_url TEXT,
    shipping_method VARCHAR(100), -- standard, express, overnight
    weight_kg DECIMAL(8,2),
    dimensions_cm VARCHAR(50), -- "L x W x H"
    
    -- Shipping status tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, picked_up, in_transit, out_for_delivery, delivered, exception
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Shipping costs
    shipping_cost DECIMAL(10,2),
    insurance_cost DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SHIPPING TRACKING EVENTS
-- =====================================================
CREATE TABLE public.shipping_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    event_status VARCHAR(100) NOT NULL,
    event_description TEXT,
    location VARCHAR(255),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COUPONS AND DISCOUNTS
-- =====================================================
CREATE TABLE public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(12,2),
    maximum_discount_amount DECIMAL(12,2),
    
    usage_limit INTEGER, -- null = unlimited
    used_count INTEGER DEFAULT 0,
    usage_limit_per_user INTEGER DEFAULT 1,
    
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    applicable_categories TEXT[], -- array of category IDs
    applicable_products TEXT[], -- array of product IDs
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COUPON USAGE TRACKING
-- =====================================================
CREATE TABLE public.coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    discount_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RETURNS AND EXCHANGES
-- =====================================================
CREATE TABLE public.returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    
    return_type VARCHAR(20) NOT NULL, -- return, exchange
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, picked_up, processed, completed
    
    -- Return details
    quantity INTEGER NOT NULL DEFAULT 1,
    refund_amount DECIMAL(12,2),
    
    -- Exchange details (if applicable)
    exchange_product_id UUID, -- Reference to products.id from products DB
    exchange_variant_id UUID, -- Reference to product_variants.id from products DB
    exchange_price_difference DECIMAL(12,2) DEFAULT 0.00,
    
    -- Processing timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER SERVICE TICKETS
-- =====================================================
CREATE TABLE public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    order_id UUID REFERENCES public.orders(id), -- Optional - may not be order related
    
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- order_issue, product_inquiry, payment_issue, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    
    assigned_to UUID, -- Admin user ID (if applicable)
    resolution TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Orders indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_order_date ON public.orders(order_date);
CREATE INDEX idx_orders_total_amount ON public.orders(total_amount);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items(product_variant_id);

-- Payments indexes
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_gateway_transaction_id ON public.payments(gateway_transaction_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);

-- Shipments indexes
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX idx_shipments_status ON public.shipments(status);

-- Coupons indexes
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_validity ON public.coupons(valid_from, valid_until);

-- Returns indexes
CREATE INDEX idx_returns_order_id ON public.returns(order_id);
CREATE INDEX idx_returns_user_id ON public.returns(user_id);
CREATE INDEX idx_returns_status ON public.returns(status);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_order_id ON public.support_tickets(order_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Get count of orders today
    SELECT COUNT(*) INTO counter 
    FROM public.orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate order number: AVN-YYYYMMDD-NNNN
    order_num := 'AVN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    counter INTEGER;
BEGIN
    -- Get count of tickets today
    SELECT COUNT(*) INTO counter 
    FROM public.support_tickets 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate ticket number: TKT-YYYYMMDD-NNNN
    ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
    
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE set_order_number();

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW EXECUTE PROCEDURE set_ticket_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON public.returns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
