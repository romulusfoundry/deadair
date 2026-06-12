# Direct-upload deployment to Vercel (no git link required). Idempotent:
# creates the project if missing, upserts env vars, deploys web/ inline.
$ErrorActionPreference = 'Stop'

function Get-EnvValue($path, $key) {
  $line = (Get-Content $path) | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { throw "missing $key in $path" }
  return ($line -replace "^$key=", '').Trim()
}

function Get-EnvValueOpt($path, $key) {
  if (-not (Test-Path $path)) { return $null }
  $line = (Get-Content $path) | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -replace "^$key=", '').Trim()
}

$ws = 'C:\Users\muckr\.openclaw\workspace'
$webDir = "$ws\deadair\web"
$token = Get-EnvValue "$ws\.env" 'VERCEL_TOKEN'
$team = Get-EnvValue "$ws\.env" 'VERCEL_TEAM_ID'
$supaUrl = Get-EnvValue "$ws\market-corr\web\.env.local" 'NEXT_PUBLIC_SUPABASE_URL'
$supaKey = Get-EnvValue "$ws\market-corr\web\.env.local" 'SUPABASE_SERVICE_ROLE_KEY'

$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

# 1. Ensure project exists (no git link)
try {
  $project = Invoke-RestMethod -Method Get -Uri "https://api.vercel.com/v9/projects/deadair?teamId=$team" -Headers $headers
  Write-Output "project exists: $($project.id)"
} catch {
  $body = @{ name = 'deadair'; framework = 'nextjs' } | ConvertTo-Json
  $project = Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v11/projects?teamId=$team" -Headers $headers -Body $body
  Write-Output "project created: $($project.id)"
}

# 2. Env vars (upsert). Stripe vars are optional — only pushed once present in
#    deadair/.env.local, so deploys work before Stripe is configured.
$envVars = @(
  @{ key = 'NEXT_PUBLIC_SUPABASE_URL'; value = $supaUrl; type = 'encrypted'; target = @('production','preview') },
  @{ key = 'SUPABASE_SERVICE_ROLE_KEY'; value = $supaKey; type = 'encrypted'; target = @('production','preview') }
)
$stripeEnv = "$ws\deadair\.env.local"
$payLink = Get-EnvValueOpt $stripeEnv 'NEXT_PUBLIC_STRIPE_PAYMENT_LINK'
$webhookSecret = Get-EnvValueOpt $stripeEnv 'STRIPE_WEBHOOK_SECRET'
if ($payLink) {
  $envVars += @{ key = 'NEXT_PUBLIC_STRIPE_PAYMENT_LINK'; value = $payLink; type = 'plain'; target = @('production','preview') }
  Write-Output 'stripe payment link found -> pushing'
}
if ($webhookSecret) {
  $envVars += @{ key = 'STRIPE_WEBHOOK_SECRET'; value = $webhookSecret; type = 'encrypted'; target = @('production','preview') }
  Write-Output 'stripe webhook secret found -> pushing'
}
$envBody = ConvertTo-Json $envVars -Depth 4
Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v10/projects/deadair/env?teamId=$team&upsert=true" -Headers $headers -Body $envBody | Out-Null
Write-Output 'env vars upserted'

# 3. Collect web/ files (skip node_modules, .next, env files)
$files = Get-ChildItem $webDir -Recurse -File | Where-Object {
  $_.FullName -notmatch '\\node_modules\\' -and
  $_.FullName -notmatch '\\.next\\' -and
  $_.Name -notlike '.env*'
}
$fileEntries = @()
foreach ($f in $files) {
  $rel = $f.FullName.Substring($webDir.Length + 1) -replace '\\', '/'
  $fileEntries += @{
    file = $rel
    data = [Convert]::ToBase64String([IO.File]::ReadAllBytes($f.FullName))
    encoding = 'base64'
  }
}
Write-Output "uploading $($fileEntries.Count) files"

# 4. Create deployment
$deployBody = @{
  name = 'deadair'
  project = 'deadair'
  target = 'production'
  files = $fileEntries
  projectSettings = @{ framework = 'nextjs' }
} | ConvertTo-Json -Depth 6
$deploy = Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v13/deployments?teamId=$team" -Headers $headers -Body $deployBody
Write-Output "deployment: https://$($deploy.url) (state: $($deploy.readyState), id: $($deploy.id))"
