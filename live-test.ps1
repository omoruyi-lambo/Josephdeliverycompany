$base = if ($env:CHATBOT_TEST_URL) { $env:CHATBOT_TEST_URL.TrimEnd('/') } else { 'http://localhost:3000' }
$fallback = 'Sorry, our assistant is temporarily unavailable. Please try again later or contact our support team.'
$pass = 0
$fail = 0

function Check([string]$label, [bool]$ok) {
    if ($ok) { Write-Host "[PASS] $label" -ForegroundColor Green; $script:pass++ }
    else { Write-Host "[FAIL] $label" -ForegroundColor Red; $script:fail++ }
}

function Post-Chat([string]$message) {
    $payload = @{ message = $message; history = @() } | ConvertTo-Json -Compress
    try {
        $response = Invoke-WebRequest -Uri "$base/api/chat" -Method POST -ContentType 'application/json' -Body $payload -UseBasicParsing -TimeoutSec 25
        return @{ status = [int]$response.StatusCode; data = ($response.Content | ConvertFrom-Json) }
    } catch {
        $status = 0
        $body = $null
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try { $body = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
        }
        return @{ status = $status; data = $body }
    }
}

$empty = Post-Chat ''
Check 'Empty message rejected with HTTP 400' ($empty.status -eq 400)

$basic = Post-Chat 'What can you help me with?'
$basicReply = [string]$basic.data.reply
Check 'Groq chat completion returned a non-empty reply' ($basic.status -eq 200 -and -not [string]::IsNullOrWhiteSpace($basicReply))
if ($basic.status -ne 200 -and $basic.data.error -eq $fallback) {
    Write-Host "Groq unavailable; safe fallback confirmed (HTTP $($basic.status))." -ForegroundColor Yellow
}

$tracking = Post-Chat 'Where is my shipment right now?'
$trackingReply = [string]$tracking.data.reply
Check 'Shipment question directs customers to tracking' ($tracking.status -eq 200 -and $trackingReply -match 'track|tracking' -and $trackingReply -match 'number')

$allReplies = "$basicReply $trackingReply"
Check 'No Groq key variable or key-shaped value in replies' ($allReplies -notmatch 'GROQ_API_KEY|gsk_[A-Za-z0-9]{20}')

Write-Host "Passed: $pass; Failed: $fail"
if ($fail -gt 0) { exit 1 }
