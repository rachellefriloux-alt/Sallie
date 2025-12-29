/**
 * Electron main process for Sallie desktop app.
 */

const { app, BrowserWindow, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the web UI (could be local React app or remote)
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  if (isDev) {
    // Development: connect to local dev server
    mainWindow.loadURL('http://localhost:3000').catch((err) => {
      console.error('Failed to load dev server:', err);
      dialog.showErrorBox(
        'Connection Error',
        'Could not connect to development server at http://localhost:3000\n\n' +
        'Make sure the web dev server is running:\n' +
        'cd web && npm run dev'
      );
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: try web server first, fallback to local file
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // Fallback to local HTML file
      mainWindow.loadFile(path.join(__dirname, 'public', 'index.html')).catch((err) => {
        console.error('Failed to load UI:', err);
        dialog.showErrorBox(
          'Startup Error',
          'Could not load Sallie interface.\n\n' +
          'Please ensure:\n' +
          '1. Backend is running (./start-sallie.sh)\n' +
          '2. Web app is accessible at http://localhost:3000'
        );
      });
    });
  }

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (errorCode !== -3) { // -3 is ABORTED, which is normal for redirects
      mainWindow.loadFile(path.join(__dirname, 'public', 'index.html')).catch(() => {
        // Show error page if fallback also fails
        mainWindow.loadURL('data:text/html,<h1>Connection Error</h1><p>Cannot connect to Sallie backend.</p><p>Please start the backend server first.</p>');
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent window from closing, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create system tray icon
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      // Fallback to main icon if tray icon doesn't exist
      icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
    }
  } catch (err) {
    console.error('Failed to load tray icon:', err);
    // Create a simple colored icon as fallback
    icon = nativeImage.createEmpty();
  }
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Sallie',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Check Connection',
      click: async () => {
        const http = require('http');
        const checkHealth = () => {
          return new Promise((resolve) => {
            http.get('http://localhost:8000/health', (res) => {
              resolve(res.statusCode === 200);
            }).on('error', () => {
              resolve(false);
            });
          });
        };
        
        const isHealthy = await checkHealth();
        dialog.showMessageBox({
          type: isHealthy ? 'info' : 'warning',
          title: 'Connection Status',
          message: isHealthy 
            ? '✓ Connected to backend\nStatus: Healthy' 
            : '✗ Cannot connect to backend\nPlease start the backend server',
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Open Backend URL',
      click: () => {
        require('electron').shell.openExternal('http://localhost:8000/docs');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  
  tray.setToolTip('Sallie - Digital Progeny');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
  
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('window-all-closed', () => {
  // Keep app running in system tray
  // Don't quit on macOS or Windows
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
});

