-- =====================================================
-- MINIMAL USER DATABASE SCHEMA
-- Essential tables only with core columns
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES (Essential only)
-- =====================================================
CREATE TABLE public.user_profiles (
    id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ADDRESSES (Essential only)
-- =====================================================
CREATE TABLE public.user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON public.user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.jwt() ->> 'sub' = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.jwt() ->> 'sub' = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = id);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

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

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to create user profile (called from Clerk webhook)
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    first_name VARCHAR(100) DEFAULT '',
    last_name VARCHAR(100) DEFAULT ''
)
RETURNS public.user_profiles AS $$
DECLARE
    new_profile public.user_profiles;
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (user_id, user_email, first_name, last_name)
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
