-- SQL Patch to upgrade existing businesses table and reload Supabase PostgREST schema cache.
-- Run this in your Supabase Project SQL Editor (https://supabase.com -> SQL Editor -> New Query)

-- 1. Add missing columns safely if they do not exist
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trial_ended BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS nfc_enabled BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS payment_due_date TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS payment_amount INT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- 2. Drop and recreate check constraints to allow new options ('free', 'trial', 'agency', etc.)
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_plan_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_plan_check CHECK (plan IN ('free','trial','starter','growth','agency'));

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_category_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_category_check CHECK (category IN ('restaurant','retail','salon','clinic','hotel','other'));

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_payment_status_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_payment_status_check CHECK (payment_status IN ('paid','unpaid','due_soon'));

-- 3. Force reload of the Supabase API schema cache to make new columns visible instantly
NOTIFY pgrst, 'reload schema';
