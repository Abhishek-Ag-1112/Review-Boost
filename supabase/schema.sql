-- ============================================================
-- ReviewPe — Unified Database Schema
-- Plans: free | starter | growth
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. BUSINESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  google_place_id TEXT NOT NULL,
  google_review_url TEXT NOT NULL,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#059669',
  tagline TEXT DEFAULT 'How was your experience today?',
  category TEXT DEFAULT 'other',
  language TEXT DEFAULT 'en',
  whatsapp_number TEXT,
  notification_email TEXT,

  -- Plan & subscription
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth')),
  is_active BOOLEAN DEFAULT true,
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ended BOOLEAN DEFAULT false,
  hide_branding BOOLEAN DEFAULT false,

  -- Payment tracking (manual billing model)
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'due_soon', 'unpaid')),
  payment_due_date TEXT,
  payment_amount INTEGER DEFAULT 0,

  -- Public developer API
  api_key TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  is_public BOOLEAN DEFAULT true,

  -- Public review fields (4-5 stars → Google redirect path)
  custom_text TEXT,
  ai_suggestion_used TEXT,

  -- Private feedback fields (1-3 stars → private path)
  private_feedback TEXT,
  customer_name TEXT,
  customer_phone TEXT,

  -- Resolution tracking
  is_resolved BOOLEAN DEFAULT false,
  owner_note TEXT,

  -- Metadata
  language_used TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. QR SCANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  scan_source TEXT DEFAULT 'qr' CHECK (scan_source IN ('qr', 'nfc', 'link', 'whatsapp')),
  user_agent TEXT,
  referrer TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. SUBSCRIPTIONS TABLE (Razorpay integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'growth')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'halted', 'cancelled', 'completed')),
  amount INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. LOCATIONS TABLE (multi-branch support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  google_place_id TEXT NOT NULL,
  google_review_url TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- ============================================================
-- 6. NFC CARDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nfc_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  card_uid TEXT UNIQUE NOT NULL,
  label TEXT DEFAULT 'Default NFC Card',
  is_active BOOLEAN DEFAULT true,
  tap_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. UPGRADE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  current_plan TEXT NOT NULL,
  requested_plan TEXT NOT NULL CHECK (requested_plan IN ('free', 'starter', 'growth')),
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_api_key ON public.businesses(api_key);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_business ON public.qr_scans(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned ON public.qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_uid ON public.nfc_cards(card_uid);
CREATE INDEX IF NOT EXISTS idx_locations_business ON public.locations(business_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_business ON public.upgrade_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON public.upgrade_requests(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow clean re-execution
DROP POLICY IF EXISTS "businesses_owner_read" ON public.businesses;
DROP POLICY IF EXISTS "businesses_owner_insert" ON public.businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON public.businesses;
DROP POLICY IF EXISTS "businesses_public_slug_read" ON public.businesses;
DROP POLICY IF EXISTS "reviews_public_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_owner_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_owner_update" ON public.reviews;
DROP POLICY IF EXISTS "scans_public_insert" ON public.qr_scans;
DROP POLICY IF EXISTS "scans_owner_read" ON public.qr_scans;
DROP POLICY IF EXISTS "subscriptions_owner" ON public.subscriptions;
DROP POLICY IF EXISTS "locations_owner" ON public.locations;
DROP POLICY IF EXISTS "nfc_cards_owner" ON public.nfc_cards;
DROP POLICY IF EXISTS "upgrade_requests_insert" ON public.upgrade_requests;
DROP POLICY IF EXISTS "upgrade_requests_admin" ON public.upgrade_requests;

-- Admin check function (security definer — bypasses RLS)
-- Detects service_role key connections AND admin email from JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  -- Method 1: Check if using service_role key (server-side admin calls)
  -- Service role connections set the postgres role to 'service_role'
  IF current_setting('role', true) = 'service_role' THEN
    RETURN true;
  END IF;

  -- Method 2: Check JWT claims for service_role
  BEGIN
    jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
    IF jwt_role = 'service_role' THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- No JWT claims set, continue
  END;

  -- Method 3: Check JWT email against admin email
  BEGIN
    IF current_setting('request.jwt.claims', true)::json->>'email' = current_setting('app.admin_email', true) THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- No JWT claims set
  END;

  RETURN false;
END;
$$;

-- Businesses: owners see their own, admins see all
CREATE POLICY "businesses_owner_read" ON public.businesses
  FOR SELECT USING (auth.uid()::text = owner_id OR public.is_admin());

CREATE POLICY "businesses_owner_insert" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id OR public.is_admin());

CREATE POLICY "businesses_owner_update" ON public.businesses
  FOR UPDATE USING (auth.uid()::text = owner_id OR public.is_admin());

-- Reviews: business owner reads, anyone can insert (public review funnel)
CREATE POLICY "reviews_public_insert" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reviews_owner_read" ON public.reviews
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

CREATE POLICY "reviews_owner_update" ON public.reviews
  FOR UPDATE USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

-- QR Scans: anyone can insert (public scan logging), owner reads
CREATE POLICY "scans_public_insert" ON public.qr_scans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "scans_owner_read" ON public.qr_scans
  FOR SELECT USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

-- Subscriptions: owner only
CREATE POLICY "subscriptions_owner" ON public.subscriptions
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

-- Locations: owner only
CREATE POLICY "locations_owner" ON public.locations
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

-- Locations: public read (needed for resolving branch slugs on customer facing pages)
CREATE POLICY "locations_public_read" ON public.locations
  FOR SELECT USING (true);

-- NFC Cards: owner only
CREATE POLICY "nfc_cards_owner" ON public.nfc_cards
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

-- Upgrade Requests: merchants can insert, admins can manage all
CREATE POLICY "upgrade_requests_insert" ON public.upgrade_requests
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()::text)
    OR public.is_admin()
  );

CREATE POLICY "upgrade_requests_admin" ON public.upgrade_requests
  FOR ALL USING (public.is_admin());

-- ============================================================
-- MERCHANT FIELD RESTRICTION TRIGGER
-- Prevents merchants from self-modifying plan, trial_ended, is_active
-- Only admins / service_role can change these fields
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_merchant_field_restrictions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'Merchants cannot change their own plan. Contact admin.';
    END IF;
    IF NEW.trial_ended IS DISTINCT FROM OLD.trial_ended THEN
      RAISE EXCEPTION 'Merchants cannot modify trial status. Contact admin.';
    END IF;
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'Merchants cannot modify active status. Contact admin.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_merchant_updates ON public.businesses;
CREATE TRIGGER restrict_merchant_updates
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_merchant_field_restrictions();

-- ============================================================
-- TRIAL EXPIRY CRON FUNCTION
-- Automatically expires free-plan businesses after 30 days
-- Schedule with pg_cron: SELECT cron.schedule('check-trials', '0 0 * * *', 'SELECT public.check_expired_trials()');
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.businesses
  SET trial_ended = true,
      is_active = false
  WHERE plan = 'free'
    AND trial_ended = false
    AND trial_started_at < (now() - interval '30 days');
END;
$$;

-- ============================================================
-- PUBLIC SLUG LOOKUP (for customer-facing review pages)
-- Allows anonymous read of business by slug
-- ============================================================
CREATE POLICY "businesses_public_slug_read" ON public.businesses
  FOR SELECT USING (true);
