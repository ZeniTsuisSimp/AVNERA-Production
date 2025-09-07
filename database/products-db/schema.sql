-- =====================================================
-- PRODUCTS DATABASE SCHEMA
-- Handles: Products, Inventory, Categories, Reviews, Wishlist
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For advanced indexing

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    image_url TEXT,
    banner_url TEXT,
    
    -- SEO and metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Display settings
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_in_menu BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================
CREATE TABLE public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    
    -- Collection type and settings
    collection_type VARCHAR(50) DEFAULT 'manual', -- manual, automatic, featured
    conditions JSONB, -- For automatic collections
    
    -- Display settings
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE,
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2), -- Original price for discounts
    cost_price DECIMAL(12,2), -- Cost price for profit calculations
    
    -- Categories and collections
    category_id UUID REFERENCES public.categories(id),
    collection_id UUID REFERENCES public.collections(id),
    
    -- Product attributes
    brand VARCHAR(100),
    material VARCHAR(100),
    care_instructions TEXT,
    country_of_origin VARCHAR(100) DEFAULT 'India',
    
    -- Physical properties
    weight_grams INTEGER,
    dimensions JSONB, -- {length, width, height}
    
    -- Inventory tracking
    track_inventory BOOLEAN DEFAULT TRUE,
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT FALSE,
    
    -- Product status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    
    -- SEO and metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT VARIANTS TABLE
-- =====================================================
CREATE TABLE public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255), -- e.g., "Red / Large"
    sku VARCHAR(100) UNIQUE,
    
    -- Variant attributes
    size VARCHAR(50),
    color VARCHAR(50),
    material VARCHAR(100),
    pattern VARCHAR(100),
    
    -- Pricing (can override product pricing)
    price DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Inventory for this variant
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT FALSE,
    
    -- Physical properties
    weight_grams INTEGER,
    dimensions JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE, -- Optional: specific to variant
    
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Image metadata
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- in bytes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY MOVEMENTS TABLE
-- =====================================================
CREATE TABLE public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    
    movement_type VARCHAR(50) NOT NULL, -- purchase, sale, return, adjustment, damage
    quantity_change INTEGER NOT NULL, -- positive for increase, negative for decrease
    quantity_after INTEGER NOT NULL, -- inventory quantity after this movement
    
    -- Reference information
    order_id UUID, -- Reference to orders.id from orders DB (if applicable)
    order_item_id UUID, -- Reference to order_items.id from orders DB (if applicable)
    return_id UUID, -- Reference to returns.id from orders DB (if applicable)
    
    reason VARCHAR(255),
    notes TEXT,
    
    -- Who made the change
    user_id VARCHAR(255), -- Reference to user_profiles.id from user DB
    admin_user_id VARCHAR(255), -- If changed by admin
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================
CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    order_item_id UUID, -- Reference to order_items.id from orders DB (for verified purchases)
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Review attributes
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE, -- For moderation
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Helpful votes
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Admin moderation
    admin_response TEXT,
    admin_response_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEW VOTES TABLE
-- =====================================================
CREATE TABLE public.review_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES public.product_reviews(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    is_helpful BOOLEAN NOT NULL, -- true for helpful, false for not helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(review_id, user_id) -- One vote per user per review
);

-- =====================================================
-- WISHLIST TABLE
-- =====================================================
CREATE TABLE public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Reference to user_profiles.id from user DB
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id, product_variant_id)
);

-- =====================================================
-- SHOPPING CART TABLE
-- =====================================================
CREATE TABLE public.shopping_cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255), -- Reference to user_profiles.id from user DB (null for guest sessions)
    session_id VARCHAR(255), -- For guest users
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either user_id or session_id must be present
    CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL)),
    UNIQUE(user_id, product_id, product_variant_id),
    UNIQUE(session_id, product_id, product_variant_id)
);

-- =====================================================
-- PRODUCT ATTRIBUTES (For flexible product properties)
-- =====================================================
CREATE TABLE public.product_attributes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "fabric", "sleeve_length"
    display_name VARCHAR(255) NOT NULL, -- e.g., "Fabric Type", "Sleeve Length"
    attribute_type VARCHAR(50) DEFAULT 'text', -- text, select, multiselect, boolean, number
    options TEXT[], -- For select/multiselect types
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT ATTRIBUTE VALUES
-- =====================================================
CREATE TABLE public.product_attribute_values (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, attribute_id)
);

-- =====================================================
-- PRODUCT SEARCH VECTORS (For full-text search)
-- =====================================================
CREATE TABLE public.product_search (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE PRIMARY KEY,
    search_vector tsvector,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Categories indexes
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = TRUE;

-- Collections indexes
CREATE INDEX idx_collections_slug ON public.collections(slug);
CREATE INDEX idx_collections_active ON public.collections(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_collections_featured ON public.collections(is_featured) WHERE is_featured = TRUE;

-- Products indexes
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_collection_id ON public.products(collection_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_inventory ON public.products(inventory_quantity);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_variants_active ON public.product_variants(is_active) WHERE is_active = TRUE;

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_variant_id ON public.product_images(product_variant_id);
CREATE INDEX idx_product_images_primary ON public.product_images(product_id, is_primary) WHERE is_primary = TRUE;

-- Inventory movements indexes
CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_variant_id ON public.inventory_movements(product_variant_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Product reviews indexes
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);

-- Wishlist indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Shopping cart indexes
CREATE INDEX idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_session_id ON public.shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_product_id ON public.shopping_cart(product_id);

-- Product attributes indexes
CREATE INDEX idx_product_attribute_values_product_id ON public.product_attribute_values(product_id);
CREATE INDEX idx_product_attribute_values_attribute_id ON public.product_attribute_values(attribute_id);

-- Search indexes
CREATE INDEX idx_product_search_vector ON public.product_search USING GIN(search_vector);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update inventory quantity when variants change
CREATE OR REPLACE FUNCTION update_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Update parent product inventory to sum of all variants
    UPDATE public.products 
    SET inventory_quantity = (
        SELECT COALESCE(SUM(inventory_quantity), 0)
        FROM public.product_variants 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_active = TRUE
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product inventory when variants change
CREATE TRIGGER update_product_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW EXECUTE PROCEDURE update_product_inventory();

-- Function to log inventory movements
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if inventory quantity actually changed
    IF OLD.inventory_quantity IS DISTINCT FROM NEW.inventory_quantity THEN
        INSERT INTO public.inventory_movements (
            product_id,
            product_variant_id,
            movement_type,
            quantity_change,
            quantity_after,
            reason
        ) VALUES (
            NEW.product_id,
            NEW.id,
            'adjustment',
            NEW.inventory_quantity - OLD.inventory_quantity,
            NEW.inventory_quantity,
            'System adjustment'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log inventory movements for variants
CREATE TRIGGER log_variant_inventory_movement_trigger
    AFTER UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE PROCEDURE log_inventory_movement();

-- Function to update product search vectors
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert search vector
    INSERT INTO public.product_search (product_id, search_vector)
    VALUES (
        NEW.id,
        to_tsvector('english', 
            COALESCE(NEW.name, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.short_description, '') || ' ' ||
            COALESCE(NEW.brand, '') || ' ' ||
            COALESCE(NEW.material, '') || ' ' ||
            COALESCE(NEW.sku, '')
        )
    )
    ON CONFLICT (product_id) 
    DO UPDATE SET 
        search_vector = to_tsvector('english', 
            COALESCE(NEW.name, '') || ' ' ||
            COALESCE(NEW.description, '') || ' ' ||
            COALESCE(NEW.short_description, '') || ' ' ||
            COALESCE(NEW.brand, '') || ' ' ||
            COALESCE(NEW.material, '') || ' ' ||
            COALESCE(NEW.sku, '')
        ),
        updated_at = NOW();
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vectors when products change
CREATE TRIGGER update_product_search_vector_trigger
    AFTER INSERT OR UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE update_product_search_vector();

-- Function to update review statistics
CREATE OR REPLACE FUNCTION update_review_statistics()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
BEGIN
    -- Calculate review statistics for the product
    SELECT 
        COUNT(*) as review_count,
        AVG(rating) as average_rating
    INTO product_record
    FROM public.product_reviews 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND is_approved = TRUE;
    
    -- Store in products table (we'll add these columns)
    -- This is just a placeholder - you might store this in a separate table
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update review statistics
CREATE TRIGGER update_review_statistics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
    FOR EACH ROW EXECUTE PROCEDURE update_review_statistics();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON public.shopping_cart FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert some sample categories
INSERT INTO public.categories (name, slug, description, is_active) VALUES
('Women''s Clothing', 'womens-clothing', 'Latest fashion for women', TRUE),
('Ethnic Wear', 'ethnic-wear', 'Traditional Indian clothing', TRUE),
('Indo-Western', 'indo-western', 'Fusion of Indian and Western styles', TRUE),
('Sarees', 'sarees', 'Traditional Indian sarees', TRUE),
('Kurtas', 'kurtas', 'Traditional kurtas and kurtis', TRUE);

-- Insert some sample collections
INSERT INTO public.collections (name, slug, description, is_featured, is_active) VALUES
('Summer Collection 2024', 'summer-2024', 'Light and breezy summer wear', TRUE, TRUE),
('Wedding Special', 'wedding-special', 'Perfect for wedding celebrations', TRUE, TRUE),
('Office Wear', 'office-wear', 'Professional and comfortable', FALSE, TRUE);

-- Insert sample product attributes
INSERT INTO public.product_attributes (name, display_name, attribute_type, is_filterable) VALUES
('fabric', 'Fabric Type', 'select', TRUE),
('sleeve_length', 'Sleeve Length', 'select', TRUE),
('fit', 'Fit', 'select', TRUE),
('occasion', 'Occasion', 'multiselect', TRUE),
('care_instructions', 'Care Instructions', 'text', FALSE);
