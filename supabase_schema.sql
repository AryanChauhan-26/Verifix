-- ==============================================================================
-- VERIFIX - Hyperlocal Trust-Based Home Services Database Schema
-- Supabase / PostgreSQL Schema with Row Level Security (RLS) & Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  icon TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  base_visit_fee NUMERIC DEFAULT 149,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Customers & Provider base profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_role TEXT CHECK (user_role IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
  city TEXT DEFAULT 'Bengaluru',
  locality TEXT DEFAULT 'Indiranagar',
  language_pref TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROVIDERS (Detailed profile, verification flags, reputation)
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  experience_years INT DEFAULT 1,
  primary_category_id TEXT REFERENCES service_categories(id),
  service_areas TEXT[] DEFAULT ARRAY['Indiranagar', 'Koramangala', 'HSR Layout'],
  is_online BOOLEAN DEFAULT FALSE,
  current_lat NUMERIC(10, 7),
  current_lng NUMERIC(10, 7),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  location_updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  id_document_type TEXT DEFAULT 'Aadhaar',
  id_verified_by_admin BOOLEAN DEFAULT FALSE,
  reference_calls_verified INT DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 5.0,
  total_reviews_count INT DEFAULT 0,
  repeat_customers_count INT DEFAULT 0,
  total_jobs_completed INT DEFAULT 0,
  response_time_minutes INT DEFAULT 5,
  cancellation_rate NUMERIC(4, 2) DEFAULT 0.0,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROVIDER SERVICES (Categories/skills offered by a provider)
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES service_categories(id) ON DELETE CASCADE,
  rate_per_hour NUMERIC DEFAULT 250,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(provider_id, category_id)
);

-- 5. PROVIDER VERIFICATIONS (ID documents + 3 customer reference audits)
CREATE TABLE IF NOT EXISTS provider_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  id_document_url TEXT,
  id_status TEXT CHECK (id_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  reference_1_phone TEXT,
  reference_1_status TEXT CHECK (reference_1_status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  reference_2_phone TEXT,
  reference_2_status TEXT CHECK (reference_2_status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  reference_3_phone TEXT,
  reference_3_status TEXT CHECK (reference_3_status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOB REQUESTS (Hyperlocal matching & OTP lifecycle)
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES service_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  voice_note_url TEXT,
  booking_type TEXT CHECK (booking_type IN ('emergency', 'scheduled')) DEFAULT 'emergency',
  scheduled_for TIMESTAMPTZ,
  locality TEXT NOT NULL,
  address TEXT NOT NULL,
  customer_lat NUMERIC(10, 7),
  customer_lng NUMERIC(10, 7),
  ai_min_estimate NUMERIC NOT NULL,
  ai_max_estimate NUMERIC NOT NULL,
  ai_reasoning TEXT,
  otp_code VARCHAR(4) NOT NULL,
  status TEXT CHECK (status IN (
    'requested',
    'accepted',
    'on_the_way',
    'arrived',
    'quote_submitted',
    'quote_approved',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
  )) DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JOB STATUS HISTORY (Audit trail of job transitions)
CREATE TABLE IF NOT EXISTS job_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUOTES (Final quote submitted by provider on arrival)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  labor_cost NUMERIC NOT NULL,
  materials_cost NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  breakdown_notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  customer_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REVIEWS (Job-linked strictly after OTP verified completion)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE REFERENCES job_requests(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  would_hire_again BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REPEAT CUSTOMER LINKS (Derived trust metric)
CREATE TABLE IF NOT EXISTS repeat_customer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES providers(id),
  repeat_count INT DEFAULT 1,
  first_job_date TIMESTAMPTZ DEFAULT NOW(),
  last_job_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, provider_id)
);

-- 11. DISPUTES (Raised within 48h of job completion)
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  raised_by_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  evidence_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  admin_status TEXT CHECK (admin_status IN ('open', 'under_review', 'resolved_refund', 'resolved_rejected')) DEFAULT 'open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PRICE HISTORY (For training and tuning future local AI pricing)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT REFERENCES service_categories(id),
  locality TEXT NOT NULL,
  problem_type TEXT,
  final_paid_amount NUMERIC NOT NULL,
  ai_estimated_midpoint NUMERIC,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR FAST HYPERLOCAL QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_providers_online ON providers(is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_job_requests_customer ON job_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_provider ON job_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_repeat_customers ON repeat_customer_links(provider_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified providers for browsing
CREATE POLICY "Public providers read" ON providers FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Public reviews read" ON reviews FOR SELECT USING (true);

-- Users can read and update their own profiles
CREATE POLICY "User own profile access" ON users FOR ALL USING (auth.uid() = id);

-- CUSTOMER & PROVIDER SEPARATION FOR JOB REQUESTS (Phase 2 Requirement 8)
-- 1. Customers can view only their own jobs
CREATE POLICY "Customer own jobs read" ON job_requests FOR SELECT
USING (auth.uid() = customer_id);

-- 2. Assigned provider can view their assigned jobs
CREATE POLICY "Assigned provider jobs read" ON job_requests FOR SELECT
USING (auth.uid() = provider_id);

-- 3. Online verified providers can view broadcasted incoming requests in their category
CREATE POLICY "Nearby providers incoming request read" ON job_requests FOR SELECT
USING (
  status = 'requested' AND
  EXISTS (
    SELECT 1 FROM providers
    WHERE providers.id = auth.uid()
    AND providers.is_online = true
    AND providers.primary_category_id = job_requests.category_id
  )
);

-- Only customer can create a job request
CREATE POLICY "Customer create job" ON job_requests FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Only assigned provider or customer can update job status
CREATE POLICY "Job participants update" ON job_requests FOR UPDATE
USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Participants can view and manage quotes
CREATE POLICY "Quote view" ON quotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_requests 
    WHERE job_requests.id = quotes.job_id 
    AND (job_requests.customer_id = auth.uid() OR job_requests.provider_id = auth.uid())
  )
);

CREATE POLICY "Provider create quote" ON quotes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_requests 
    WHERE job_requests.id = quotes.job_id 
    AND job_requests.provider_id = auth.uid()
  )
);

-- ==============================================================================
-- PRIVATE STORAGE BUCKET & RLS POLICIES (Phase 2 Requirement 1)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('provider_documents', 'provider_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Provider can only upload into their own folder: provider_documents/{provider_id}/*
CREATE POLICY "Provider upload own document" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Provider can only view their own document
CREATE POLICY "Provider read own document" ON storage.objects FOR SELECT
USING (
  bucket_id = 'provider_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION (Phase 2 & Phase 3 Live Map Tracking)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE job_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE providers;

-- ==============================================================================
-- POSTGIS / HAVERSINE NEARBY PROVIDERS RPC FUNCTION & SPATIAL INDEXING
-- ==============================================================================
-- Enable PostGIS if available on server
CREATE EXTENSION IF NOT EXISTS postgis;

-- Index for fast spatial and status filtering
CREATE INDEX IF NOT EXISTS idx_providers_spatial_status 
ON providers(is_online, is_verified, last_seen_at);

-- RPC Function: nearby_providers
-- Treats any provider with last_seen_at older than 2 minutes as offline
-- Rounds public approximate location for privacy unless assigned to active job
CREATE OR REPLACE FUNCTION nearby_providers(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5.0,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  category TEXT,
  rating NUMERIC,
  reviews_count INT,
  repeat_customers INT,
  experience_years INT,
  approx_lat NUMERIC,
  approx_lng NUMERIC,
  distance_km NUMERIC,
  eta_minutes INT,
  is_online BOOLEAN,
  is_verified BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.full_name AS name,
    u.avatar_url,
    p.primary_category_id AS category,
    p.average_rating AS rating,
    p.total_reviews_count AS reviews_count,
    p.repeat_customers_count AS repeat_customers,
    p.experience_years,
    -- Approximate coordinates rounded to 3 decimal places (~110m) for privacy
    ROUND(p.current_lat::numeric, 3) AS approx_lat,
    ROUND(p.current_lng::numeric, 3) AS approx_lng,
    -- Haversine formula calculation in kilometers
    ROUND(
      (6371 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(user_lat)) * cos(radians(p.current_lat)) *
          cos(radians(p.current_lng) - radians(user_lng)) +
          sin(radians(user_lat)) * sin(radians(p.current_lat))
        ))
      ))::numeric, 1
    ) AS distance_km,
    -- Estimated Arrival Time (~5 mins per km + 3 min base)
    GREATEST(3, ROUND((6371 * acos(
      least(1.0, greatest(-1.0, 
        cos(radians(user_lat)) * cos(radians(p.current_lat)) *
        cos(radians(p.current_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(p.current_lat))
      ))
    ) * 5 + 3))::INT) AS eta_minutes,
    p.is_online,
    p.is_verified
  FROM providers p
  JOIN users u ON u.id = p.id
  WHERE 
    p.is_verified = TRUE
    AND p.is_online = TRUE
    -- 2-minute offline cutoff rule
    AND p.last_seen_at >= (NOW() - INTERVAL '2 minutes')
    AND p.current_lat IS NOT NULL 
    AND p.current_lng IS NOT NULL
    AND (category_filter IS NULL OR p.primary_category_id = category_filter)
    -- Within search radius
    AND (6371 * acos(
      least(1.0, greatest(-1.0, 
        cos(radians(user_lat)) * cos(radians(p.current_lat)) *
        cos(radians(p.current_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(p.current_lat))
      ))
    )) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$;


