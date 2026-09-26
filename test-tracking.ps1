$base = "http://localhost:3000"

function Test-Page {
    param($label, $url, [hashtable]$checks)
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
        Write-Host "`n=== $label ===" -ForegroundColor Cyan
        Write-Host "HTTP: $($r.StatusCode)"
        foreach ($key in $checks.Keys) {
            $found = $r.Content -match [regex]::Escape($checks[$key])
            $status = if ($found) { "PASS" } else { "FAIL" }
            $color  = if ($found) { "Green" } else { "Red" }
            Write-Host "  [$status] $key" -ForegroundColor $color
        }
    } catch {
        Write-Host "`n=== $label === ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# A — /track empty state
Test-Page "A: /track (no input)" "$base/track" @{
    "Empty state renders"       = "Enter a tracking number"
}

# B/C — JDC-2026-00127 (demo fallback — no Supabase creds in env)
Test-Page "B/C: /track?tracking=JDC-2026-00127" "$base/track?tracking=JDC-2026-00127" @{
    "Tracking number visible"   = "JDC-2026-00127"
    "Origin Miami"              = "Miami"
    "Destination Sao Paulo"     = "Paulo"
    "ON HOLD status"            = "On Hold"
    "Current location Sao Paulo"= "Sao Paulo"
    "Customs event visible"     = "Customs"
    "Timeline: Shipment Booked" = "Shipment Booked"
    "Timeline: Package Picked"  = "Package Picked Up"
    "Timeline: Departed Origin" = "Departed Origin Facility"
    "Timeline: Arrived Brazil"  = "Arrived in Brazil"
    "Map section header"        = "Shipment Route"
    "Map origin label"          = "ORIGIN"
    "Map destination label"     = "DESTINATION"
    "No demo banner"            = "Demo mode"
}

# H — Invalid format
Test-Page "H: Invalid tracking number" "$base/track?tracking=BADCODE123" @{
    "Invalid format message"    = "not a recognised format"
}

# I — Valid format, does not exist
Test-Page "I: Valid format, not found" "$base/track?tracking=JDC-2026-99999" @{
    "Not found message"         = "Tracking information not found"
    "Back to homepage link"     = "Back to homepage"
}

# Homepage
Test-Page "Homepage (TrackingForm present)" "$base/" @{
    "Track form input"          = "tracking number"
    "Track button"              = "TRACK"
}

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
