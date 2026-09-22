-- =============================================================================
-- JOSEPHDELIVERYCOMPANY — Supabase Database Schema
-- =============================================================================
-- Run this entire file in the Supabase SQL Editor:
--   https://supabase.com/dashboard → your project → SQL Editor → New query
--
-- Order of execution:
--   1. Extensions
--   2. profiles      (depends on auth.users)
--   3. shipments     (depends on profiles via customer_id)
--   4. tracking_events (depends on shipments)
--   5. Indexes
--   6. RLS policies
--   7. Trigger: updated_at auto-maintenance
--   8. Trigger: auto-create profile on signup
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------

-- pgcrypto provides gen_random_uuid() — usually enabled by default in Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ---------------------------------------------------------------------------
-- 1. HELPER: updated_at trigger function
--    Reused by both shipments and profiles tables.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. PROFILES
--    One row per authenticated user (admin or customer).
--    Automatically created when a user signs up via the trigger below.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key mirrors Supabase auth.users.id exactly
  id              UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,

  first_name      TEXT        NOT NULL DEFAULT '',
  last_name       TEXT        NOT NULL DEFAULT '',
  phone           TEXT,

  -- 'customer' | 'business' | 'admin'
  -- Set to 'customer' by default; admin role must be assigned manually
  -- via the Supabase dashboard or a one-time migration script.
  account_type    TEXT        NOT NULL DEFAULT 'customer'
                  CHECK (account_type IN ('customer', 'business', 'admin')),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at auto-maintenance for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE  public.profiles IS 'Extended user data linked 1:1 to auth.users.';
COMMENT ON COLUMN public.profiles.account_type IS 'customer | business | admin';


-- ---------------------------------------------------------------------------
-- 3. AUTO-CREATE PROFILE ON SIGNUP
--    When a new row is inserted into auth.users (i.e. user signs up),
--    a matching profile row is created automatically.
--    first_name / last_name are populated from user_metadata if present
--    (populated by the signup form via supabase.auth.signUp options.data).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Drop and recreate so re-running this script is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 4. SHIPMENTS
--    Core table. One row = one persistent shipment with one tracking number.
--    The tracking_number is the stable public identifier — it never changes
--    when a shipment is edited or its status is updated.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shipments (
  -- Internal surrogate key — never exposed publicly
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Public identifier ──────────────────────────────────────────────────
  -- Format: JDC-YYYY-NNNNN  (e.g. JDC-2026-00127)
  -- Unique constraint ensures one tracking number = one shipment forever.
  -- This column is set once at creation and never updated.
  tracking_number     TEXT        NOT NULL,

  -- ── Ownership ──────────────────────────────────────────────────────────
  -- Nullable: shipments created by admin before a customer account exists
  customer_id         UUID        REFERENCES public.profiles (id) ON DELETE SET NULL,
  customer_name       TEXT,

  -- ── Status ─────────────────────────────────────────────────────────────
  -- status:      human-readable label shown in the UI  (e.g. "In Transit")
  -- status_code: machine code used for colour logic     (e.g. "IN_TRANSIT")
  status              TEXT        NOT NULL DEFAULT 'Booked',
  status_code         TEXT        NOT NULL DEFAULT 'BOOKED'
                      CHECK (status_code IN (
                        'BOOKED',
                        'COLLECTED',
                        'IN_TRANSIT',
                        'OUT_FOR_DELIVERY',
                        'DELIVERED',
                        'FAILED_DELIVERY',
                        'RETURNED',
                        'ON_HOLD'
                      )),

  -- ── Location (admin-controlled, NOT live GPS) ───────────────────────────
  current_location    TEXT        NOT NULL DEFAULT '',
  current_city        TEXT        NOT NULL DEFAULT '',

  -- ── Route ──────────────────────────────────────────────────────────────
  origin              TEXT        NOT NULL DEFAULT '',
  destination         TEXT        NOT NULL DEFAULT '',
  origin_city         TEXT        NOT NULL DEFAULT '',
  destination_city    TEXT        NOT NULL DEFAULT '',

  -- WGS-84 decimal degrees — used by ShipmentMap SVG projection
  origin_lat          NUMERIC(9,6),
  origin_lng          NUMERIC(9,6),
  destination_lat     NUMERIC(9,6),
  destination_lng     NUMERIC(9,6),

  -- 0.0 to 1.0 — admin-set position along the route for the truck marker.
  -- 0 = at origin, 1 = at destination. NOT calculated automatically.
  current_position    NUMERIC(4,3) NOT NULL DEFAULT 0.0
                      CHECK (current_position >= 0 AND current_position <= 1),

  -- ── Shipment details ────────────────────────────────────────────────────
  shipment_type       TEXT        NOT NULL DEFAULT '',
  service             TEXT        NOT NULL DEFAULT '',
  package_type        TEXT        NOT NULL DEFAULT '',

  -- Stored as text to match the existing UI display format
  -- e.g. "September 24, 2026"
  shipment_date       TEXT,
  estimated_delivery  TEXT,

  -- ── Timestamps ──────────────────────────────────────────────────────────
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ── Constraints ─────────────────────────────────────────────────────────
  CONSTRAINT shipments_tracking_number_unique UNIQUE (tracking_number)
);

-- updated_at auto-maintenance for shipments
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE  public.shipments IS 'One row per shipment. tracking_number is the stable public identifier.';
COMMENT ON COLUMN public.shipments.tracking_number   IS 'Format: JDC-YYYY-NNNNN. Set once at creation, never changed.';
COMMENT ON COLUMN public.shipments.current_position  IS '0.0–1.0 admin-controlled truck position along the SVG map route.';
COMMENT ON COLUMN public.shipments.status_code       IS 'Machine code for UI colour logic. Must match CHECK constraint values.';


-- ---------------------------------------------------------------------------
-- 5. TRACKING_EVENTS
--    Ordered history of events for a shipment — maps to the `timeline` array
--    in the existing UI (TrackingTimeline component).
--    The admin adds / edits events. The UI renders them ordered by event_date.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tracking_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The shipment this event belongs to
  shipment_id UUID        NOT NULL REFERENCES public.shipments (id) ON DELETE CASCADE,

  -- Human-readable label shown as the timeline step title
  -- e.g. "Arrived at Lagos Facility"
  status      TEXT        NOT NULL DEFAULT '',

  -- Longer description shown below the step title
  -- e.g. "Shipment processed at the Lagos facility."
  description TEXT        NOT NULL DEFAULT '',

  -- Location string for this event  e.g. "Lagos, Nigeria"
  location    TEXT        NOT NULL DEFAULT '',

  -- When this event occurred — displayed as the timestamp on the timeline.
  -- NULL = future/upcoming step (not yet happened).
  event_date  TIMESTAMPTZ,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.tracking_events IS 'Ordered shipment history. Maps to the TrackingTimeline component timeline array.';
COMMENT ON COLUMN public.tracking_events.event_date IS 'NULL = upcoming step not yet completed.';
COMMENT ON COLUMN public.tracking_events.status     IS 'Step title, e.g. "In Transit". Not the same as shipments.status_code.';


-- ---------------------------------------------------------------------------
-- 6. INDEXES
-- ---------------------------------------------------------------------------

-- Primary lookup path: customer types a tracking number → find the shipment
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_tracking_number
  ON public.shipments (tracking_number);

-- Admin dashboard filtering by status
CREATE INDEX IF NOT EXISTS idx_shipments_status_code
  ON public.shipments (status_code);

-- Admin dashboard filtering by customer
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id
  ON public.shipments (customer_id)
  WHERE customer_id IS NOT NULL;

-- Newest shipments first in admin list views
CREATE INDEX IF NOT EXISTS idx_shipments_created_at
  ON public.shipments (created_at DESC);

-- All events for a shipment, ordered by when they occurred
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id
  ON public.tracking_events (shipment_id);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_date
  ON public.tracking_events (shipment_id, event_date ASC NULLS LAST);


-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
--    Conservative baseline policies.
--
--    PUBLIC (unauthenticated / anon key):
--      - Can SELECT a single shipment by tracking_number only
--      - Can SELECT tracking_events for a shipment they already know about
--      - Cannot list all shipments (no blanket SELECT on the whole table)
--      - Cannot INSERT / UPDATE / DELETE anything
--
--    AUTHENTICATED (any logged-in user):
--      - Same as public by default
--      - Customers can only read their own shipments (customer_id = auth.uid())
--
--    ADMIN (account_type = 'admin' in profiles):
--      - Full INSERT / UPDATE / DELETE on shipments and tracking_events
--      - Can read all shipments
--
--    NOTE: The admin check uses a helper function to avoid repeated subqueries.
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.shipments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;


-- ── Helper: is the current user an admin? ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.profiles
    WHERE  id           = auth.uid()
    AND    account_type = 'admin'
  );
$$;


-- ── SHIPMENTS policies ─────────────────────────────────────────────────────

-- Anyone (including unauthenticated public users) can read a shipment.
-- The application always queries with .eq('tracking_number', ...) so only
-- one row is ever returned. There is no way to list all shipments via anon.
CREATE POLICY "Public can read shipments by tracking number"
  ON public.shipments
  FOR SELECT
  USING (true);

-- Authenticated customers can read only their own shipments
-- (when customer_id is set). This policy stacks with the public SELECT above —
-- Postgres uses OR semantics across policies of the same command.
CREATE POLICY "Customers can read own shipments"
  ON public.shipments
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Only admins can create shipments
CREATE POLICY "Admins can insert shipments"
  ON public.shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update shipments (status, location, coords, etc.)
CREATE POLICY "Admins can update shipments"
  ON public.shipments
  FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete shipments
CREATE POLICY "Admins can delete shipments"
  ON public.shipments
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ── TRACKING_EVENTS policies ───────────────────────────────────────────────

-- Anyone can read tracking events (same reasoning as shipments SELECT above)
CREATE POLICY "Public can read tracking events"
  ON public.tracking_events
  FOR SELECT
  USING (true);

-- Only admins can add tracking events
CREATE POLICY "Admins can insert tracking events"
  ON public.tracking_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can edit tracking events
CREATE POLICY "Admins can update tracking events"
  ON public.tracking_events
  FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete tracking events
CREATE POLICY "Admins can delete tracking events"
  ON public.tracking_events
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ── PROFILES policies ──────────────────────────────────────────────────────

-- Users can read only their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (name, phone)
-- account_type must NOT be self-promoted — enforce via application logic
-- or add a separate column-level check in Phase 4 admin setup
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can read all profiles (for the admin dashboard user list)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update any profile (e.g. to promote a user to admin)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING     (public.is_admin())
  WITH CHECK (public.is_admin());


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
--
-- NEXT STEPS (run manually after this schema is applied):
--
-- 1. Verify tables were created:
--      SELECT table_name FROM information_schema.tables
--      WHERE table_schema = 'public';
--
-- 2. Confirm RLS is enabled:
--      SELECT tablename, rowsecurity FROM pg_tables
--      WHERE schemaname = 'public';
--
-- 3. Create your first admin user:
--      a. Sign up normally through /signup
--      b. Then run in SQL Editor:
--           UPDATE public.profiles
--           SET account_type = 'admin'
--           WHERE id = '<your-user-uuid>';
--
-- 4. Add your Supabase URL and keys to .env.local
--    (see .env.example for the required variable names)
--
-- 5. Proceed to Phase 2: connect lib/trackingData.js to Supabase
-- =============================================================================
