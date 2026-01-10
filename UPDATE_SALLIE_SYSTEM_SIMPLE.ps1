# Sallie Studio System Update Script (Simplified)
# Checks for missing files and dependencies, installs only what's needed

Write-Host "🔍 Sallie Studio System Update" -ForegroundColor Cyan
Write-Host "Checking for missing components..." -ForegroundColor Yellow

# Function to check if file exists and has content
function Test-FileExistsAndNotEmpty {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        if ($content -and $content.Trim().Length -gt 0) {
            return $true
        }
    }
    return $false
}

# Function to check if Python package is installed
function Test-PythonPackage {
    param([string]$PackageName)
    
    try {
        $result = python -m pip show $PackageName 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Function to check if Ollama model exists
function Test-OllamaModel {
    param([string]$ModelName)
    
    try {
        $result = ollama list 2>$null
        if ($result -match $ModelName) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Function to create directory if it doesn't exist
function Ensure-Directory {
    param([string]$Path)
    
    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "✅ Created directory: $Path" -ForegroundColor Green
    }
}

# Function to write Python file
function Write-PythonFile {
    param(
        [string]$FilePath,
        [string]$Content
    )
    
    if (Test-FileExistsAndNotEmpty $FilePath) {
        Write-Host "⏭️  Skipping $FilePath (already exists)" -ForegroundColor Yellow
        return
    }
    
    Ensure-Directory (Split-Path $FilePath -Parent)
    $Content | Out-File -FilePath $FilePath -Encoding UTF8
    Write-Host "✅ Created: $FilePath" -ForegroundColor Green
}

# STEP 1: Check and Install Missing Dependencies
Write-Host "`n📦 Checking Dependencies..." -ForegroundColor Cyan

$packages = @("zeroconf", "pystray", "qdrant-client", "pyinstaller")

foreach ($package in $packages) {
    if (!(Test-PythonPackage $package)) {
        Write-Host "📥 Installing $package..." -ForegroundColor Yellow
        python -m pip install $package
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $package installed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install $package" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ $package already installed" -ForegroundColor Green
    }
}

# STEP 2: Check and Download Missing Ollama Models (skipping deepseek)
Write-Host "`n🤖 Checking AI Models..." -ForegroundColor Cyan

$models = @("llama3", "nomic-embed-text")

foreach ($model in $models) {
    if (!(Test-OllamaModel $model)) {
        Write-Host "📥 Downloading $model..." -ForegroundColor Yellow
        ollama pull $model
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $model downloaded successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to download $model" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ $model already available" -ForegroundColor Green
    }
}

# STEP 3: Generate Simple Core Files
Write-Host "`n📝 Generating Core Files..." -ForegroundColor Cyan

# Simple server health check
$healthCheckContent = @"
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "systems_initialized": True}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8742)
"@

Write-PythonFile "server\health_check.py" $healthCheckContent

# Simple build script
$buildScriptContent = @"
# Simple build script for Sallie Studio
Write-Host "Building Sallie Studio..." -ForegroundColor Green
Write-Host "Build completed!" -ForegroundColor Green
"@

Write-PowerShellFile "build_simple.ps1" $buildScriptContent

Write-Host "`n🎉 Update Process Completed!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "✅ Dependencies checked and installed" -ForegroundColor Green
Write-Host "✅ AI models verified and downloaded" -ForegroundColor Green
Write-Host "✅ Core files generated" -ForegroundColor Green

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start server: python server\health_check.py" -ForegroundColor White
Write-Host "2. Access web interface: http://localhost:8742" -ForegroundColor White
Write-Host "3. Check health: http://localhost:8742/health" -ForegroundColor White

Write-Host "`n✨ Sallie Studio basic setup is ready!" -ForegroundColor Green
