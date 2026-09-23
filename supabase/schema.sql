-- =============================================================================
-- JOSEPHDELIVERYCOMPANY — Database Schema
-- Safe to re-run: every object uses DROP IF EXISTS or CREATE ... IF NOT EXISTS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. updated_at trigger function (shared by all tables)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name   TEXT        NOT NULL DEFAULT '',
  last_name    TEXT        NOT NULL DEFAULT '',
  phone        TEXT,
  account_type TEXT        NOT NULL DEFAULT 'customer'
               CHECK (account_type IN ('customer', 'business', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Auto-create profile row when a user signs up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  ''),
    COALESCE(NEW.raw_user_meta_data->>'phone',       NULL),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. SHIPMENTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipments (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number    TEXT         NOT NULL,
  customer_id        UUID         REFERENCES public.profiles (id) ON DELETE SET NULL,
  customer_name      TEXT,
  status             TEXT         NOT NULL DEFAULT 'Booked',
  status_code        TEXT         NOT NULL DEFAULT 'BOOKED'
                     CHECK (status_code IN (
                       'BOOKED','COLLECTED','IN_TRANSIT','OUT_FOR_DELIVERY',
                       'DELIVERED','FAILED_DELIVERY','RETURNED','ON_HOLD'
                     )),
  current_location   TEXT         NOT NULL DEFAULT '',
  current_city       TEXT         NOT NULL DEFAULT '',
  origin             TEXT         NOT NULL DEFAULT '',
  destination        TEXT         NOT NULL DEFAULT '',
  origin_city        TEXT         NOT NULL DEFAULT '',
  destination_city   TEXT         NOT NULL DEFAULT '',
  origin_lat         NUMERIC(9,6),
  origin_lng         NUMERIC(9,6),
  destination_lat    NUMERIC(9,6),
  destination_lng    NUMERIC(9,6),
  current_position   NUMERIC(4,3) NOT NULL DEFAULT 0.0
                     CHECK (current_position >= 0 AND current_position <= 1),
  shipment_type      TEXT         NOT NULL DEFAULT '',
  service            TEXT         NOT NULL DEFAULT '',
  package_type       TEXT         NOT NULL DEFAULT '',
  shipment_date      TEXT,
  estimated_delivery TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS shipments_updated_at ON public.shipments;
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 5. TRACKING_EVENTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID        NOT NULL REFERENCES public.shipments (id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT '',
  description TEXT        NOT NULL DEFAULT '',
  location    TEXT        NOT NULL DEFAULT '',
  event_date  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. LOCATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  country       TEXT        NOT NULL,
  country_code  TEXT        NOT NULL,
  region        TEXT        NOT NULL,
  city          TEXT        NOT NULL,
  office_name   TEXT        NOT NULL DEFAULT '',
  office_type   TEXT        NOT NULL DEFAULT 'Regional Office',
  address       TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  opening_hours TEXT        NOT NULL DEFAULT '',
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  image_url     TEXT        NOT NULL DEFAULT '',
  image_alt     TEXT        NOT NULL DEFAULT '',
  description   TEXT        NOT NULL DEFAULT '',
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS locations_updated_at ON public.locations;
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Indexes (IF NOT EXISTS — already safe to re-run)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_tracking_number
  ON public.shipments (tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status_code
  ON public.shipments (status_code);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id
  ON public.shipments (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_created_at
  ON public.shipments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id
  ON public.tracking_events (shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_date
  ON public.tracking_events (shipment_id, event_date ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_locations_country
  ON public.locations (country);
CREATE INDEX IF NOT EXISTS idx_locations_region
  ON public.locations (region);
CREATE INDEX IF NOT EXISTS idx_locations_is_active
  ON public.locations (is_active);

-- ---------------------------------------------------------------------------
-- 8. Enable Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.shipments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations       ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 9. is_admin() helper function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 10. RLS Policies — DROP IF EXISTS before each CREATE so re-runs never fail
-- ---------------------------------------------------------------------------

-- SHIPMENTS
DROP POLICY IF EXISTS "Public can read shipments by tracking number" ON public.shipments;
CREATE POLICY "Public can read shipments by tracking number"
  ON public.shipments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers can read own shipments" ON public.shipments;
CREATE POLICY "Customers can read own shipments"
  ON public.shipments FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert shipments" ON public.shipments;
CREATE POLICY "Admins can insert shipments"
  ON public.shipments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update shipments" ON public.shipments;
CREATE POLICY "Admins can update shipments"
  ON public.shipments FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete shipments" ON public.shipments;
CREATE POLICY "Admins can delete shipments"
  ON public.shipments FOR DELETE TO authenticated
  USING (public.is_admin());

-- TRACKING_EVENTS
DROP POLICY IF EXISTS "Public can read tracking events" ON public.tracking_events;
CREATE POLICY "Public can read tracking events"
  ON public.tracking_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert tracking events" ON public.tracking_events;
CREATE POLICY "Admins can insert tracking events"
  ON public.tracking_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tracking events" ON public.tracking_events;
CREATE POLICY "Admins can update tracking events"
  ON public.tracking_events FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete tracking events" ON public.tracking_events;
CREATE POLICY "Admins can delete tracking events"
  ON public.tracking_events FOR DELETE TO authenticated
  USING (public.is_admin());

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LOCATIONS
DROP POLICY IF EXISTS "Public can read active locations" ON public.locations;
CREATE POLICY "Public can read active locations"
  ON public.locations FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert locations" ON public.locations;
CREATE POLICY "Admins can insert locations"
  ON public.locations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update locations" ON public.locations;
CREATE POLICY "Admins can update locations"
  ON public.locations FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete locations" ON public.locations;
CREATE POLICY "Admins can delete locations"
  ON public.locations FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- NEXT STEPS after running this schema:
--
-- 1. Verify tables:
--      SELECT table_name FROM information_schema.tables
--      WHERE table_schema = 'public';
--
-- 2. Create your first admin user:
--      a. Sign up via /signup
--      b. Run: UPDATE public.profiles
--              SET account_type = 'admin'
--              WHERE id = '<your-user-uuid>';
--
-- 3. Run supabase/seed.sql to insert the test shipment JDC-2026-00127
--
-- 4. Add Supabase credentials to .env.local (see .env.example)
-- =============================================================================
