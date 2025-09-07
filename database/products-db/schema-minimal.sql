-- =====================================================
-- MINIMAL PRODUCTS DATABASE SCHEMA
-- Essential tables only with core columns
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE (Essential only)
-- =====================================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE (Essential only)
-- =====================================================
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    image_url TEXT,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SHOPPING CART TABLE (Essential only)
-- =====================================================
CREATE TABLE public.shopping_cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255), -- Reference to user_profiles.id (null for guest)
    session_id VARCHAR(255), -- For guest users
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either user_id or session_id must be present
    CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL)),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- =====================================================
-- WISHLISTS TABLE (Essential only)
-- =====================================================
CREATE TABLE public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- PRODUCT REVIEWS TABLE (Essential only)
-- =====================================================
CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price ON public.products(price);

CREATE INDEX idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_session_id ON public.shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_product_id ON public.shopping_cart(product_id);

CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at 
    BEFORE UPDATE ON public.shopping_cart 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================
-- Insert sample categories
INSERT INTO public.categories (name, slug, is_active) VALUES
('Women''s Clothing', 'womens-clothing', TRUE),
('Ethnic Wear', 'ethnic-wear', TRUE),
('Sarees', 'sarees', TRUE);

-- Update ethnic wear to be under women's clothing
UPDATE public.categories 
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'womens-clothing') 
WHERE slug = 'ethnic-wear';

UPDATE public.categories 
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'ethnic-wear') 
WHERE slug = 'sarees';
