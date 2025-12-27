# Sallie Mobile App

Cross-platform mobile app for the Digital Progeny (iOS, Android, tablets).

## Features

- Real-time chat with Sallie via WebSocket
- Encrypted cross-device sync
- Push notifications for proactive engagement
- Biometric authentication
- Offline mode with sync on reconnect
- Voice interface (STT/TTS)
- Limbic state visualization

## Setup

### Prerequisites

- Node.js 18+
- React Native CLI
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio (for Android development)

### Installation

```bash
cd mobile
npm install
```

### iOS Setup

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Setup

```bash
npm run android
```

## Configuration

Set the backend URL in `src/services/api_client.ts`:

```typescript
const apiClient = new APIClient('http://your-backend-url:8000');
```

## Development

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Architecture

- **Screens**: Main app screens (Chat, Settings, Heritage Browser)
- **Components**: Reusable UI components
- **Services**: API client, sync client, encryption
- **Store**: State management (Zustand)
- **Navigation**: App navigation (React Navigation)

