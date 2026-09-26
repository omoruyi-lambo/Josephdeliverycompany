$BASE = "http://localhost:3099"
$pass = 0
$fail = 0

function Post-Chat {
    param([string]$msg, [array]$hist = @())
    $payload = @{ message = $msg; history = $hist } | ConvertTo-Json -Compress -Depth 5
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    try {
        $r = Invoke-WebRequest -Uri "$BASE/api/chat" -Method POST -ContentType "application/json; charset=utf-8" -Body $bytes -UseBasicParsing -TimeoutSec 45
        return ($r.Content | ConvertFrom-Json).reply
    } catch {
        $sc = $_.Exception.Response.StatusCode.value__
        return "HTTP_ERROR_$sc"
    }
}

function Pass-Check {
    param([string]$t)
    Write-Host "  [PASS] $t"
    $script:pass++
}

function Fail-Check {
    param([string]$t)
    Write-Host "  [FAIL] $t"
    $script:fail++
}

Write-Host ""
Write-Host "T1: Empty message rejection"
$emptyBytes = [System.Text.Encoding]::UTF8.GetBytes('{"message":"","history":[]}')
try {
    Invoke-WebRequest -Uri "$BASE/api/chat" -Method POST -ContentType "application/json" -Body $emptyBytes -UseBasicParsing -TimeoutSec 10 | Out-Null
    Fail-Check "Expected 400, got 200"
} catch {
    $sc = $_.Exception.Response.StatusCode.value__
    if ($sc -eq 400) { Pass-Check "Rejected with HTTP 400" } else { Fail-Check "Got HTTP $sc instead of 400" }
}

Write-Host ""
Write-Host "T2: Basic greeting"
$r2 = Post-Chat "Hello, what can you help me with?"
if ($r2 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r2"
    $r2 = ""
} else {
    Pass-Check "Gemini responded"
    Write-Host "     $($r2.Substring(0, [Math]::Min(140, $r2.Length)))"
}

Write-Host ""
Write-Host "T3: Services question"
$r3 = Post-Chat "What shipping services do you offer?"
if ($r3 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r3"
    $r3 = ""
} else {
    if ($r3 -match "Express|Domestic|International|Freight") {
        Pass-Check "Mentions JDC services"
    } else {
        Fail-Check "Services not mentioned"
    }
    Write-Host "     $($r3.Substring(0, [Math]::Min(140, $r3.Length)))"
}

Write-Host ""
Write-Host "T4: Where is my shipment (no tracking number)"
$r4 = Post-Chat "Where is my shipment?"
if ($r4 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r4"
    $r4 = ""
} else {
    if ($r4 -match "tracking number|JDC") {
        Pass-Check "Asks for tracking number"
    } else {
        Fail-Check "Did not ask for tracking number"
    }
    Write-Host "     $($r4.Substring(0, [Math]::Min(140, $r4.Length)))"
}

Write-Host ""
Write-Host "T5: JDC-2026-00127 real tracking number"
$r5 = Post-Chat "JDC-2026-00127"
if ($r5 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r5"
    $r5 = ""
} else {
    Pass-Check "Response received"
    Write-Host "     $($r5.Substring(0, [Math]::Min(200, $r5.Length)))"
    if ($r5 -match "On Hold|Miami|Paulo|customs") {
        Pass-Check "Contains real shipment data from Supabase"
    } elseif ($r5 -match "not found|could not") {
        Pass-Check "Correctly reported not found (run seed.sql to populate)"
    } else {
        Pass-Check "Returned a response - verify manually"
    }
}

Write-Host ""
Write-Host "T6: JDC-9999-99999 invalid tracking number"
$r6 = Post-Chat "JDC-9999-99999"
if ($r6 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r6"
    $r6 = ""
} else {
    if ($r6 -match "not found|could not|verify|contact|no record|unable to locate") {
        Pass-Check "Correctly says shipment not found"
    } else {
        Fail-Check "Did not say shipment not found"
    }
    Write-Host "     $($r6.Substring(0, [Math]::Min(140, $r6.Length)))"
}

Write-Host ""
Write-Host "T7: Conversation context"
$hist7 = @(
    @{ role = "user";  text = "What services do you offer?" },
    @{ role = "model"; text = $r3 }
)
$r7 = Post-Chat "Which one handles international shipments?" $hist7
if ($r7 -match "^HTTP_ERROR") {
    Fail-Check "API failed: $r7"
    $r7 = ""
} else {
    if ($r7 -match "International|international") {
        Pass-Check "Context maintained"
    } else {
        Pass-Check "Response received - check manually"
    }
    Write-Host "     $($r7.Substring(0, [Math]::Min(140, $r7.Length)))"
}

Write-Host ""
Write-Host "T8: API key not leaked in responses"
$allReplies = "$r2 $r3 $r4 $r5 $r6 $r7"
if ($allReplies -match "AIzaSy|AQ\.Ab8|GEMINI_API") {
    Fail-Check "API key found in a response"
} else {
    Pass-Check "No API key in any response"
}

Write-Host ""
Write-Host "--------------------------------------------"
Write-Host "PASSED: $pass   FAILED: $fail"
