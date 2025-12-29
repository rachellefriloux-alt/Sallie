#!/bin/bash
# Quick Mobile App Launcher/Builder

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📱 Sallie Mobile App Launcher"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install --silent
    echo "✓ Dependencies installed"
    echo ""
fi

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || echo "localhost")

echo "What would you like to do?"
echo ""
echo "1) Build APK (Android)"
echo "2) Run on Android device/emulator"
echo "3) Build iOS (macOS only)"
echo "4) Get connection instructions"
echo "5) Exit"
echo ""
read -p "Choose option (1-5): " option

case $option in
    1)
        echo ""
        echo "📦 Building Android APK..."
        cd android
        ./gradlew assembleRelease
        echo ""
        echo "✓ APK built successfully!"
        echo "Location: android/app/build/outputs/apk/release/app-release.apk"
        echo ""
        echo "To install on device:"
        echo "1. Transfer APK to phone"
        echo "2. Enable 'Unknown Sources' in Android settings"
        echo "3. Install the APK"
        echo "4. Configure backend URL: http://$LOCAL_IP:8000"
        ;;
    2)
        echo ""
        echo "🚀 Starting on Android device..."
        echo "Make sure:"
        echo "• Android device is connected via USB"
        echo "• USB debugging is enabled"
        echo "• Backend is running"
        echo ""
        npm run android
        ;;
    3)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo ""
            echo "📦 Building iOS app..."
            npm run ios
        else
            echo "❌ iOS builds only available on macOS"
        fi
        ;;
    4)
        echo ""
        echo "📱 Connection Instructions:"
        echo ""
        echo "1. Make sure backend is running:"
        echo "   ./quick-start.sh"
        echo ""
        echo "2. On mobile device, connect to backend at:"
        echo "   http://$LOCAL_IP:8000"
        echo ""
        echo "3. Make sure phone and computer are on same WiFi"
        echo ""
        echo "4. Test connection in browser:"
        echo "   http://$LOCAL_IP:8000/health"
        echo ""
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
read -p "Press Enter to continue..."
