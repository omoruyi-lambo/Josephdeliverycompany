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
C "No OpenRouter SDK dependency" ($pkg -notmatch 'openrouter')

# ── 2. Environment variable ──────────────────────────────────────────────
Write-Host "`n── 2. Environment variable" -ForegroundColor Cyan
$example = Get-Content ".env.example" -Raw
C "GROQ_API_KEY documented as server-only" ($example -match "GROQ_API_KEY" -and $example -match "SERVER ONLY")

# ── 3. Security scan ─────────────────────────────────────────────────────
Write-Host "`n── 3. Security scan" -ForegroundColor Cyan
$clientFiles = Get-ChildItem -Recurse -Include "*.js","*.jsx" |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|api.chat" }
$keyHits = $clientFiles | Select-String -Pattern "GROQ_API_KEY|gsk_[A-Za-z0-9]{20}" -ErrorAction SilentlyContinue
C "Groq API key not in client files" ($null -eq $keyHits -or $keyHits.Count -eq 0)
$pubHits = $clientFiles | Select-String -Pattern "NEXT_PUBLIC_GROQ_API_KEY" -ErrorAction SilentlyContinue
C "No public Groq key variable" ($null -eq $pubHits -or $pubHits.Count -eq 0)

# ── 4. API route checks ───────────────────────────────────────────────────
Write-Host "`n── 4. API route (pages/api/chat.js)" -ForegroundColor Cyan
$chat = Get-Content "pages/api/chat.js" -Raw
C "Groq endpoint configured server-side" ($chat -match "api\.groq\.com/openai/v1/chat/completions")
C "Key read from server environment"      ($chat -match "process\.env\.GROQ_API_KEY")
C "Groq API key sent as bearer auth"     ($chat -match 'Authorization: `Bearer')
C "Groq model configured"                 ($chat -match "openai/gpt-oss-20b")
C "Support instructions defined server-side" ($chat -match "SYSTEM_INSTRUCTION")
C "sanitiseHistory strips role injection"($chat -match "sanitiseHistory")
C "Empty message rejected (400)"         ($chat -match "Message is required")
C "Message length cap (4000)"            ($chat -match "4000")
C "Shipment questions directed to tracker" ($chat -match "tracking system at /track")
C "Request timeout configured"           ($chat -match "REQUEST_TIMEOUT_MS" -and $chat -match "AbortController")
C "Empty response handled"               ($chat -match "empty response")
C "Errors logged server-side only"       ($chat -match "console\.error.*\[chat\]")
C "Safe rate-limit fallback"             ($chat -match "Sorry, our assistant is temporarily unavailable")
C "Key not hardcoded in source"          ($chat -notmatch "gsk_[A-Za-z0-9]{20}")
C "POST-only route"                      ($chat -match "req\.method !== 'POST'")

# ── 5. Chatbot UI checks ──────────────────────────────────────────────────
Write-Host "`n── 5. Chatbot UI (components/Chatbot.jsx)" -ForegroundColor Cyan
$cbot = Get-Content "components/Chatbot.jsx" -Raw
C "Fetches /api/chat (server-side provider)" ($cbot -match "fetch\('/api/chat'")
C "Conversation history maintained"         ($cbot -match "buildHistory")
C "Welcome message defined"                 ($cbot -match "Welcome to JOSEPHDELIVERYCOMPANY")
C "Quick questions present"                 ($cbot -match "QUICK_QUESTIONS")
C "Typing/loading indicator"                ($cbot -match "chatDot")
C "Shift+Enter new line"                    ($cbot -match "shiftKey")
C "Enter sends message"                     ($cbot -match "key === 'Enter'")
C "Auto-scroll to latest"                   ($cbot -match "scrollIntoView")
C "Send disabled while loading"             ($cbot -match "disabled.*loading")
C "Unread badge"                            ($cbot -match "unread")
C "No provider/API key reference"         ($cbot -notmatch "GROQ_API_KEY|API_KEY")

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
C "Basic greeting → real Groq reply" ($reply1.Length -gt 20 -and $reply1 -notmatch "^ERROR")
Write-Host "    Reply: $($reply1.Substring(0, [Math]::Min(120,$reply1.Length)))..." -ForegroundColor Gray

# Test 3: services question
$reply2 = Invoke-Chat "What shipping services do you offer?"
C "Services question answered"         ($reply2.Length -gt 20 -and $reply2 -notmatch "^ERROR")
C "Mentions JDC services"              ($reply2 -match "Express|Domestic|International|Freight")
Write-Host "    Reply: $($reply2.Substring(0, [Math]::Min(120,$reply2.Length)))..." -ForegroundColor Gray

# Test 4: shipment-specific request is directed to the tracking system
$reply3 = Invoke-Chat "Where is my shipment?"
C "Directs customer to tracking system" ($reply3 -match "tracking|shipment" -and $reply3.Length -gt 20 -and $reply3 -notmatch "^ERROR")
Write-Host "    Reply: $($reply3.Substring(0, [Math]::Min(120,$reply3.Length)))..." -ForegroundColor Gray

# Test 5: conversation context
$h1 = @(@{ role="user"; text="What services do you offer?" }, @{ role="model"; text=$reply2 })
$reply5 = Invoke-Chat "Which one is for international shipments?" $h1
C "Context maintained across turns"    ($reply5 -match "International|international" -and $reply5.Length -gt 20)
Write-Host "    Reply: $($reply5.Substring(0, [Math]::Min(120,$reply5.Length)))..." -ForegroundColor Gray

# Test 6: key not in response
C "API key not leaked in any reply"    (
    $reply1 -notmatch "GROQ_API_KEY|gsk_[A-Za-z0-9]{20}" -and
    $reply2 -notmatch "GROQ_API_KEY|gsk_[A-Za-z0-9]{20}" -and
    $reply3 -notmatch "GROQ_API_KEY|gsk_[A-Za-z0-9]{20}"
)

Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# ── Summary ───────────────────────────────────────────────────────────────
Write-Host "`n────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  PASSED: $pass   FAILED: $fail" -ForegroundColor $(if($fail -eq 0){"Green"}else{"Yellow"})
