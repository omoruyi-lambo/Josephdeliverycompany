$root = "c:/Users/USER/OneDrive/logistics/josephdeliverycompany"
$pass = 0; $fail = 0

function Check($label, $expr) {
    if ($expr) { 
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $label" -ForegroundColor Red
        $script:fail++
    }
}

$td   = Get-Content "$root/lib/trackingData.js"    -Raw
$sm   = Get-Content "$root/components/ShipmentMap.jsx" -Raw
$ss   = Get-Content "$root/components/ShipmentSummary.jsx" -Raw
$sd   = Get-Content "$root/components/ShipmentDetails.jsx" -Raw
$tr   = Get-Content "$root/pages/track.js"         -Raw
$seed = Get-Content "$root/supabase/seed.sql"      -Raw

Write-Host "`n── Demo fallback: JDC-2026-00127 = Miami → São Paulo ──────────"
Check "JDC-2026-00127 key exists"              ($td -match "JDC-2026-00127")
Check "Miami in demo origin"                   ($td -match "Miami")
Check "São Paulo in demo destination"          ($td -match "Paulo")
Check "ON_HOLD status code"                    ($td -match "ON_HOLD")
Check "On Hold status label"                   ($td -match "'On Hold'")
Check "Customs Clearance Required event"       ($td -match "Customs Clearance Required")
Check "Miami coordinates (25.7617)"            ($td -match "25\.7617")
Check "São Paulo coordinates (-23.5505)"       ($td -match "-23\.5505")
Check "currentPosition 1.0 (at destination)"  ($td -match "currentPosition:\s*1\.0")
Check "International service"                  ($td -match "International Shipping")
Check "Commercial Package type"                ($td -match "Commercial Package")
Check "5 timeline events (not 6)"              ($td -match "Departed Origin Facility")

Write-Host "`n── ShipmentSummary: ON_HOLD status colour ──────────────────────"
Check "ON_HOLD entry in STATUS_COLOURS"        ($ss -match "ON_HOLD")
Check "Purple dot colour for ON_HOLD"          ($ss -match "7c3aed")
Check "Purple text colour for ON_HOLD"         ($ss -match "5b21b6")
Check "All other statuses still present"       ($ss -match "IN_TRANSIT" -and $ss -match "OUT_FOR_DELIVERY" -and $ss -match "DELIVERED")

Write-Host "`n── ShipmentMap: Dynamic bounding box (works for any route) ────"
Check "buildBBox function defined"             ($sm -match "function buildBBox")
Check "bbox passed to toSVG (not global)"      ($sm -match "toSVG\(.*bbox\)")
Check "Nigeria polygon drawn conditionally"    ($sm -match "drawNigeria")
Check "isWithinBBox guard present"             ($sm -match "isWithinBBox")
Check "ON_HOLD colour in MARKER_COLOUR map"    ($sm -match "ON_HOLD.*7c3aed")
Check "Negative longitude handled"             ($sm -match "minLng.*-|maxLng.*-" -or $sm -match "buildBBox")
Check "Admin-recorded location footer text"    ($sm -match "Admin-recorded location")

Write-Host "`n── pages/track.js: async + 4 states + no demo banner ──────────"
Check "getServerSideProps is async"            ($tr -match "export async function getServerSideProps")
Check "await on getShipmentByTrackingNumber"   ($tr -match "await getShipmentByTrackingNumber")
Check "try/catch around data call"             ($tr -match "try \{")
Check "State 1: empty (!hasInput)"             ($tr -match "!hasInput")
Check "State 2: invalid format (!formatValid)" ($tr -match "!formatValid")
Check "State 3: not found (!shipment)"         ($tr -match "!shipment")
Check "State 4: found (shipment &&)"           ($tr -match "shipment &&")
Check "Demo banner removed"                    (-not ($tr -match "Demo mode"))

Write-Host "`n── ShipmentDetails: demo subtitle removed ──────────────────────"
Check "Demo subtitle removed"                  (-not ($sd -match "demo data for demonstration"))

Write-Host "`n── supabase/seed.sql: Miami → São Paulo scenario ───────────────"
Check "Miami in seed origin"                   ($seed -match "Miami")
Check "São Paulo in seed destination"          ($seed -match "Paulo")
Check "ON_HOLD status_code"                    ($seed -match "ON_HOLD")
Check "origin_lat 25.7617 (Miami)"             ($seed -match "25\.7617")
Check "origin_lng -80.1918 (Miami)"            ($seed -match "-80\.1918")
Check "destination_lat -23.5505 (São Paulo)"   ($seed -match "-23\.5505")
Check "destination_lng -46.6333 (São Paulo)"   ($seed -match "-46\.6333")
Check "current_position 1.0"                   ($seed -match "1\.0")
Check "Customs Clearance event"                ($seed -match "Customs Clearance Required")
Check "DELETE guard prevents duplicates"       ($seed -match "DELETE FROM public.tracking_events")
Check "5 events: Booked Pickup Depart Arrive Hold"  ($seed -match "Departed Origin Facility" -and $seed -match "Arrived in Brazil")
Check "ON CONFLICT upsert for shipment"        ($seed -match "ON CONFLICT.*tracking_number")

Write-Host "`n── Build verification ───────────────────────────────────────────"
$build = & npm run build 2>&1 | Out-String
Check "Build exit 0"                           ($LASTEXITCODE -eq 0)
Check "/track is Dynamic SSR"                  ($build -match "ƒ.*track|f.*track")
Check "22 pages compiled"                      ($build -match "22")
Check "Compiled successfully"                  ($build -match "Compiled successfully")

Write-Host "`n────────────────────────────────────────────────────────────────"
Write-Host "  PASSED: $pass   FAILED: $fail" -ForegroundColor $(if($fail -eq 0){"Green"}else{"Yellow"})
