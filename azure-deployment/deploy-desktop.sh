#!/bin/bash

# 🚀 Sallie Studio Desktop Application Deployment Script
# Azure Blob Storage Distribution

set -e

echo "🚀 Starting Sallie Studio Desktop Application Deployment..."

# Configuration
RESOURCE_GROUP="SallieStudioRG"
LOCATION="East US"
STORAGE_ACCOUNT="salliestudiostorage"
CONTAINER_NAME="desktop"
DESKTOP_APP_NAME="SallieStudioApp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    error "Azure CLI is not installed. Please install it first."
fi

# Login to Azure (if not already logged in)
log "Checking Azure login status..."
if ! az account show &> /dev/null; then
    log "Please login to Azure..."
    az login
fi

# Create Resource Group (if it doesn't exist)
log "Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location "$LOCATION" \
    --output none || warning "Resource group already exists"

# Create Storage Account
log "Creating Storage Account..."
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --output none || warning "Storage Account already exists"

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --account-name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query "[0].value" \
    --output tsv)

# Create container for desktop app
log "Creating storage container..."
az storage container create \
    --name $CONTAINER_NAME \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --public-access blob \
    --output none || warning "Container already exists"

# Navigate to desktop directory
cd "$(dirname "$0")/../SallieStudioApp" || error "Desktop application directory not found"

# Build the desktop application
log "Building desktop application..."
dotnet build -c Release -r win-x64

# Check if build was successful
if [ $? -ne 0 ]; then
    error "Build failed. Please check the build logs."
fi

# Find the executable
EXECUTABLE_PATH="bin/Release/net8.0-windows10.0.19041.0/win-x64/publish/$DESKTOP_APP_NAME.exe"
if [ ! -f "$EXECUTABLE_PATH" ]; then
    # Try alternative path
    EXECUTABLE_PATH="bin/Release/net8.0-windows10.0.19041.0/win-x64/$DESKTOP_APP_NAME.exe"
    if [ ! -f "$EXECUTABLE_PATH" ]; then
        error "Could not find the built executable. Please check the build output."
    fi
fi

# Create version info
VERSION=$(date +%Y%m%d-%H%M%S)
log "Creating version info..."
cat > version.json << EOF
{
  "version": "1.0.0",
  "buildDate": "$(date -I)",
  "buildNumber": "$VERSION",
  "platform": "Windows",
  "architecture": "x64",
  "downloadUrl": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe"
}
EOF

# Create installer script
log "Creating installer script..."
cat > install.sh << EOF
#!/bin/bash
# Sallie Studio Desktop Application Installer

echo "🚀 Installing Sallie Studio Desktop Application..."

# Create installation directory
INSTALL_DIR="\$HOME/Applications/SallieStudio"
mkdir -p "\$INSTALL_DIR"

# Download the application
echo "Downloading Sallie Studio..."
curl -L "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe" \
     -o "\$INSTALL_DIR/$DESKTOP_APP_NAME.exe"

# Create desktop shortcut
echo "Creating desktop shortcut..."
cat > "\$HOME/Desktop/SallieStudio.desktop" << DESKTOP_EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Sallie Studio
Comment=Your AI companion's control center
Exec="\$INSTALL_DIR/$DESKTOP_APP_NAME.exe"
Icon=\$INSTALL_DIR/icon.png
Terminal=false
Categories=Development;Office;
DESKTOP_EOF

# Make the desktop shortcut executable
chmod +x "\$HOME/Desktop/SallieStudio.desktop"

echo "✅ Installation completed!"
echo "🌐 You can now launch Sallie Studio from your desktop or Applications folder."
echo "🔗 Download URL: https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe"
EOF

chmod +x install.sh

# Create Windows installer script
log "Creating Windows installer script..."
cat > install.bat << EOF
@echo off
echo 🚀 Installing Sallie Studio Desktop Application...

REM Create installation directory
set INSTALL_DIR=%PROGRAMFILES%\SallieStudio
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Download the application
echo Downloading Sallie Studio...
powershell -Command "Invoke-WebRequest -Uri 'https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe' -OutFile '%INSTALL_DIR%\$DESKTOP_APP_NAME.exe'"

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "\$WshShell = New-Object -ComObject WScriptShell.Shell; \$WshShell.CreateShortcut('%PUBLIC%\Desktop\SallieStudio.lnk', '%INSTALL_DIR%\$DESKTOP_APP_NAME.exe')"

echo ✅ Installation completed!
echo 🌐 You can now launch Sallie Studio from your desktop or Start Menu.
echo 🔗 Download URL: https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe
pause
EOF

# Upload the executable to Azure Blob Storage
log "Uploading executable to Azure Blob Storage..."
az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file "$EXECUTABLE_PATH" \
    --name "$DESKTOP_APP_NAME.exe" \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

# Upload version info
log "Uploading version info..."
az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file version.json \
    --name version.json \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

# Upload installer scripts
log "Uploading installer scripts..."
az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file install.sh \
    --name install.sh \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file install.bat \
    --name install.bat \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

# Create auto-update manifest
log "Creating auto-update manifest..."
cat > update-manifest.json << EOF
{
  "version": "1.0.0",
  "buildDate": "$(date -I)",
  "buildNumber": "$VERSION",
  "platform": "Windows",
  "architecture": "x64",
  "files": {
    "main": {
      "url": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe",
      "checksum": "$(sha256sum "$EXECUTABLE_PATH" | cut -d' ' -f1)",
      "size": "$(stat -f%z "$EXECUTABLE_PATH")"
    },
    "installer": {
      "windows": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/install.bat",
      "linux": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/install.sh",
      "macos": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/install.sh"
    },
    "versionInfo": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/version.json"
  },
  "updateCheck": {
    "url": "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/version.json",
    "interval": "daily"
  },
  "releaseNotes": "Initial release of Sallie Studio Desktop Application"
}
EOF

az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file update-manifest.json \
    --name update-manifest.json \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

# Set CORS configuration for storage account
log "Configuring CORS..."
az storage cors set \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --services blob \
    --methods GET,POST,PUT,DELETE,HEAD \
    --origins "*" \
    --max-age 86400 \
    --allowed-headers "*" \
    --exposed-headers "*" \
    --output none

# Get the download URL
DOWNLOAD_URL="https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/$DESKTOP_APP_NAME.exe"

# Create download page
log "Creating download page..."
cat > download.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sallie Studio - Download</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .description {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .download-btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            margin: 0.5rem;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .platform-info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .version {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .requirements {
            margin-top: 1rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🦚</div>
        <h1>Sallie Studio</h1>
        <p class="description">Your AI companion's control center - Desktop Application</p>
        
        <a href="$DOWNLOAD_URL" class="download-btn" download>
            Download for Windows
        </a>
        
        <div class="platform-info">
            <div class="version">Version: 1.0.0</div>
            <div class="requirements">Requires: Windows 10 (19041) or later</div>
        </div>
    </div>
</body>
</html>
EOF

az storage blob upload \
    --container-name $CONTAINER_NAME \
    --file download.html \
    --name download.html \
    --account-name $STORAGE_ACCOUNT \
    --account-key "$STORAGE_KEY" \
    --overwrite \
    --output none

success "Desktop application deployed successfully!"
echo -e "${GREEN}🌐 Download URL: $DOWNLOAD_URL${NC}"
echo -e "${GREEN}📋 Download Page: https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/download.html${NC}"
echo -e "${GREEN}📦 Installer Scripts: https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/install.sh${NC}"
echo -e "${GREEN}🔄 Auto-update Manifest: https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/update-manifest.json${NC}"

# Optional: Open download page in browser
if command -v open &> /dev/null; then
    log "Opening download page in browser..."
    open "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/download.html"
elif command -v xdg-open &> /dev/null; then
    log "Opening download page in browser..."
    xdg-open "https://$STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER_NAME/download.html"
fi

echo -e "${GREEN}✅ Desktop application deployment completed successfully!${NC}"
