-- =============================================================================
-- JOSEPHDELIVERYCOMPANY — Seed Data
-- =============================================================================
-- Run this in Supabase SQL Editor AFTER schema.sql has been applied.
--
-- Shipment: JDC-2026-00127
-- Route:    Miami, United States → São Paulo, Brazil
-- Status:   ON HOLD — customs clearance required
--
-- Safe to re-run: INSERT ... ON CONFLICT DO UPDATE replaces existing data.
--
-- Coordinates (WGS-84):
--   Miami, USA     : lat  25.7617, lng  -80.1918
--   São Paulo, BRA : lat -23.5505, lng  -46.6333
--
-- current_position = 1.0 (shipment has reached São Paulo, now on hold)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- STEP 1: Delete stale tracking events for this shipment before re-inserting.
--         This avoids duplicate events on repeated runs.
-- ---------------------------------------------------------------------------

DELETE FROM public.tracking_events
WHERE shipment_id = (
  SELECT id FROM public.shipments WHERE tracking_number = 'JDC-2026-00127'
);


-- ---------------------------------------------------------------------------
-- STEP 2: Upsert the shipment row.
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
  NULL,
  'Test Customer',
  'On Hold',                              -- status (human label shown in UI)
  'ON_HOLD',                              -- status_code (machine code for colour logic)
  'São Paulo, Brazil — Customs Hold',     -- current_location
  'TBD — Pending customs clearance',     -- estimated_delivery
  'International',                        -- shipment_type
  'International Shipping',               -- service
  'Miami, United States',                 -- origin
  'São Paulo, Brazil',                    -- destination
  'September 18, 2026',                   -- shipment_date
  'Commercial Package',                   -- package_type
  'Miami',                                -- origin_city
  'São Paulo',                            -- destination_city
  'São Paulo',                            -- current_city
   25.7617,                               -- origin_lat  (Miami)
  -80.1918,                               -- origin_lng  (Miami)
  -23.5505,                               -- destination_lat (São Paulo)
  -46.6333,                               -- destination_lng (São Paulo)
  1.0                                     -- current_position: at destination (held at São Paulo)
)
ON CONFLICT (tracking_number)
DO UPDATE SET
  customer_name       = EXCLUDED.customer_name,
  status              = EXCLUDED.status,
  status_code         = EXCLUDED.status_code,
  current_location    = EXCLUDED.current_location,
  estimated_delivery  = EXCLUDED.estimated_delivery,
  shipment_type       = EXCLUDED.shipment_type,
  service             = EXCLUDED.service,
  origin              = EXCLUDED.origin,
  destination         = EXCLUDED.destination,
  shipment_date       = EXCLUDED.shipment_date,
  package_type        = EXCLUDED.package_type,
  origin_city         = EXCLUDED.origin_city,
  destination_city    = EXCLUDED.destination_city,
  current_city        = EXCLUDED.current_city,
  origin_lat          = EXCLUDED.origin_lat,
  origin_lng          = EXCLUDED.origin_lng,
  destination_lat     = EXCLUDED.destination_lat,
  destination_lng     = EXCLUDED.destination_lng,
  current_position    = EXCLUDED.current_position,
  updated_at          = NOW();


-- ---------------------------------------------------------------------------
-- STEP 3: Insert tracking events using a CTE to capture the shipment id.
--         Events are ordered chronologically.
--         event_date = NULL means the step has not happened yet (upcoming).
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
  -- Event 1: Booked
  (
    'Shipment Booked',
    'Shipment information received and booking confirmed.',
    'Miami, United States',
    '2026-09-18 09:00:00-04'::TIMESTAMPTZ   -- UTC-4 (EDT)
  ),
  -- Event 2: Picked Up
  (
    'Package Picked Up',
    'Package collected from sender in Miami.',
    'Miami, United States',
    '2026-09-18 13:30:00-04'::TIMESTAMPTZ
  ),
  -- Event 3: Departed Origin
  (
    'Departed Origin Facility',
    'Shipment departed Miami International cargo facility.',
    'Miami, United States',
    '2026-09-19 02:15:00-04'::TIMESTAMPTZ
  ),
  -- Event 4: Arrived in Brazil
  (
    'Arrived in Brazil',
    'Shipment arrived at São Paulo — Guarulhos International cargo terminal.',
    'São Paulo, Brazil',
    '2026-09-20 14:45:00-03'::TIMESTAMPTZ   -- UTC-3 (BRT)
  ),
  -- Event 5: Customs Hold (CURRENT — last event with a date)
  (
    'Customs Clearance Required',
    'Shipment is currently on hold pending customs clearance. Our team is processing the required documentation. No action is needed from the recipient at this time.',
    'São Paulo, Brazil',
    '2026-09-20 17:30:00-03'::TIMESTAMPTZ
  )
) AS e(status, description, location, event_date);


-- ---------------------------------------------------------------------------
-- STEP 4: Verify — run these SELECTs to confirm the data is correct.
-- ---------------------------------------------------------------------------

-- Shipment row
SELECT
  tracking_number,
  status,
  status_code,
  current_location,
  current_city,
  current_position,
  origin,
  destination,
  service,
  package_type
FROM public.shipments
WHERE tracking_number = 'JDC-2026-00127';

-- Tracking events (should return 5 rows, all with non-null event_date)
SELECT
  te.status,
  te.location,
  te.event_date
FROM public.tracking_events te
JOIN public.shipments s ON te.shipment_id = s.id
WHERE s.tracking_number = 'JDC-2026-00127'
ORDER BY te.event_date ASC NULLS LAST;
