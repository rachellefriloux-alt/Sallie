# Desktop App Consolidation Plan

## Overview

Consolidate the Electron desktop app (`desktop/`) and SallieStudioApp (WinUI) into a single unified Windows desktop application that:
- Uses the **web app UI** (React/Next.js) via WebView2 for the main interface
- Retains all **SallieStudioApp features** (plugins, cloud sync, tray, etc.) as native components
- Provides **seamless integration** between the web UI and native Windows features

## Current State Analysis

### Electron App (desktop/)
| Feature | Implementation | Notes |
|---------|---------------|-------|
| UI | Loads web app via Chromium | React/Next.js interface |
| System Tray | Electron Tray API | Show/Hide, Quit |
| Backend Spawning | child_process.spawn | Starts sallie-backend.exe |
| Notifications | Electron notification API | Basic notifications |
| Storage | electron-store | Local settings |
| Cross-platform | Windows, macOS, Linux | electron-builder |

### SallieStudioApp (WinUI 3)
| Feature | Implementation | Notes |
|---------|---------------|-------|
| UI | Native XAML pages | Chat, Limbic, Heritage, etc. |
| System Tray | NotifyIcon + ContextMenuStrip | Start/Stop All, Health Check |
| Plugin System | Extensions folder with plugin.json | Script execution, enable/disable |
| Cloud Sync | CloudSyncManager with encryption | Config, logs, health data |
| Developer Console | Command execution with autocomplete | Environment inspection |
| Themes | Dark/Light XAML resources | SallieTheme.xaml |
| Auto-Start | Registry manipulation | AutoStart helper |
| Setup Wizard | First-run configuration | Backend detection, Docker check |
| Script Runner | PowerShell execution | start-all.ps1, stop-all.ps1 |
| WebSocket | Native ClientWebSocket | Real-time backend communication |

## Target Architecture

```
SallieStudioApp (Consolidated)
├── Native Shell (WinUI 3 + .NET 8)
│   ├── MainWindow with WebView2
│   ├── System Tray Integration
│   ├── Native Settings Panel (optional overlay)
│   └── Developer Console Window
├── WebView2 Content
│   └── Web App (localhost:3000 or embedded)
│       ├── Chat Interface
│       ├── Limbic Dashboard
│       ├── Heritage Browser
│       ├── Settings Panel
│       └── All other pages
├── Native Services
│   ├── Plugin Loader + Executor
│   ├── Cloud Sync Manager
│   ├── Backend Process Manager
│   └── Script Runner
└── Bridge Layer
    └── JavaScript <-> C# interop for native features
```

## Implementation Phases

### Phase 1: WebView2 Integration
**Goal**: Replace native XAML pages with WebView2 hosting the web app

#### Tasks
- [ ] Add WebView2 NuGet package to SallieStudioApp
- [ ] Create WebView2-based MainContent area in MainWindow
- [ ] Configure WebView2 to load web app from localhost:3000 or embedded files
- [ ] Remove or deprecate native XAML page files (ChatPage, LimbicPage, etc.)
- [ ] Keep MainWindow frame for tray icon, native toolbar, and window chrome
- [ ] Handle WebView2 navigation events and error fallbacks

#### Files to Modify
- `SallieStudioApp/SallieStudioApp.csproj` - Add WebView2 package
- `SallieStudioApp/MainWindow.xaml` - Replace Frame navigation with WebView2
- `SallieStudioApp/MainWindow.xaml.cs` - Initialize WebView2, handle events

#### Files to Remove/Archive
- `SallieStudioApp/ChatPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/LimbicPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/HeritagePage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/ThoughtsPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/HypothesesPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/ConvergencePage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/ProjectsPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/ControlPage.xaml(.cs)` - Replaced by web UI
- `SallieStudioApp/SyncPage.xaml(.cs)` - Replaced by web UI

### Phase 2: JavaScript-C# Bridge
**Goal**: Enable web app to access native features via postMessage bridge

#### Tasks
- [ ] Create `NativeBridge.cs` class for handling web messages
- [ ] Register JavaScript object via WebView2 AddHostObjectToScript
- [ ] Implement message handlers for native features:
  - Notifications (toast notifications)
  - Cloud sync trigger
  - Plugin execution
  - Script running (Start All, Stop All, Health Check)
  - Settings persistence
  - Developer console open
- [ ] Update web app to detect desktop environment and use bridge

#### Bridge API Design
```typescript
// Web app side - window.sallieBridge
interface SallieBridge {
  // Notifications
  showNotification(title: string, body: string): void;
  
  // Cloud Sync
  triggerCloudSync(): Promise<void>;
  getCloudSyncStatus(): Promise<CloudSyncStatus>;
  
  // Plugins
  getPlugins(): Promise<Plugin[]>;
  executePlugin(pluginId: string, commandName: string): Promise<string>;
  togglePlugin(pluginId: string, enabled: boolean): Promise<void>;
  
  // Scripts
  runScript(scriptName: string): Promise<string>;
  
  // Settings
  getSetting(key: string): Promise<any>;
  setSetting(key: string, value: any): Promise<void>;
  
  // Developer Console
  openDevConsole(): void;
  
  // App Info
  getVersion(): string;
  isDesktop(): boolean;
}
```

#### Files to Create
- `SallieStudioApp/Bridge/NativeBridge.cs` - C# bridge implementation
- `SallieStudioApp/Bridge/BridgeHandlers.cs` - Individual feature handlers
- `web/lib/native-bridge.ts` - TypeScript wrapper for bridge

### Phase 3: Native Feature Preservation
**Goal**: Ensure all SallieStudioApp features work with new architecture

#### Tasks
- [ ] Update TrayIcon to work with WebView2 window
- [ ] Modify CloudSyncManager to expose status to bridge
- [ ] Update PluginLoader/Executor to work via bridge
- [ ] Keep DeveloperConsole as separate native window
- [ ] Preserve SetupWizard for first-run experience
- [ ] Maintain theme system (apply to window chrome, tray menu)

#### Files to Keep and Update
- `SallieStudioApp/Tray/TrayIcon.cs` - Keep, update window reference
- `SallieStudioApp/Cloud/*` - Keep all cloud sync code
- `SallieStudioApp/Helpers/*` - Keep plugin/script helpers
- `SallieStudioApp/DeveloperConsole.xaml(.cs)` - Keep as separate window
- `SallieStudioApp/SetupWizard.xaml(.cs)` - Keep for first-run
- `SallieStudioApp/SettingsPage.xaml(.cs)` - Consider keeping for native-only settings

### Phase 4: Web App Integration Points
**Goal**: Add desktop-aware UI elements to web app

#### Tasks
- [ ] Detect desktop environment in web app
- [ ] Add native settings section to web SettingsPanel when on desktop
- [ ] Add plugin management UI to web app (when desktop detected)
- [ ] Add cloud sync status indicator to web app
- [ ] Add quick actions toolbar for desktop (Start/Stop All, Dev Console)
- [ ] Style web app window chrome area appropriately

#### Files to Modify (Web App)
- `web/lib/native-bridge.ts` - Bridge wrapper with fallbacks
- `web/hooks/useNativeBridge.ts` - React hook for bridge access
- `web/components/SettingsPanel.tsx` - Add desktop settings section
- `web/components/DesktopToolbar.tsx` - New component for desktop actions
- `web/components/PluginManager.tsx` - New component for plugin UI
- `web/components/CloudSyncStatus.tsx` - New component for sync status

### Phase 5: Cleanup and Retirement
**Goal**: Remove Electron app and consolidate documentation

#### Tasks
- [ ] Archive or delete `desktop/` folder
- [ ] Update build scripts to only build SallieStudioApp
- [ ] Update documentation (README, install guides)
- [ ] Update CI/CD pipelines
- [ ] Remove Electron-related scripts (launch.sh, launch.bat in desktop/)
- [ ] Update DEPLOYMENT_GUIDE.md

#### Files to Archive/Delete
- `desktop/` entire folder
- References in root scripts that mention Electron

## Feature Mapping

| Feature | Electron | SallieStudioApp | Consolidated |
|---------|----------|-----------------|--------------|
| Main UI | Web via Chromium | Native XAML | Web via WebView2 |
| System Tray | Electron Tray | NotifyIcon | NotifyIcon (keep) |
| Backend Spawn | child_process | ScriptRunner | ScriptRunner (keep) |
| Notifications | Electron API | ToastNotification | ToastNotification (keep) |
| Storage | electron-store | Config files | Config files + bridge |
| Plugins | N/A | Plugin system | Plugin system (keep) |
| Cloud Sync | N/A | CloudSyncManager | CloudSyncManager (keep) |
| Dev Console | DevTools | DeveloperConsole | DeveloperConsole (keep) |
| Themes | CSS | XAML resources | XAML + CSS |
| Auto-start | N/A | AutoStart helper | AutoStart helper (keep) |
| Setup Wizard | N/A | SetupWizard | SetupWizard (keep) |

## Technical Considerations

### WebView2 Requirements
- Microsoft Edge WebView2 Runtime must be installed
- Can be included in installer (Evergreen bootstrapper)
- Falls back to installed Edge if runtime not found

### Communication Pattern
```
Web App (JavaScript)
    ↓ window.chrome.webview.postMessage()
WebView2 (Native)
    ↓ WebMessageReceived event
NativeBridge (C#)
    ↓ Handler methods
Native Services (Cloud, Plugins, etc.)
```

### Cross-Platform Sync Architecture

**Critical Requirement**: Mobile, Web, Android, and Desktop must ALL sync seamlessly.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Sallie Backend API                          │
│                   /api/sync/settings                             │
│                   /api/sync/state                                │
│                   /api/sync/history                              │
└─────────────────────────────────────────────────────────────────┘
          ↑              ↑              ↑              ↑
     ┌────┴────┐    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
     │ Desktop │    │   Web   │    │ Android │    │  Mobile │
     │ WinUI   │    │ Next.js │    │  Kotlin │    │   iOS   │
     │ +Bridge │    │         │    │         │    │  Swift  │
     └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

**What Syncs Across ALL Platforms:**
| Data | Sync Direction | Storage |
|------|---------------|---------|
| User preferences | Bidirectional | Backend DB |
| Voice settings | Bidirectional | Backend DB |
| Theme preference | Bidirectional | Backend DB |
| Limbic state | Pull from backend | Backend only |
| Chat history | Bidirectional | Backend DB |
| Convergence progress | Bidirectional | Backend DB |
| Heritage/Projects | Bidirectional | Backend DB |
| Plugin states | Desktop only | Local config |

**Sync Strategy:**
1. **Backend as Source of Truth**: All user data lives in the backend
2. **Local Cache**: Each platform caches for offline/performance
3. **Sync Triggers**:
   - App startup: Pull latest from backend
   - Settings change: Push to backend immediately
   - Background: Periodic sync every 5 minutes
   - Manual: User-triggered sync button
4. **Conflict Resolution**: Last-write-wins with server timestamp
5. **Offline Mode**: Queue changes, sync when online

**API Endpoints Needed:**
```
GET  /api/sync/settings     - Get all user settings
POST /api/sync/settings     - Update settings
GET  /api/sync/state        - Get limbic/convergence state
GET  /api/sync/history      - Get chat history
POST /api/sync/history      - Save chat messages
GET  /api/sync/status       - Get sync status/timestamp
```

**Platform-Specific Notes:**
- **Desktop (WinUI)**: Uses CloudSyncManager for encrypted backup + API sync
- **Web**: Uses Zustand store with API sync hooks
- **Android**: Uses Room DB local cache + Retrofit for API
- **iOS/Mobile**: Uses CoreData local cache + URLSession for API

### Error Handling
- WebView2 load failures: Show native error page with retry
- Backend not running: Setup wizard or error screen
- Bridge errors: Log to developer console, graceful degradation

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| WebView2 not installed | Bundle Evergreen bootstrapper in installer |
| Performance overhead | WebView2 is optimized, minimal overhead |
| Bridge complexity | Well-defined API, TypeScript types |
| Feature parity | Comprehensive mapping, testing checklist |
| Breaking changes | Gradual rollout, feature flags |

## Success Criteria

1. Single installable app (SallieStudioApp)
2. Web app UI loads correctly in WebView2
3. All tray features work (Start/Stop, Health Check, Show/Hide)
4. Plugin system accessible from web UI
5. Cloud sync functional with status visible
6. Developer console opens as separate window
7. First-run wizard works
8. Auto-start option works
9. Native notifications work
10. No Electron app in repository

## Timeline Recommendation

- **Phase 1** (WebView2): Foundation work
- **Phase 2** (Bridge): Core integration
- **Phase 3** (Features): Preserve functionality
- **Phase 4** (Web UI): Polish integration
- **Phase 5** (Cleanup): Finalize consolidation

## Files Summary

### New Files to Create
- `SallieStudioApp/Bridge/NativeBridge.cs`
- `SallieStudioApp/Bridge/BridgeHandlers.cs`
- `web/lib/native-bridge.ts`
- `web/hooks/useNativeBridge.ts`
- `web/components/DesktopToolbar.tsx`
- `web/components/PluginManager.tsx`
- `web/components/CloudSyncStatus.tsx`

### Files to Modify
- `SallieStudioApp/SallieStudioApp.csproj`
- `SallieStudioApp/MainWindow.xaml`
- `SallieStudioApp/MainWindow.xaml.cs`
- `SallieStudioApp/Tray/TrayIcon.cs`
- `web/components/SettingsPanel.tsx`
- `web/components/Dashboard.tsx`

### Files to Remove (after consolidation)
- `desktop/` entire directory
- Native XAML page files (replaced by web UI)

---

*Plan created: December 2025*
*Status: Draft - Pending Review*
