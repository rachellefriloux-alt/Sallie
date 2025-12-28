---
name: Complete Digital Progeny Project
overview: Complete the Digital Progeny project to production-ready state with cross-platform mobile apps, encrypted sync, full device access, and smart home integration, while maintaining local-first privacy principles.
todos:
  - id: extraction-prompts
    content: Implement all 14 Convergence extraction prompts (Q1-Q14) matching Section 16.9 schemas
    status: completed
  - id: dream-cycle-complete
    content: "Complete Dream Cycle: hypothesis extraction, conflict detection, conditional beliefs, heritage promotion"
    status: completed
  - id: posture-integration
    content: Fully integrate posture system prompts (Section 16.10) into synthesis
    status: completed
  - id: degradation-system
    content: "Implement full degradation system: AMNESIA, OFFLINE, DEAD states with recovery"
    status: completed
  - id: refraction-check
    content: Implement Refraction Check for consistency analysis (Section 16.8)
    status: completed
    dependencies:
      - dream-cycle-complete
  - id: sync-infrastructure
    content: "Build encrypted sync infrastructure (hybrid: local-first with encrypted cloud backup)"
    status: pending
  - id: mobile-api-server
    content: Extend FastAPI with mobile-optimized endpoints, push notifications, device management
    status: pending
    dependencies:
      - sync-infrastructure
  - id: react-native-app
    content: Build React Native mobile app (iOS + Android) with chat, sync, voice, biometric auth
    status: pending
    dependencies:
      - mobile-api-server
  - id: windows-desktop-app
    content: Build Windows desktop app using Electron + React with system tray integration
    status: pending
  - id: tablet-optimizations
    content: Optimize mobile app for tablet form factors with responsive layouts
    status: completed
    dependencies:
      - react-native-app
  - id: device-access-api
    content: Build device access API for file system, app control, system info, permissions
    status: pending
  - id: windows-device-integration
    content: "Implement Windows device integration: file system, COM automation, notifications"
    status: completed
    dependencies:
      - device-access-api
  - id: ios-device-integration
    content: "Implement iOS device integration: Files app, Shortcuts, Siri, notifications"
    status: completed
    dependencies:
      - device-access-api
      - react-native-app
  - id: android-device-integration
    content: "Implement Android device integration: Storage Access, Intents, Google Assistant"
    status: completed
    dependencies:
      - device-access-api
      - react-native-app
  - id: home-assistant-hub
    content: Implement Home Assistant integration as central hub for smart home
    status: pending
  - id: alexa-integration
    content: Implement Alexa Skills Kit integration for voice commands and device control
    status: pending
    dependencies:
      - home-assistant-hub
  - id: google-home-integration
    content: Implement Google Home/Assistant SDK integration with Gemini voice
    status: pending
    dependencies:
      - home-assistant-hub
  - id: homekit-integration
    content: Implement Apple HomeKit integration with Siri support
    status: pending
    dependencies:
      - home-assistant-hub
  - id: copilot-integration
    content: Implement Microsoft Copilot integration via Graph API
    status: pending
    dependencies:
      - home-assistant-hub
  - id: smart-home-api
    content: "Add smart home API endpoints: devices, control, automations, scenes"
    status: pending
    dependencies:
      - home-assistant-hub
  - id: comprehensive-testing
    content: Expand test coverage to >80% including sync, mobile, device access, smart home
    status: completed
  - id: security-audit
    content: "Complete security audit: encryption, sync, device access, API security"
    status: completed
  - id: performance-optimization
    content: "Optimize performance: sync, mobile app, caching, database queries"
    status: completed
  - id: complete-documentation
    content: "Complete all documentation: API docs, mobile guide, sync architecture, device access, smart home"
    status: completed
  - id: cicd-pipeline
    content: "Set up CI/CD: GitHub Actions, testing, linting, mobile builds, deployment"
    status: completed
  - id: ghost-interface-complete
    content: "Complete Ghost Interface: system tray, Pulse, Shoulder Tap, Veto Popup"
    status: pending
  - id: voice-interface-complete
    content: "Complete Voice Interface: STT/TTS, wake word, voice commands, prosody"
    status: pending
  - id: sensors-complete
    content: "Complete Sensors System: file watcher, system load, refractory period, patterns"
    status: pending
  - id: foundry-implementation
    content: "Implement Foundry: fine-tuning pipeline, evaluation harness, drift reports"
    status: pending
  - id: kinship-complete
    content: "Complete Kinship System: multi-user isolation, auth API, context switching"
    status: pending
---

# Complete Digital Progeny Project Plan

## Architecture Overview

The plan extends the existing local-first architecture with:

- **Cross-platform mobile apps** (iOS, Android, Windows, tablets)
- **Encrypted sync infrastructure** (hybrid: local-first with encrypted cloud backup)
- **Device access APIs** (full access with existing safety mechanisms)
- **Smart home integrations** (Home Assistant hub + direct platform integrations)
- **Completion of all remaining core features** from gap analysis

## Phase 1: Core Feature Completion (Weeks 1-4)

### 1.1 Convergence Extraction Prompts (P0)

**Files**: `progeny_root/core/extraction.py`, `progeny_root/core/convergence.py`Implement the 14 specific extraction prompts from Section 16.9 of the canonical spec. Each question (Q1-Q14) needs its exact extraction prompt that structures the Creator's answer into the specified JSON schema.**Tasks**:

- Create `extraction.py` with all 14 extraction prompt functions
- Update `convergence.py` to use specific extraction prompts per question
- Ensure extracted data matches the schemas in Section 14.3
- Test extraction accuracy with sample answers

### 1.2 Dream Cycle Completion (P1)

**Files**: `progeny_root/core/dream.py`, `progeny_root/core/extraction.py`Complete hypothesis extraction, conflict detection, conditional belief synthesis, and heritage promotion.**Tasks**:

- Implement pattern extraction from `thoughts.log`
- Add conflict detection against existing Heritage
- Implement conditional belief synthesis ("X EXCEPT when Y")
- Add heritage promotion workflow with Veto queue
- Implement Second Brain hygiene (Daily Morning Reset, Weekly Review)

### 1.3 Posture System Integration (P1)

**Files**: `progeny_root/core/synthesis.py`, `progeny_root/core/prompts.py`Fully integrate posture-specific prompts (Section 16.10) into synthesis.**Tasks**:

- Add posture prompt matrix to `prompts.py`
- Update `synthesis.py` to inject posture-specific instructions
- Test posture behavior (COMPANION, COPILOT, PEER, EXPERT)

### 1.4 Degradation System (P1)

**Files**: `progeny_root/core/degradation.py`Implement full failure matrix: AMNESIA, OFFLINE, DEAD states with recovery procedures.**Tasks**:

- Implement state detection (Qdrant offline, Ollama offline, disk failure)
- Add state-specific behavior modifications
- Implement recovery procedures
- Add health monitoring and automatic state transitions

### 1.5 Refraction Check (P2)

**Files**: `progeny_root/core/dream.py` (new method)Implement consistency analysis comparing Heritage claims to observed behavior.**Tasks**:

- Add Refraction Check to Dream Cycle
- Implement discrepancy detection (contradiction, exaggeration, blind_spot, growth)
- Add Mirror Test Refraction Dialogue trigger

## Phase 2: Mobile & Cross-Platform Infrastructure (Weeks 5-8)

### 2.1 Sync Infrastructure (P0)

**Files**: `progeny_root/core/sync/` (new directory)Build encrypted sync system maintaining local-first principles.**Architecture**:

- **Local Core**: Primary processing stays on main device (Windows desktop)
- **Encrypted Sync**: State, memories, and conversations sync via encrypted cloud
- **Conflict Resolution**: Last-write-wins with manual merge option
- **Privacy**: End-to-end encryption, zero-knowledge architecture

**Components**:

- `sync_client.py`: Handles sync operations
- `sync_encryption.py`: End-to-end encryption layer
- `sync_conflict.py`: Conflict resolution
- `sync_state.py`: Tracks sync status per device

**Tasks**:

- Design sync protocol (WebSocket + REST API)
- Implement encryption layer (AES-256-GCM with key derivation)
- Build conflict resolution system
- Create sync state management
- Add sync status API endpoints

### 2.2 Mobile API Server (P0)

**Files**: `progeny_root/core/api/` (new directory)Extend FastAPI server with mobile-optimized endpoints and authentication.**Tasks**:

- Add device registration endpoints
- Implement push notification support (FCM for Android, APNs for iOS)
- Add mobile-optimized chat endpoint (streaming, reconnection)
- Create device management API
- Add sync status endpoints

### 2.3 React Native Mobile App (P0)

**Files**: `mobile/` (new directory)Build cross-platform mobile app using React Native.**Structure**:

```javascript
mobile/
├── src/
│   ├── screens/          # Chat, Settings, Heritage Browser, etc.
│   ├── components/       # Reusable UI components
│   ├── services/         # API client, sync client, encryption
│   ├── store/            # State management (Redux/Zustand)
│   └── navigation/       # App navigation
├── ios/                  # iOS native code
├── android/              # Android native code
└── package.json
```

**Features**:

- Chat interface with streaming responses
- Limbic state visualization
- Offline mode with sync on reconnect
- Push notifications for proactive engagement
- Voice interface (STT/TTS)
- Biometric authentication

**Tasks**:

- Initialize React Native project
- Set up navigation and state management
- Build chat screen with streaming
- Implement sync client
- Add encryption layer
- Build settings and configuration screens
- Add voice interface integration
- Implement push notifications
- Add biometric auth

### 2.4 Windows Desktop App (P1)

**Files**: `desktop/` (new directory)Build Windows desktop app using Electron + React.**Tasks**:

- Initialize Electron project
- Port web UI to Electron
- Add system tray integration
- Implement native file system access
- Add Windows-specific features (notifications, shortcuts)

### 2.5 Tablet Optimizations (P1)

**Files**: `mobile/src/screens/`, `mobile/src/components/`Optimize mobile app for tablet form factors.**Tasks**:

- Add responsive layouts for tablets
- Implement split-screen views
- Optimize for larger screens
- Add tablet-specific gestures

## Phase 3: Device Access & Control (Weeks 9-11)

### 3.1 Device Access API (P0)

**Files**: `progeny_root/core/device_access/` (new directory)Build APIs for Sallie to interact with Creator's devices.**Components**:

- `file_system.py`: File operations (read, write, organize)
- `app_control.py`: Launch apps, send messages, automation
- `system_info.py`: Device status, battery, network
- `permissions.py`: Permission management per device

**Tasks**:

- Design device access protocol
- Implement file system operations
- Add app control (Windows: COM automation, iOS/Android: intents)
- Build permission system
- Add device discovery and registration
- Create device access logging

### 3.2 Windows Device Integration (P0)

**Files**: `progeny_root/core/device_access/windows/` (new directory)**Tasks**:

- Implement Windows file system access
- Add COM automation for app control
- Build Windows notification system
- Add clipboard access
- Implement Windows shortcuts/automation

### 3.3 iOS Device Integration (P0)

**Files**: `mobile/ios/`, `progeny_root/core/device_access/ios/`**Tasks**:

- Add iOS file system access (Files app integration)
- Implement iOS Shortcuts integration
- Add Siri integration for voice commands
- Build iOS notification system
- Add iOS automation capabilities

### 3.4 Android Device Integration (P0)

**Files**: `mobile/android/`, `progeny_root/core/device_access/android/`**Tasks**:

- Add Android file system access (Storage Access Framework)
- Implement Android Intents for app control
- Add Google Assistant integration
- Build Android notification system
- Add Android automation (Tasker integration)

## Phase 4: Smart Home Integration (Weeks 12-13)

### 4.1 Home Assistant Hub (P0)

**Files**: `progeny_root/core/smart_home/home_assistant.py`Use Home Assistant as the central hub for all smart home platforms.**Tasks**:

- Implement Home Assistant API client
- Add device discovery and control
- Build automation trigger system
- Create scene management
- Add energy monitoring integration

### 4.2 Platform Integrations (P0)

**Files**: `progeny_root/core/smart_home/` (new directory)**Alexa Integration** (`alexa.py`):

- Implement Alexa Skills Kit
- Add voice command routing
- Build device control via Alexa

**Google Home Integration** (`google_home.py`):

- Implement Google Assistant SDK
- Add Gemini integration for voice
- Build device control via Google Home

**Apple HomeKit Integration** (`homekit.py`):

- Implement HomeKit Accessory Protocol
- Add Siri integration
- Build device control via HomeKit

**Microsoft Copilot Integration** (`copilot.py`):

- Implement Microsoft Graph API
- Add Copilot plugin/extension
- Build device control via Copilot

**Tasks**:

- Research and implement each platform's API
- Build unified device abstraction layer
- Add voice command routing
- Create automation system
- Build scene and routine management

### 4.3 Smart Home API (P0)

**Files**: `progeny_root/core/main.py` (new endpoints)**Endpoints**:

- `GET /v1/smart_home/devices` - List all devices
- `POST /v1/smart_home/devices/{id}/control` - Control device
- `POST /v1/smart_home/automations` - Create automation
- `GET /v1/smart_home/scenes` - List scenes
- `POST /v1/smart_home/scenes/{id}/activate` - Activate scene

**Tasks**:

- Add smart home endpoints to FastAPI
- Implement device discovery
- Add control commands
- Build automation system
- Create scene management

## Phase 5: Quality & Polish (Weeks 14-16)

### 5.1 Comprehensive Testing (P0)

**Files**: `progeny_root/tests/`**Tasks**:

- Expand test coverage to >80%
- Add integration tests for sync
- Add mobile app tests (Jest + React Native Testing Library)
- Add device access tests
- Add smart home integration tests
- Add end-to-end tests

### 5.2 Security Audit (P0)

**Files**: `progeny_root/SECURITY_AUDIT.md`**Tasks**:

- Audit encryption implementation
- Review sync security
- Audit device access permissions
- Review API security
- Add penetration testing
- Document security findings

### 5.3 Performance Optimization (P1)

**Files**: All core modules**Tasks**:

- Profile sync performance
- Optimize mobile app performance
- Add caching strategies
- Optimize database queries
- Add connection pooling
- Implement request batching

### 5.4 Documentation (P0)

**Files**: Various documentation files**Tasks**:

- Complete API documentation (OpenAPI/Swagger)
- Write mobile app user guide
- Document sync architecture
- Document device access system
- Document smart home integrations
- Create deployment guides for all platforms

### 5.5 CI/CD Pipeline (P1)

**Files**: `.github/workflows/` (new directory)**Tasks**:

- Set up GitHub Actions for testing
- Add linting and type checking
- Add mobile app build pipelines
- Add automated deployment
- Add security scanning

## Phase 6: Advanced Features (Weeks 17-20)

### 6.1 Ghost Interface Completion (P2)

**Files**: `progeny_root/core/ghost.py`, `progeny_root/interface/ghost/`**Tasks**:

- Complete system tray implementation
- Add Pulse visualization
- Implement Shoulder Tap notifications
- Add Veto Popup interface
- Build quick actions menu

### 6.2 Voice Interface Completion (P2)

**Files**: `progeny_root/core/voice.py`**Tasks**:

- Complete STT/TTS integration
- Add wake word detection
- Implement voice commands
- Add emotional prosody
- Build voice calibration flow

### 6.3 Sensors System Completion (P2)

**Files**: `progeny_root/core/sensors.py`**Tasks**:

- Complete file watcher
- Add system load monitoring
- Implement refractory period logic
- Add pattern detection
- Build trigger system

### 6.4 Foundry Implementation (P2)

**Files**: `progeny_root/core/foundry.py`, `progeny_root/foundry/`**Tasks**:

- Implement fine-tuning pipeline
- Build evaluation harness
- Add drift report generation
- Create rollback system
- Add dataset governance

### 6.5 Kinship System Completion (P2)

**Files**: `progeny_root/core/kinship.py`**Tasks**:

- Complete multi-user context isolation
- Add authentication API
- Implement context switching
- Build permission boundaries
- Add Kin management UI

## Implementation Strategy

### Technology Stack

**Backend**:

- Python 3.11+ (FastAPI)
- PostgreSQL (for sync state, optional)
- Redis (for sync coordination, optional)
- WebSocket (for real-time sync)

**Mobile**:

- React Native (iOS + Android)
- TypeScript
- Redux Toolkit or Zustand (state management)
- React Query (API client)

**Desktop**:

- Electron + React (Windows)
- TypeScript

**Smart Home**:

- Home Assistant (hub)
- Platform-specific SDKs

**Sync**:

- End-to-end encryption (libsodium/PyNaCl)
- WebSocket for real-time
- REST API for state sync

### Data Flow

```javascript
┌─────────────┐
│   Mobile    │◄──┐
│    App      │   │
└──────┬──────┘   │
       │          │ Encrypted
       │          │ Sync
┌──────▼──────┐   │
│  Sync API   │   │
│   Server    │   │
└──────┬──────┘   │
       │          │
┌──────▼──────┐   │
│  Local Core │◄──┘
│  (Windows)  │
└──────┬──────┘
       │
┌──────▼──────┐
│   Devices    │
│  & Smart     │
│    Home     │
└─────────────┘
```



### Security Model

- **Encryption**: All sync data encrypted end-to-end
- **Authentication**: Device-based auth with biometric support
- **Permissions**: Granular device access permissions
- **Audit**: All device access logged
- **Local-First**: Core processing stays local, sync is optional

## Success Criteria

1. ✅ All 14 Convergence extraction prompts implemented and tested
2. ✅ Dream Cycle fully functional with hypothesis extraction
3. ✅ Cross-platform mobile apps (iOS, Android) functional
4. ✅ Encrypted sync working across all devices
5. ✅ Device access APIs functional on Windows, iOS, Android
6. ✅ Smart home integrations working (Home Assistant + platforms)
7. ✅ Test coverage >80%
8. ✅ Security audit passed
9. ✅ Performance optimized (<3s response time)
10. ✅ Complete documentation

## Risk Mitigation

- **Sync Conflicts**: Implement robust conflict resolution
- **Device Access Security**: Strict permission model with audit logging
- **Smart Home Reliability**: Fallback to local control if cloud fails
- **Mobile Performance**: Optimize for low-end devices
- **Privacy**: Maintain local-first, encryption everywhere

## Estimated Timeline

- **Phase 1** (Core Features): 4 weeks
- **Phase 2** (Mobile & Sync): 4 weeks