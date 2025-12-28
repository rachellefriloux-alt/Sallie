#!/bin/bash

# Sallie - Build All Apps Script
# Builds web, desktop, and Android apps for distribution

set -e  # Exit on error

echo "=========================================="
echo "  Sallie - Build All Apps"
echo "  Version 5.4.2"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Root directory: $ROOT_DIR"
echo ""

# Check if running on macOS, Linux, or Windows (Git Bash/WSL)
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS_TYPE="windows"
else
    OS_TYPE="unknown"
fi

echo "Detected OS: $OS_TYPE"
echo ""

# Build options
BUILD_WEB=${BUILD_WEB:-true}
BUILD_DESKTOP=${BUILD_DESKTOP:-true}
BUILD_ANDROID=${BUILD_ANDROID:-false}  # Requires Android SDK

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --web-only)
            BUILD_WEB=true
            BUILD_DESKTOP=false
            BUILD_ANDROID=false
            shift
            ;;
        --desktop-only)
            BUILD_WEB=false
            BUILD_DESKTOP=true
            BUILD_ANDROID=false
            shift
            ;;
        --android-only)
            BUILD_WEB=false
            BUILD_DESKTOP=false
            BUILD_ANDROID=true
            shift
            ;;
        --all)
            BUILD_WEB=true
            BUILD_DESKTOP=true
            BUILD_ANDROID=true
            shift
            ;;
        --no-web)
            BUILD_WEB=false
            shift
            ;;
        --no-desktop)
            BUILD_DESKTOP=false
            shift
            ;;
        --with-android)
            BUILD_ANDROID=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--web-only|--desktop-only|--android-only|--all|--no-web|--no-desktop|--with-android]"
            exit 1
            ;;
    esac
done

# Check dependencies
echo "Checking dependencies..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

if [[ "$BUILD_ANDROID" == "true" ]]; then
    if ! command -v java &> /dev/null; then
        echo -e "${RED}✗ Java not found (required for Android)${NC}"
        echo "  Install JDK 17+ from: https://adoptium.net/"
        exit 1
    fi
    echo -e "${GREEN}✓ Java $(java -version 2>&1 | head -n 1)${NC}"
fi

echo ""

# Create dist directory
DIST_DIR="$ROOT_DIR/dist"
mkdir -p "$DIST_DIR"

echo "Output directory: $DIST_DIR"
echo ""

# Build counter
BUILD_SUCCESS=0
BUILD_TOTAL=0

# ======================
# Build Web App
# ======================
if [[ "$BUILD_WEB" == "true" ]]; then
    echo "=========================================="
    echo "  Building Web App"
    echo "=========================================="
    BUILD_TOTAL=$((BUILD_TOTAL + 1))
    
    cd "$ROOT_DIR/web"
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    echo "Building Next.js production build..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Web app built successfully${NC}"
        BUILD_SUCCESS=$((BUILD_SUCCESS + 1))
        
        # Create archive
        echo "Creating web app archive..."
        cd "$ROOT_DIR/web"
        tar -czf "$DIST_DIR/sallie-web-5.4.2.tar.gz" .next/ public/ package.json next.config.js
        echo -e "${GREEN}✓ Archive created: $DIST_DIR/sallie-web-5.4.2.tar.gz${NC}"
    else
        echo -e "${RED}✗ Web app build failed${NC}"
    fi
    
    echo ""
fi

# ======================
# Build Desktop App
# ======================
if [[ "$BUILD_DESKTOP" == "true" ]]; then
    echo "=========================================="
    echo "  Building Desktop App"
    echo "=========================================="
    BUILD_TOTAL=$((BUILD_TOTAL + 1))
    
    cd "$ROOT_DIR/desktop"
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Add electron-builder config if missing
    if ! grep -q "electron-builder" package.json; then
        echo "Adding electron-builder configuration..."
        cat > electron-builder.json <<EOF
{
  "appId": "com.digitalprogeny.sallie",
  "productName": "Sallie",
  "directories": {
    "output": "dist"
  },
  "files": [
    "main.js",
    "package.json",
    "node_modules/**/*"
  ],
  "win": {
    "target": ["nsis", "zip"],
    "icon": "assets/icon.png"
  },
  "mac": {
    "target": ["dmg", "zip"],
    "category": "public.app-category.productivity",
    "icon": "assets/icon.icns"
  },
  "linux": {
    "target": ["AppImage", "tar.gz"],
    "category": "Office",
    "icon": "assets/icon.png"
  }
}
EOF
    fi
    
    echo "Building Electron app for $OS_TYPE..."
    
    case $OS_TYPE in
        macos)
            npm run build -- --mac
            ;;
        linux)
            npm run build -- --linux
            ;;
        windows)
            npm run build -- --win
            ;;
        *)
            echo "Building for current platform..."
            npm run build
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Desktop app built successfully${NC}"
        BUILD_SUCCESS=$((BUILD_SUCCESS + 1))
        
        # Copy to dist
        if [ -d "dist" ]; then
            cp -r dist/* "$DIST_DIR/" 2>/dev/null || true
            echo -e "${GREEN}✓ Installers copied to: $DIST_DIR${NC}"
        fi
    else
        echo -e "${RED}✗ Desktop app build failed${NC}"
    fi
    
    echo ""
fi

# ======================
# Build Android App
# ======================
if [[ "$BUILD_ANDROID" == "true" ]]; then
    echo "=========================================="
    echo "  Building Android App"
    echo "=========================================="
    BUILD_TOTAL=$((BUILD_TOTAL + 1))
    
    cd "$ROOT_DIR/mobile"
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${YELLOW}⚠ ANDROID_HOME not set${NC}"
        echo "  Please set ANDROID_HOME to your Android SDK path"
        echo "  Example: export ANDROID_HOME=~/Android/Sdk"
    else
        echo "Android SDK: $ANDROID_HOME"
        
        cd android
        
        # Build release APK
        echo "Building release APK..."
        ./gradlew assembleRelease
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Android APK built successfully${NC}"
            BUILD_SUCCESS=$((BUILD_SUCCESS + 1))
            
            # Copy APK
            APK_PATH="app/build/outputs/apk/release/app-release.apk"
            if [ -f "$APK_PATH" ]; then
                cp "$APK_PATH" "$DIST_DIR/sallie-android-5.4.2.apk"
                echo -e "${GREEN}✓ APK copied to: $DIST_DIR/sallie-android-5.4.2.apk${NC}"
                
                # Get APK size
                APK_SIZE=$(ls -lh "$DIST_DIR/sallie-android-5.4.2.apk" | awk '{print $5}')
                echo "  APK size: $APK_SIZE"
            fi
        else
            echo -e "${RED}✗ Android build failed${NC}"
        fi
        
        # Build AAB (optional)
        echo ""
        echo "Building release AAB (Google Play)..."
        ./gradlew bundleRelease
        
        if [ $? -eq 0 ]; then
            AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
            if [ -f "$AAB_PATH" ]; then
                cp "$AAB_PATH" "$DIST_DIR/sallie-android-5.4.2.aab"
                echo -e "${GREEN}✓ AAB copied to: $DIST_DIR/sallie-android-5.4.2.aab${NC}"
            fi
        fi
    fi
    
    echo ""
fi

# ======================
# Build Summary
# ======================
echo "=========================================="
echo "  Build Summary"
echo "=========================================="
echo ""
echo "Successful builds: $BUILD_SUCCESS / $BUILD_TOTAL"
echo ""

if [ -d "$DIST_DIR" ]; then
    echo "Output files in: $DIST_DIR"
    echo ""
    ls -lh "$DIST_DIR" | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
fi

if [ $BUILD_SUCCESS -eq $BUILD_TOTAL ]; then
    echo -e "${GREEN}✓ All builds completed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some builds failed${NC}"
    exit 1
fi
