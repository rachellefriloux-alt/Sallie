# User Experience Improvements

This document describes the new user experience features added to Sallie to make it feel like a professional, polished application.

## New Features

### 1. Connection Status Indicator
- **Location**: Top right of the interface
- **Purpose**: Shows real-time status of all services (Backend, Ollama, Qdrant)
- **Usage**: Click to see detailed service information
- **Auto-refresh**: Status updates every 30 seconds

### 2. First Run Wizard
- **When**: Automatically appears on first launch
- **Purpose**: Guides users through initial setup and checks
- **Features**:
  - Verifies backend connection
  - Checks AI models availability
  - Validates memory system
  - Guides to Great Convergence if needed
  - Provides troubleshooting tips if services are down

### 3. Notification System
- **Location**: Top right corner
- **Types**: Success, Error, Warning, Info
- **Features**:
  - Auto-dismiss after 4-7 seconds (configurable)
  - Manual dismiss option
  - Action buttons for quick fixes
  - Stacked notifications for multiple alerts

### 4. Helpful Tooltips
- **Location**: Throughout the interface
- **Purpose**: Contextual help without cluttering the UI
- **Usage**: Hover over help icons (?) to see explanations
- **Features**:
  - Delayed appearance (300ms)
  - Smart positioning (auto-adjusts to screen edges)

### 5. Keyboard Shortcuts Panel
- **Access**: Press `Ctrl+/` or click the keyboard icon (bottom right)
- **Features**:
  - Organized by category (Navigation, Chat, Actions)
  - Visual key representations
  - Quick reference for power users

## Keyboard Shortcuts

### Navigation
- `Ctrl+K` - Focus chat input
- `Ctrl+B` - Toggle sidebar
- `Ctrl+L` - Open limbic view
- `Ctrl+H` - Open heritage browser
- `Ctrl+,` - Open settings

### Chat
- `Enter` - Send message
- `Shift+Enter` - New line
- `Ctrl+U` - Clear input
- `↑` - Edit last message

### Actions
- `Ctrl+N` - New conversation
- `Ctrl+S` - Save conversation
- `Ctrl+/` - Toggle keyboard shortcuts help
- `Esc` - Close dialogs

## Enhanced Error Handling

### Backend Disconnection
- **Detection**: Automatic, every 30 seconds
- **User Feedback**: Clear notification with troubleshooting steps
- **Graceful Degradation**: App remains usable, shows connection status

### Service Failures
- **Ollama Down**: Notification + info about limited AI features
- **Qdrant Down**: Notification + info about memory limitations
- **Auto-Recovery**: Attempts to reconnect when services come back online

### User-Friendly Error Messages
All errors now include:
- **What happened**: Clear, non-technical description
- **Why it matters**: Impact on functionality
- **How to fix**: Step-by-step troubleshooting
- **Need help?**: Links to documentation or support

## Best Practices for Users

### Starting Sallie
1. Make sure Docker Desktop is running
2. Run `./start-sallie.sh` (Linux/Mac) or `start-sallie.bat` (Windows)
3. Wait for all services to start (30-60 seconds)
4. Open http://localhost:3000
5. First Run Wizard will guide you through setup

### Monitoring Status
- Check the connection indicator (top right) before starting important tasks
- Green = All systems operational
- Yellow = Some services unavailable (limited features)
- Red = Backend disconnected (need to start services)

### Getting Help
- Press `Ctrl+/` to see all keyboard shortcuts
- Hover over `?` icons for contextual help
- Check notifications for important system messages
- Review `START_HERE.md` for setup instructions

## For Developers

### Adding New Notifications
```typescript
import { useNotifications } from '@/components/NotificationProvider';

const { showSuccess, showError, showWarning, showInfo } = useNotifications();

// Success
showSuccess('Operation completed', 'Your changes have been saved');

// Error with action
showError('Connection failed', 'Unable to reach backend', {
  label: 'Retry',
  onClick: () => retryConnection()
});
```

### Adding Tooltips
```tsx
import { Tooltip, HelpIcon } from '@/components/Tooltip';

// Simple tooltip
<Tooltip content="This is a helpful explanation">
  <button>Hover me</button>
</Tooltip>

// Help icon with tooltip
<span>
  Feature Name <HelpIcon content="Explanation of this feature" />
</span>
```

### Checking Connection Status
```typescript
// Component uses ConnectionStatus component
import { ConnectionStatus } from '@/components/ConnectionStatus';

// In your layout/header
<header>
  <ConnectionStatus />
</header>
```

## Troubleshooting

### First Run Wizard Shows Errors
1. Ensure Docker is running: `docker ps`
2. Start services: `./start-sallie.sh`
3. Wait 30-60 seconds for services to initialize
4. Refresh the browser
5. If still failing, check logs: `tail -f backend.log`

### Connection Status Always Red
1. Backend might not be running
2. Check if port 8000 is available: `lsof -i :8000`
3. Restart backend: `cd progeny_root && python -m uvicorn core.main:app --reload`
4. Check firewall settings

### Notifications Not Appearing
1. Check browser console for errors (F12)
2. Ensure NotificationProvider is in the app layout
3. Verify z-index is not being overridden by other elements

### Keyboard Shortcuts Not Working
1. Check if focus is in an input field
2. Some shortcuts only work in specific contexts
3. Browser extensions might be intercepting shortcuts
4. Try pressing `Ctrl+/` to open shortcuts panel and verify

## Future Improvements

Planned enhancements:
- [ ] Custom keyboard shortcut configuration
- [ ] Notification preferences (per-type)
- [ ] Advanced troubleshooting wizard
- [ ] In-app tutorial/walkthrough
- [ ] Contextual help based on user actions
- [ ] Service auto-restart on failure detection
- [ ] Offline mode with sync queue
- [ ] Progressive web app (PWA) features

## Feedback

These improvements are designed to make Sallie feel professional and user-friendly. If you have suggestions for additional features or improvements, please open an issue on GitHub.
