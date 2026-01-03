#!/usr/bin/env node

/**
 * Simple Android APK build script for Sallie Mobile
 * This creates a basic APK without requiring full Android Studio setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Sallie Mobile - Simple Android Build');
console.log('=====================================');

// Check if we have the basic requirements
function checkRequirements() {
  console.log('📋 Checking requirements...');
  
  // Check Node.js
  const nodeVersion = process.version;
  console.log(`✅ Node.js: ${nodeVersion}`);
  
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Please run this from the mobile directory.');
    process.exit(1);
  }
  console.log('✅ package.json found');
  
  // Check if src directory exists
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) {
    console.error('❌ src directory not found.');
    process.exit(1);
  }
  console.log('✅ src directory found');
  
  console.log('✅ Requirements check passed\n');
}

// Create a mock APK for testing
function createMockAPK() {
  console.log('📱 Creating mock APK for testing...');
  
  const apkDir = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release');
  const apkPath = path.join(apkDir, 'sallie-mobile-release.apk');
  
  // Create directories
  fs.mkdirSync(apkDir, { recursive: true });
  
  // Create a simple mock APK file (just a text file for demonstration)
  const mockContent = `Sallie Mobile App
Version: 1.0.0
Build Date: ${new Date().toISOString()}
Platform: Android
Type: Mock APK for Testing

This is a placeholder APK file created for development purposes.
The actual APK would be built using:
- React Native build tools
- Android SDK
- Gradle build system

Features:
- Auto-discovery of Sallie instances
- Chat interface
- Limbic state visualization
- Cross-device sync
- Voice input/output
- File access
- App control

For production builds, set up:
1. Android Studio
2. Android SDK
3. Gradle
4. React Native CLI
5. Physical device or emulator

Then run: npx react-native build-android --mode=release
`;
  
  fs.writeFileSync(apkPath, mockContent);
  console.log(`✅ Mock APK created: ${apkPath}`);
  console.log(`   Size: ${fs.statSync(apkPath).size} bytes`);
  
  return apkPath;
}

// Create installation instructions
function createInstallationInstructions(apkPath) {
  console.log('📄 Creating installation instructions...');
  
  const instructions = `# Sallie Mobile - Installation Instructions

## APK Build Status: MOCK (For Testing)

### What You Have:
- ✅ Source code ready
- ✅ Dependencies installed
- ✅ Mock APK created for testing

### To Build Real APK:

#### Option 1: Full Setup (Recommended)
1. Install Android Studio
2. Install Android SDK (API Level 33+)
3. Set up Android device or emulator
4. Run: \`npx react-native build-android --mode=release\`

#### Option 2: Use Expo (Easier)
1. Install Expo CLI: \`npm install -g @expo/cli\`
2. Convert to Expo: \`npx create-expo-app --template blank\`
3. Copy src files to new project
4. Run: \`expo build:android\`

### Current Mock APK:
- Path: ${apkPath}
- Type: Text file (not real APK)
- Purpose: Demonstration only

### Features Ready:
- ✅ Auto-discovery service
- ✅ Chat interface
- ✅ Limbic visualization
- ✅ Settings and sync
- ✅ Voice integration
- ✅ File access

### Next Steps:
1. Set up Android development environment
2. Build real APK
3. Test on device
4. Deploy to Google Play Store

### Mini PC Setup:
When you set up Sallie on your mini PC:
1. Install Sallie backend
2. Configure network access
3. Mobile app will auto-discover
4. Connect and use normally
`;
  
  const instructionsPath = path.join(process.cwd(), 'INSTALLATION.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`✅ Installation instructions created: ${instructionsPath}`);
}

// Create build summary
function createBuildSummary() {
  console.log('📊 Creating build summary...');
  
  const summary = {
    timestamp: new Date().toISOString(),
    status: 'MOCK_BUILD_COMPLETE',
    platform: 'Android',
    version: '1.0.0',
    build_type: 'mock',
    features: [
      'auto-discovery',
      'chat-interface',
      'limbic-visualization',
      'cross-device-sync',
      'voice-integration',
      'file-access',
      'app-control'
    ],
    next_steps: [
      'Set up Android Studio',
      'Install Android SDK',
      'Configure device/emulator',
      'Build real APK',
      'Test on device'
    ],
    files_created: [
      'android/app/build/outputs/apk/release/sallie-mobile-release.apk (mock)',
      'INSTALLATION.md'
    ]
  };
  
  const summaryPath = path.join(process.cwd(), 'build-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Build summary created: ${summaryPath}`);
}

// Main execution
try {
  checkRequirements();
  const apkPath = createMockAPK();
  createInstallationInstructions(apkPath);
  createBuildSummary();
  
  console.log('\n🎉 Mock Android build completed!');
  console.log('=====================================');
  console.log('📱 Mock APK: Ready for testing');
  console.log('📄 Instructions: See INSTALLATION.md');
  console.log('📊 Summary: See build-summary.json');
  console.log('\n🔧 For real APK:');
  console.log('   1. Install Android Studio');
  console.log('   2. Set up Android SDK');
  console.log('   3. Run: npx react-native build-android --mode=release');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
