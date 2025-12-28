/**
 * Electron preload script
 * Provides secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electron', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // System tray
  showTrayMenu: () => ipcRenderer.send('tray:showMenu'),
  
  // Backend connection
  setBackendUrl: (url) => ipcRenderer.invoke('backend:setUrl', url),
  getBackendUrl: () => ipcRenderer.invoke('backend:getUrl'),
  testBackendConnection: () => ipcRenderer.invoke('backend:test'),
  
  // Storage
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
  
  // Notifications
  notify: (title, body) => ipcRenderer.send('notification:show', { title, body }),
  
  // Events
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});
