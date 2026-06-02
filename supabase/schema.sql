-- Database Schema for ReviewBoost

-- NOTE: If you want to cleanly reset all tables and start fresh, uncomment the lines below:
-- DROP TABLE IF EXISTS nfc_cards CASCADE;
-- DROP TABLE IF EXISTS locations CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS qr_scans CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS businesses CASCADE;

-- BUSINESSES
CREATE TABLE IF NOT EXISTS businesses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            TEXT, -- stores Firebase UID
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL, -- e.g. "chai-point-jaipur-a3f2"
  google_place_id     TEXT NOT NULL,
  google_review_url   TEXT NOT NULL, -- https://search.google.com/local/writereview?placeid={place_id}
  logo_url            TEXT,
  brand_color         TEXT DEFAULT '#000000',
  tagline             TEXT DEFAULT 'How was your experience today?',
  category            TEXT CHECK (category IN ('restaurant','retail','salon','clinic','hotel','other')),
  language            TEXT DEFAULT 'en' CHECK (language IN ('en','hi','mr','ta','te','kn')),
  plan                TEXT DEFAULT 'trial' CHECK (plan IN ('free','trial','starter','growth','agency')),
  trial_started_at    TIMESTAMPTZ DEFAULT now(),
  trial_ended         BOOLEAN DEFAULT false,
  whatsapp_number     TEXT,
  notification_email  TEXT,
  nfc_enabled         BOOLEAN DEFAULT false,
  api_key             TEXT UNIQUE, -- Bearer token for developer JSON API
  payment_due_date    TEXT,
  payment_amount      INT,
  payment_status      TEXT CHECK (payment_status IN ('paid','unpaid','due_soon')),
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stars                 INT CHECK (stars BETWEEN 1 AND 5),
  is_public             BOOLEAN DEFAULT false, -- true = 4-5 star, redirected to Google
  private_feedback      TEXT, -- only populated for 1-3 stars
  customer_name         TEXT,
  customer_phone        TEXT,
  ai_suggestion_used    TEXT, -- which suggestion chip they clicked
  custom_text           TEXT, -- what they actually typed/edited
  language_used         TEXT,
  is_resolved           BOOLEAN DEFAULT false, -- for private feedback
  owner_note            TEXT, -- internal note added by owner
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- QR SCANS (analytics)
CREATE TABLE IF NOT EXISTS qr_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  scanned_at      TIMESTAMPTZ DEFAULT now(),
  user_agent      TEXT,
  referrer        TEXT,
  scan_source     TEXT CHECK (scan_source IN ('qr','nfc','link','whatsapp'))
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id                 UUID REFERENCES businesses(id) ON DELETE CASCADE,
  plan                        TEXT,
  razorpay_subscription_id    TEXT,
  razorpay_customer_id        TEXT,
  status                      TEXT CHECK (status IN ('active','paused','cancelled','expired')),
  current_period_start        TIMESTAMPTZ,
  current_period_end          TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT now()
);

-- LOCATIONS (for Growth+ plans — multi-location)
CREATE TABLE IF NOT EXISTS locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name            TEXT NOT NULL, -- e.g. "Branch - Malviya Nagar"
  google_place_id TEXT NOT NULL,
  google_review_url TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- NFC CARDS
CREATE TABLE IF NOT EXISTS nfc_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES locations(id),
  card_uid        TEXT UNIQUE, -- physical NFC chip UID
  label           TEXT, -- e.g. "Front counter card"
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-running the script safely
DROP POLICY IF EXISTS "owner_access" ON businesses;
DROP POLICY IF EXISTS "owner_access" ON reviews;
DROP POLICY IF EXISTS "owner_access" ON qr_scans;
DROP POLICY IF EXISTS "owner_access" ON subscriptions;
DROP POLICY IF EXISTS "owner_access" ON locations;
DROP POLICY IF EXISTS "owner_access" ON nfc_cards;
DROP POLICY IF EXISTS "public_read_active_businesses" ON businesses;
DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "public_insert_qr_scans" ON qr_scans;

-- RLS POLICIES (owners only see their own data)
CREATE POLICY "owner_access" ON businesses FOR ALL USING (owner_id = auth.uid()::text);
CREATE POLICY "owner_access" ON reviews FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()::text)
);
CREATE POLICY "owner_access" ON qr_scans FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()::text)
);
CREATE POLICY "owner_access" ON subscriptions FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()::text)
);
CREATE POLICY "owner_access" ON locations FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()::text)
);
CREATE POLICY "owner_access" ON nfc_cards FOR ALL USING (
  business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()::text)
);

-- Public policies (needed for customers scanning the QR code)
-- Customers need to read business details, insert reviews, insert scans.
CREATE POLICY "public_read_active_businesses" ON businesses
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE is_active = true)
  );

CREATE POLICY "public_insert_qr_scans" ON qr_scans
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE is_active = true)
  );

-- Force reload of the Supabase API schema cache to make new columns visible instantly
NOTIFY pgrst, 'reload schema';
