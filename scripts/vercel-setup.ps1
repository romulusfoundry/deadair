# One-time Vercel project setup for kickflip. Reads tokens from workspace .env
# and Supabase values from market-corr's env. Prints status only — never values.
$ErrorActionPreference = 'Stop'

function Get-EnvValue($path, $key) {
  $line = (Get-Content $path) | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { throw "missing $key in $path" }
  return ($line -replace "^$key=", '').Trim()
}

$ws = 'C:\Users\muckr\.openclaw\workspace'
$token = Get-EnvValue "$ws\.env" 'VERCEL_TOKEN'
$team = Get-EnvValue "$ws\.env" 'VERCEL_TEAM_ID'
$supaUrl = Get-EnvValue "$ws\market-corr\web\.env.local" 'NEXT_PUBLIC_SUPABASE_URL'
$supaKey = Get-EnvValue "$ws\market-corr\web\.env.local" 'SUPABASE_SERVICE_ROLE_KEY'

$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }

# 1. Create project linked to the GitHub repo
$projectBody = @{
  name = 'kickflip'
  framework = 'nextjs'
  rootDirectory = 'web'
  gitRepository = @{ type = 'github'; repo = 'romulusfoundry/kickflip' }
} | ConvertTo-Json -Depth 4

try {
  $project = Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v11/projects?teamId=$team" -Headers $headers -Body $projectBody
  Write-Output "project created: $($project.name) ($($project.id))"
} catch {
  $detail = $_.ErrorDetails.Message
  if ($detail -match 'already exists') {
    Write-Output 'project already exists - continuing'
    $project = Invoke-RestMethod -Method Get -Uri "https://api.vercel.com/v9/projects/kickflip?teamId=$team" -Headers $headers
  } else { throw "project create failed: $detail" }
}

# 2. Env vars (upsert)
$envBody = ConvertTo-Json @(
  @{ key = 'NEXT_PUBLIC_SUPABASE_URL'; value = $supaUrl; type = 'encrypted'; target = @('production','preview') },
  @{ key = 'SUPABASE_SERVICE_ROLE_KEY'; value = $supaKey; type = 'encrypted'; target = @('production','preview') }
) -Depth 4
Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v10/projects/kickflip/env?teamId=$team&upsert=true" -Headers $headers -Body $envBody | Out-Null
Write-Output 'env vars set: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'

# 3. Trigger a deployment from the linked repo
$repoId = $project.link.repoId
if (-not $repoId) { throw 'project has no linked repo - check GitHub integration access for romulusfoundry/kickflip' }
$deployBody = @{
  name = 'kickflip'
  project = 'kickflip'
  target = 'production'
  gitSource = @{ type = 'github'; repoId = $repoId; ref = 'master' }
} | ConvertTo-Json -Depth 4
$deploy = Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v13/deployments?teamId=$team" -Headers $headers -Body $deployBody
Write-Output "deployment started: https://$($deploy.url) (state: $($deploy.readyState))"
