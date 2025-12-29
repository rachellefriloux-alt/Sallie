/**
 * Electron main process for Sallie desktop app.
 */

const { app, BrowserWindow, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let tray;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

function startBackend() {
  if (isDev) {
    console.log('In dev mode, skipping backend spawn (assume running manually)');
    return;
  }

  // In production, the backend executable is in resources/sallie-backend/sallie-backend.exe
  // Note: On macOS/Linux the extension might be different or absent.
  const executableName = process.platform === 'win32' ? 'sallie-backend.exe' : 'sallie-backend';
  const backendPath = path.join(process.resourcesPath, 'sallie-backend', executableName);
  
  console.log('Starting backend from:', backendPath);

  try {
    backendProcess = spawn(backendPath, [], {
      cwd: path.join(process.resourcesPath, 'sallie-backend'),
      env: { ...process.env, SALLIE_PORT: '8000' },
      stdio: 'pipe' // Capture output
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      if (code !== 0 && !app.isQuitting) {
        // Don't show error box on exit, only if it crashes early
        console.error(`Backend exited with code ${code}`);
      }
    });
    
    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
      dialog.showErrorBox('Startup Error', `Failed to start Sallie backend:\n${err.message}`);
    });
    
  } catch (err) {
    console.error('Exception starting backend:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#2e1065', // Deep Indigo to match Gemini/INFJ theme
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

  if (isDev) {
    // Development: connect to local dev server
    mainWindow.loadURL('http://localhost:3000').catch((err) => {
      console.error('Failed to load dev server:', err);
      mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load the static export
    // We expect the 'out' folder from Next.js to be copied to 'app_ui' in the app bundle
    const indexPath = path.join(__dirname, 'app_ui', 'index.html');
    
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load UI:', err);
      // Fallback to the simple launcher if the full app isn't found
      mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (errorCode !== -3) {
      mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
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
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
    }
  } catch (err) {
    console.error('Failed to load tray icon:', err);
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
  startBackend();
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
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
});

