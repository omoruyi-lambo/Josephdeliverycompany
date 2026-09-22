-- =============================================================================
-- JOSEPHDELIVERYCOMPANY — Seed Data (Test Shipment)
-- =============================================================================
-- Run this in Supabase SQL Editor AFTER schema.sql has been applied.
--
-- This inserts ONE real test shipment (JDC-2026-00127) plus its tracking
-- events so the /track page can be tested with live Supabase data.
--
-- Safe to re-run: uses INSERT ... ON CONFLICT DO UPDATE so existing rows
-- are updated rather than duplicated.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. INSERT TEST SHIPMENT
-- ---------------------------------------------------------------------------

INSERT INTO public.shipments (
  tracking_number,
  customer_id,
  customer_name,
  status,
  status_code,
  current_location,
  estimated_delivery,
  shipment_type,
  service,
  origin,
  destination,
  shipment_date,
  package_type,
  origin_city,
  destination_city,
  current_city,
  origin_lat,
  origin_lng,
  destination_lat,
  destination_lng,
  current_position
)
VALUES (
  'JDC-2026-00127',
  NULL,                                          -- no customer account yet
  'Test Customer',
  'In Transit',
  'IN_TRANSIT',
  'En route — between Lagos and Benin City',
  'September 24, 2026',
  'Express Delivery',
  'Express Delivery',
  'Lagos, Nigeria',
  'Benin City, Nigeria',
  'September 20, 2026',
  'Parcel',
  'Lagos',
  'Benin City',
  'En route',
  6.5244,                                        -- Lagos lat
  3.3792,                                        -- Lagos lng
  6.3350,                                        -- Benin City lat
  5.6037,                                        -- Benin City lng
  0.55                                           -- 55% along the route
)
ON CONFLICT (tracking_number)
DO UPDATE SET
  status            = EXCLUDED.status,
  status_code       = EXCLUDED.status_code,
  current_location  = EXCLUDED.current_location,
  current_city      = EXCLUDED.current_city,
  current_position  = EXCLUDED.current_position,
  updated_at        = NOW();


-- ---------------------------------------------------------------------------
-- 2. CAPTURE THE SHIPMENT ID FOR SUBSEQUENT EVENT INSERTS
--    Supabase SQL Editor: run this block to get the id, then use it below.
--    Or just run the whole file — the CTE handles it automatically.
-- ---------------------------------------------------------------------------

WITH shipment AS (
  SELECT id FROM public.shipments WHERE tracking_number = 'JDC-2026-00127'
)

INSERT INTO public.tracking_events (
  shipment_id,
  status,
  description,
  location,
  event_date
)
SELECT
  shipment.id,
  e.status,
  e.description,
  e.location,
  e.event_date
FROM shipment,
(VALUES
  (
    'Shipment Booked',
    'Shipment information received and booking confirmed.',
    'Lagos, Nigeria',
    '2026-09-20 08:14:00+01'::TIMESTAMPTZ
  ),
  (
    'Package Picked Up',
    'Package collected from sender at Lagos Island.',
    'Lagos Island, Lagos',
    '2026-09-20 11:32:00+01'::TIMESTAMPTZ
  ),
  (
    'Arrived at Lagos Facility',
    'Shipment processed and dispatched from the Lagos hub.',
    'Apapa Hub, Lagos',
    '2026-09-20 15:47:00+01'::TIMESTAMPTZ
  ),
  (
    'In Transit',
    'Shipment is currently moving towards Benin City.',
    'En route — Lagos to Benin City',
    '2026-09-21 07:05:00+01'::TIMESTAMPTZ
  ),
  (
    'Out for Delivery',
    'Shipment will be delivered to the recipient today.',
    'Benin City, Nigeria',
    NULL                         -- upcoming: not yet happened
  ),
  (
    'Delivered',
    'Shipment successfully delivered to the recipient.',
    'Benin City, Nigeria',
    NULL                         -- upcoming: not yet happened
  )
) AS e(status, description, location, event_date)
ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------------
-- 3. VERIFY
-- ---------------------------------------------------------------------------

-- Check the shipment was inserted:
SELECT
  tracking_number, status, status_code,
  current_location, current_city, current_position
FROM public.shipments
WHERE tracking_number = 'JDC-2026-00127';

-- Check the events were inserted (should return 6 rows):
SELECT
  te.status, te.description, te.event_date
FROM public.tracking_events te
JOIN public.shipments s ON te.shipment_id = s.id
WHERE s.tracking_number = 'JDC-2026-00127'
ORDER BY te.event_date ASC NULLS LAST;
