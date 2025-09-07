-- =====================================================
-- USER DATABASE SCHEMA
-- Handles: Authentication, User Profiles, User Preferences
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- =====================================================
-- USERS TABLE (Extended from Clerk Auth)
-- =====================================================
CREATE TABLE public.user_profiles (
    id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_notifications BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ADDRESSES
-- =====================================================
CREATE TABLE public.user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(150),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PREFERENCES
-- =====================================================
CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    preferred_size VARCHAR(10),
    preferred_color VARCHAR(50),
    style_preference TEXT[], -- array of style preferences
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    favorite_categories TEXT[], -- array of category IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER SESSIONS (for tracking login history)
-- =====================================================
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ACTIVITY LOGS
-- =====================================================
CREATE TABLE public.user_activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- login, logout, profile_update, etc.
    activity_description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- additional data in JSON format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON public.user_addresses(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_type ON public.user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User Profiles - Users can only see and modify their own profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.jwt() ->> 'sub' = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.jwt() ->> 'sub' = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = id);

-- User Addresses - Users can only access their own addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON public.user_addresses FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users can insert own addresses" ON public.user_addresses FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users can update own addresses" ON public.user_addresses FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users can delete own addresses" ON public.user_addresses FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- User Preferences - Users can only access their own preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- User Sessions - Users can only view their own sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- User Activity Logs - Users can only view their own activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

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
