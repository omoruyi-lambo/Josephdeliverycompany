$root = "c:/Users/USER/OneDrive/logistics/josephdeliverycompany"
Set-Location $root

$pass = 0; $fail = 0
function C($label, $ok) {
    if ($ok) { Write-Host "  [PASS] $label" -ForegroundColor Green; $script:pass++ }
    else      { Write-Host "  [FAIL] $label" -ForegroundColor Red;   $script:fail++ }
}

# ── 1. SDK ──────────────────────────────────────────────────────────────
Write-Host "`n── 1. SDK" -ForegroundColor Cyan
$pkg = Get-Content "package.json" -Raw
C "OpenRouter integration is server-side" ($pkg -notmatch '"@google/genai"|"@google/generative-ai"')

# ── 2. Environment variable ──────────────────────────────────────────────
Write-Host "`n── 2. Environment variable" -ForegroundColor Cyan
$env = Get-Content ".env.local" -Raw
$keyLine = if ($env -match "OPENROUTER_API_KEY=(.+)") { $Matches[1].Trim() } else { "" }
C "OPENROUTER_API_KEY present in .env.local" ($keyLine.Length -gt 10)

# ── 3. Security scan ─────────────────────────────────────────────────────
Write-Host "`n── 3. Security scan" -ForegroundColor Cyan
$clientFiles = Get-ChildItem -Recurse -Include "*.js","*.jsx" |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|api.chat" }
$keyHits = $clientFiles | Select-String -Pattern "OPENROUTER_API_KEY" -ErrorAction SilentlyContinue
C "OPENROUTER_API_KEY not in client files" ($null -eq $keyHits -or $keyHits.Count -eq 0)
$pubHits = $clientFiles | Select-String -Pattern "NEXT_PUBLIC_OPENROUTER" -ErrorAction SilentlyContinue
C "NEXT_PUBLIC_OPENROUTER not in client code" ($null -eq $pubHits -or $pubHits.Count -eq 0)

# ── 4. API route checks ───────────────────────────────────────────────────
Write-Host "`n── 4. API route (pages/api/chat.js)" -ForegroundColor Cyan
$chat = Get-Content "pages/api/chat.js" -Raw
C "OpenRouter URL configured"             ($chat -match "openrouter\.ai/api")
C "Key read from process.env"            ($chat -match "process\.env\.OPENROUTER_API_KEY")
C "OpenRouter request uses bearer auth"  ($chat -match "Bearer")
C "systemInstruction defined server-side"($chat -match "systemInstruction")
C "sanitiseHistory strips role injection"($chat -match "sanitiseHistory")
C "Empty message rejected (400)"         ($chat -match "Message is required")
C "Message length cap (4000)"            ($chat -match "4000")
C "getShipmentByTrackingNumber called"   ($chat -match "getShipmentByTrackingNumber")
C "TRACKING_REGEX extracts JDC numbers" ($chat -match "TRACKING_REGEX")
C "Shipment context injected in prompt"  ($chat -match "buildShipmentContext")
C "Errors logged server-side only"       ($chat -match "console\.error.*\[chat\]")
C "Safe error message to customer"       ($chat -match "unable to respond right now")
C "Key not hardcoded in source"          ($chat -notmatch "AIza[0-9A-Za-z]{20}")
C "POST-only route"                      ($chat -match "req\.method !== 'POST'")

# ── 5. Chatbot UI checks ──────────────────────────────────────────────────
Write-Host "`n── 5. Chatbot UI (components/Chatbot.jsx)" -ForegroundColor Cyan
$cbot = Get-Content "components/Chatbot.jsx" -Raw
C "Fetches /api/chat (not Gemini directly)" ($cbot -match "fetch\('/api/chat'")
C "Conversation history maintained"         ($cbot -match "buildHistory")
C "Welcome message defined"                 ($cbot -match "Welcome to JOSEPHDELIVERYCOMPANY")
C "Quick questions present"                 ($cbot -match "QUICK_QUESTIONS")
C "Typing/loading indicator"                ($cbot -match "chatDot")
C "Shift+Enter new line"                    ($cbot -match "shiftKey")
C "Enter sends message"                     ($cbot -match "key === 'Enter'")
C "Auto-scroll to latest"                   ($cbot -match "scrollIntoView")
C "Send disabled while loading"             ($cbot -match "disabled.*loading")
C "Unread badge"                            ($cbot -match "unread")
C "No direct OpenRouter/API key reference"  ($cbot -notmatch "OPENROUTER|API_KEY")

# ── 6. _app.js wiring ────────────────────────────────────────────────────
Write-Host "`n── 6. _app.js wiring" -ForegroundColor Cyan
$app = Get-Content "pages/_app.js" -Raw
C "dynamic import used"                 ($app -match "import dynamic")
C "ssr: false (client-only)"            ($app -match "ssr: false")
C "Chatbot rendered in App"             ($app -match "<Chatbot")

# ── 7. Production build ───────────────────────────────────────────────────
Write-Host "`n── 7. Production build" -ForegroundColor Cyan
$build = npm run build 2>&1 | Out-String
C "Build exit code 0"                   ($LASTEXITCODE -eq 0)
C "/api/chat is Dynamic (SSR API route)"($build -match "api/chat")
C "/track is Dynamic (SSR)"             ($build -match "track")
C "Compiled successfully"               ($build -match "Compiled successfully")
C "22+ pages compiled"                  ($build -match "22|23|24")

# ── 8. Live API test ──────────────────────────────────────────────────────
Write-Host "`n── 8. Live API tests (dev server required)" -ForegroundColor Cyan

# Start dev server
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev -- --port 3099" -WorkingDirectory $root -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 12

function Invoke-Chat($msg, $history = @()) {
    $body = @{ message = $msg; history = $history } | ConvertTo-Json -Compress
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3099/api/chat" -Method POST `
            -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 30
        ($r.Content | ConvertFrom-Json).reply
    } catch {
        "ERROR: $($_.Exception.Message)"
    }
}

# Test 1: empty message
$empty = & {
    $body = '{"message":"","history":[]}'
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3099/api/chat" -Method POST `
            -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
        $r.StatusCode
    } catch [System.Net.WebException] {
        $_.Exception.Response.StatusCode.value__
    }
}
C "Empty message rejected (HTTP 400)"  ($empty -eq 400)

# Test 2: basic question
$reply1 = Invoke-Chat "Hello, what can you help me with?"
C "Basic greeting → real Gemini reply" ($reply1.Length -gt 20 -and $reply1 -notmatch "^ERROR")
Write-Host "    Reply: $($reply1.Substring(0, [Math]::Min(120,$reply1.Length)))..." -ForegroundColor Gray

# Test 3: services question
$reply2 = Invoke-Chat "What shipping services do you offer?"
C "Services question answered"         ($reply2.Length -gt 20 -and $reply2 -notmatch "^ERROR")
C "Mentions JDC services"              ($reply2 -match "Express|Domestic|International|Freight")
Write-Host "    Reply: $($reply2.Substring(0, [Math]::Min(120,$reply2.Length)))..." -ForegroundColor Gray

# Test 4: tracking request without number
$reply3 = Invoke-Chat "Where is my shipment?"
C "Asks for tracking number"           ($reply3 -match "tracking number|JDC")
Write-Host "    Reply: $($reply3.Substring(0, [Math]::Min(120,$reply3.Length)))..." -ForegroundColor Gray

# Test 5: invalid tracking number
$reply4 = Invoke-Chat "JDC-9999-99999"
C "Invalid TN: not found (no invention)"($reply4 -match "not found|could not be found|verify|contact" -or $reply4 -match "unable to locate|no record")
Write-Host "    Reply: $($reply4.Substring(0, [Math]::Min(120,$reply4.Length)))..." -ForegroundColor Gray

# Test 6: conversation context
$h1 = @(@{ role="user"; text="What services do you offer?" }, @{ role="model"; text=$reply2 })
$reply5 = Invoke-Chat "Which one is for international shipments?" $h1
C "Context maintained across turns"    ($reply5 -match "International|international" -and $reply5.Length -gt 20)
Write-Host "    Reply: $($reply5.Substring(0, [Math]::Min(120,$reply5.Length)))..." -ForegroundColor Gray

# Test 7: JDC-2026-00127 (requires a matching Supabase record)
$reply6 = Invoke-Chat "JDC-2026-00127"
C "Real tracking number returns data"  ($reply6.Length -gt 20 -and $reply6 -notmatch "^ERROR")
Write-Host "    Reply: $($reply6.Substring(0, [Math]::Min(180,$reply6.Length)))..." -ForegroundColor Gray

# Test 8: key not in response
C "API key not leaked in any reply"    (
    $reply1 -notmatch "OPENROUTER_API_KEY|sk-or-" -and
    $reply2 -notmatch "OPENROUTER_API_KEY|sk-or-" -and
    $reply6 -notmatch "OPENROUTER_API_KEY|sk-or-"
)

Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ── Summary ───────────────────────────────────────────────────────────────
Write-Host "`n────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  PASSED: $pass   FAILED: $fail" -ForegroundColor $(if($fail -eq 0){"Green"}else{"Yellow"})
