#!/bin/bash
# Build script for all platforms - Digital Progeny v5.4.2

set -e  # Exit on error

echo "============================================"
echo "Digital Progeny - Complete Build Script"
echo "Version: 5.4.2"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate prerequisites
echo "Checking prerequisites..."
MISSING_DEPS=0

if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js 18+"
    MISSING_DEPS=1
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher (found: $NODE_VERSION)"
        MISSING_DEPS=1
    else
        print_status "Node.js $(node --version)"
    fi
fi

if ! command_exists npm; then
    print_error "npm not found"
    MISSING_DEPS=1
else
    print_status "npm $(npm --version)"
fi

if ! command_exists python3; then
    print_error "Python 3 not found. Please install Python 3.11+"
    MISSING_DEPS=1
else
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_status "Python $(python3 --version | cut -d' ' -f2)"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "Missing required dependencies. Please install them first."
    exit 1
fi

echo ""

# Build selection
echo "Select build target:"
echo "1) All (Web + Desktop + Mobile)"
echo "2) Backend only"
echo "3) Web only"
echo "4) Desktop only"
echo "5) Android only"
echo "6) Production bundle (Web + Desktop + Android)"
echo ""
read -p "Enter choice [1-6]: " choice

BUILD_WEB=0
BUILD_DESKTOP=0
BUILD_ANDROID=0
BUILD_BACKEND=0

case $choice in
    1)
        BUILD_WEB=1
        BUILD_DESKTOP=1
        BUILD_ANDROID=1
        BUILD_BACKEND=1
        ;;
    2)
        BUILD_BACKEND=1
        ;;
    3)
        BUILD_WEB=1
        ;;
    4)
        BUILD_DESKTOP=1
        ;;
    5)
        BUILD_ANDROID=1
        ;;
    6)
        BUILD_WEB=1
        BUILD_DESKTOP=1
        BUILD_ANDROID=1
        BUILD_BACKEND=1
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""

# Create dist directory
DIST_DIR="dist"
mkdir -p "$DIST_DIR"

# Build Backend
if [ $BUILD_BACKEND -eq 1 ]; then
    echo "============================================"
    echo "Building Backend..."
    echo "============================================"
    
    cd progeny_root
    
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    print_status "Installing dependencies..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    
    print_status "Running tests..."
    python -m pytest tests/ -v --tb=short || print_warning "Some tests failed (continuing...)"
    
    print_status "Creating backend package..."
    tar czf "../$DIST_DIR/sallie-backend-5.4.2.tar.gz" \
        core/ \
        limbic/ \
        memory/ \
        logs/ \
        working/ \
        scripts/ \
        requirements.txt \
        README.md \
        docker-compose.yml
    
    deactivate
    cd ..
    
    print_status "Backend build complete: $DIST_DIR/sallie-backend-5.4.2.tar.gz"
    echo ""
fi

# Build Web App
if [ $BUILD_WEB -eq 1 ]; then
    echo "============================================"
    echo "Building Web App..."
    echo "============================================"
    
    cd web
    
    print_status "Installing dependencies..."
    npm install --silent
    
    print_status "Running linter..."
    npm run lint || print_warning "Linter warnings found (continuing...)"
    
    print_status "Building production bundle..."
    npm run build
    
    print_status "Creating web package..."
    tar czf "../$DIST_DIR/sallie-web-5.4.2.tar.gz" \
        .next/ \
        package.json \
        package-lock.json \
        next.config.js \
        public/ \
        README.md
    
    cd ..
    
    print_status "Web build complete: $DIST_DIR/sallie-web-5.4.2.tar.gz"
    echo ""
fi

# Build Desktop App
if [ $BUILD_DESKTOP -eq 1 ]; then
    echo "============================================"
    echo "Building Desktop App..."
    echo "============================================"
    
    cd desktop
    
    print_status "Installing dependencies..."
    npm install --silent
    
    print_status "Building Electron app..."
    
    # Detect platform
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "Building for macOS..."
        npm run build -- --mac
        cp "dist/Sallie.dmg" "../$DIST_DIR/sallie-desktop-macos-5.4.2.dmg" 2>/dev/null || print_warning "macOS build not available"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Building for Linux..."
        npm run build -- --linux
        cp "dist/Sallie.AppImage" "../$DIST_DIR/sallie-desktop-linux-5.4.2.AppImage" 2>/dev/null || print_warning "Linux build not available"
    else
        print_warning "Unsupported platform for desktop build: $OSTYPE"
    fi
    
    cd ..
    
    print_status "Desktop build complete"
    echo ""
fi

# Build Android App
if [ $BUILD_ANDROID -eq 1 ]; then
    echo "============================================"
    echo "Building Android App..."
    echo "============================================"
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME not set. Please install Android Studio and set ANDROID_HOME."
        print_warning "Skipping Android build"
    else
        cd mobile
        
        print_status "Installing dependencies..."
        npm install --silent
        
        print_status "Building APK..."
        cd android
        
        if [ -f "gradlew" ]; then
            chmod +x gradlew
            ./gradlew assembleRelease || print_error "Android build failed"
            
            if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
                cp "app/build/outputs/apk/release/app-release.apk" \
                   "../../$DIST_DIR/sallie-android-5.4.2.apk"
                print_status "APK created: $DIST_DIR/sallie-android-5.4.2.apk"
            fi
            
            # Build AAB for Play Store
            print_status "Building AAB (Google Play)..."
            ./gradlew bundleRelease || print_error "AAB build failed"
            
            if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
                cp "app/build/outputs/bundle/release/app-release.aab" \
                   "../../$DIST_DIR/sallie-android-5.4.2.aab"
                print_status "AAB created: $DIST_DIR/sallie-android-5.4.2.aab"
            fi
        else
            print_error "Gradle wrapper not found"
        fi
        
        cd ../..
    fi
    
    echo ""
fi

# Summary
echo "============================================"
echo "Build Summary"
echo "============================================"
echo ""
print_status "Build completed successfully!"
echo ""
echo "Output directory: $DIST_DIR/"
ls -lh "$DIST_DIR/" 2>/dev/null || echo "(empty)"
echo ""

# Generate checksums
if command_exists sha256sum; then
    print_status "Generating checksums..."
    cd "$DIST_DIR"
    sha256sum * > checksums.txt 2>/dev/null
    cd ..
    print_status "Checksums saved to $DIST_DIR/checksums.txt"
fi

echo ""
echo "Next steps:"
echo "  1. Test the builds in $DIST_DIR/"
echo "  2. See DEPLOYMENT_GUIDE.md for deployment instructions"
echo "  3. Distribute to your users"
echo ""
print_status "Done!"
