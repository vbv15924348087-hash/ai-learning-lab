param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 4174,
    [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
$projectDir = $PSScriptRoot
$previewUrl = "http://127.0.0.1:$Port/learn"

function Test-LearningPreview {
    try {
        $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content -match 'Inside AI'
    } catch {
        return $false
    }
}

try {
    if (-not (Test-LearningPreview)) {
        if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
            throw "Port $Port is used by another service. Run start-local.ps1 -Port 4175 to choose another port."
        }

        $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
        $vitePath = Join-Path $projectDir 'node_modules/vite/bin/vite.js'
        if (-not (Test-Path -LiteralPath $vitePath)) {
            throw 'Dependencies are missing. Run npm ci in the project folder first.'
        }
        if (-not (Test-Path -LiteralPath (Join-Path $projectDir 'dist/index.html'))) {
            Push-Location -LiteralPath $projectDir
            try {
                & npm.cmd run build
                if ($LASTEXITCODE -ne 0) { throw 'The build failed. See the output above.' }
            } finally {
                Pop-Location
            }
        }

        $logDir = Join-Path $projectDir 'work/local-preview'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $serverProcess = Start-Process -FilePath $nodePath -ArgumentList @(
            "`"$vitePath`"", 'preview', '--host', '127.0.0.1', '--port', "$Port", '--strictPort'
        ) -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru `
            -RedirectStandardOutput (Join-Path $logDir "preview-$Port.log") `
            -RedirectStandardError (Join-Path $logDir "preview-$Port.error.log")

        $deadline = (Get-Date).AddSeconds(20)
        while (-not (Test-LearningPreview)) {
            if ($serverProcess.HasExited -or (Get-Date) -gt $deadline) {
                throw "The preview did not start. Check logs in $logDir."
            }
            Start-Sleep -Milliseconds 250
        }
    }

    Write-Host "Ready: $previewUrl"
    if (-not $NoOpen) { Start-Process -FilePath $previewUrl }
} catch {
    Write-Host "Unable to open the learning lab: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

