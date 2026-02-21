#!/usr/bin/env pwsh
# deploy.ps1 - Production deployment script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

Write-Host "🚀 Deploying The Base to $Environment environment..." -ForegroundColor Green

# Load environment variables
if ($Environment -eq "prod") {
    $envFile = ".env.production"
} elseif ($Environment -eq "staging") {
    $envFile = ".env.staging"
} else {
    $envFile = ".env.development"
}

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^(.*?)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
    Write-Host "✅ Loaded environment variables from $envFile" -ForegroundColor Green
} else {
    Write-Host "⚠️ Environment file $envFile not found" -ForegroundColor Yellow
}

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm ci
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend build complete" -ForegroundColor Green
Set-Location ..

# Build backend
Write-Host "📦 Building backend..." -ForegroundColor Yellow
Set-Location backend
npm ci
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend build complete" -ForegroundColor Green
Set-Location ..

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
Set-Location backend
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tests passed" -ForegroundColor Green
Set-Location ..

# Deploy with Docker
if ($Environment -eq "prod" -or $Environment -eq "staging") {
    Write-Host "🐳 Deploying with Docker Compose..." -ForegroundColor Yellow
    
    if ($Environment -eq "prod") {
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
    } else {
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker deployment failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker deployment complete" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deployment to $Environment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  • Environment: $Environment" -ForegroundColor White
Write-Host "  • Frontend: built successfully" -ForegroundColor White
Write-Host "  • Backend: built successfully" -ForegroundColor White
Write-Host "  • Tests: passed" -ForegroundColor White
if ($Environment -eq "prod" -or $Environment -eq "staging") {
    Write-Host "  • Docker: deployed" -ForegroundColor White
}
Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Yellow
if ($Environment -eq "prod") {
    Write-Host "  • Frontend: https://thebase.co.ke" -ForegroundColor White
    Write-Host "  • API: https://api.thebase.co.ke" -ForegroundColor White
    Write-Host "  • Docs: https://api.thebase.co.ke/api-docs" -ForegroundColor White
} elseif ($Environment -eq "staging") {
    Write-Host "  • Frontend: https://staging.thebase.co.ke" -ForegroundColor White
    Write-Host "  • API: https://staging-api.thebase.co.ke" -ForegroundColor White
} else {
    Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "  • API: http://localhost:3001" -ForegroundColor White
    Write-Host "  • Docs: http://localhost:3001/api-docs" -ForegroundColor White
}
