/**
 * Native Bridge for Sallie Desktop App
 * 
 * This module provides a TypeScript interface for communicating with the native
 * WinUI desktop shell when the web app is running inside WebView2.
 * 
 * When running in a browser (not desktop), all methods gracefully degrade
 * with no-op implementations or return appropriate defaults.
 */

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  commands?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface CloudSyncStatus {
  enabled: boolean;
  lastSync?: string;
  provider?: string;
  status: 'idle' | 'syncing' | 'error';
}

export interface BridgeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

type BridgeMessageHandler = (response: BridgeResponse) => void;

class NativeBridge {
  private isDesktopEnv: boolean;
  private responseHandlers: Map<string, BridgeMessageHandler[]> = new Map();

  constructor() {
    // Check if we're running in WebView2 desktop environment
    this.isDesktopEnv = this.detectDesktopEnvironment();
    
    if (this.isDesktopEnv) {
      this.setupResponseListener();
    }
  }

  /**
   * Detect if running inside Sallie Desktop (WebView2)
   */
  private detectDesktopEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for WebView2 bridge
    const hasWebView2 = !!(window as any).chrome?.webview;
    
    // Also check for our custom bridge flag
    const hasSallieBridge = !!(window as any).sallieBridge;
    
    return hasWebView2 || hasSallieBridge;
  }

  /**
   * Setup listener for responses from native code
   */
  private setupResponseListener(): void {
    window.addEventListener('sallieBridgeResponse', ((event: CustomEvent<BridgeResponse>) => {
      const detail = event.detail;
      const type = (detail as any).type?.replace('Response', '') || '';
      
      const handlers = this.responseHandlers.get(type);
      if (handlers) {
        handlers.forEach(handler => handler(detail));
      }
    }) as EventListener);
  }

  /**
   * Send message to native code via WebView2
   */
  private postMessage(message: object): void {
    if (!this.isDesktopEnv) return;
    
    try {
      (window as any).chrome?.webview?.postMessage(JSON.stringify(message));
    } catch (error) {
      console.error('[NativeBridge] Failed to post message:', error);
    }
  }

  /**
   * Send message and wait for response
   */
  private async postMessageWithResponse<T>(
    type: string, 
    payload: object = {},
    timeout: number = 5000
  ): Promise<BridgeResponse<T>> {
    if (!this.isDesktopEnv) {
      return { success: false, error: 'Not running in desktop environment' };
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({ success: false, error: 'Request timed out' });
      }, timeout);

      const handler: BridgeMessageHandler = (response) => {
        clearTimeout(timeoutId);
        this.removeResponseHandler(type, handler);
        resolve(response as BridgeResponse<T>);
      };

      this.addResponseHandler(type, handler);
      this.postMessage({ type, ...payload });
    });
  }

  private addResponseHandler(type: string, handler: BridgeMessageHandler): void {
    const handlers = this.responseHandlers.get(type) || [];
    handlers.push(handler);
    this.responseHandlers.set(type, handlers);
  }

  private removeResponseHandler(type: string, handler: BridgeMessageHandler): void {
    const handlers = this.responseHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.responseHandlers.set(type, handlers);
    }
  }

  // ========== Public API ==========

  /**
   * Check if running in Sallie Desktop app
   */
  isDesktop(): boolean {
    return this.isDesktopEnv;
  }

  /**
   * Get desktop app version
   */
  async getVersion(): Promise<string | null> {
    if (!this.isDesktopEnv) return null;
    
    const response = await this.postMessageWithResponse<string>('getVersion');
    return response.success ? (response.data as string) : null;
  }

  /**
   * Show native Windows toast notification
   */
  showNotification(title: string, body: string): void {
    if (!this.isDesktopEnv) {
      // Fallback to browser notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }
    
    this.postMessage({ type: 'notification', title, body });
  }

  /**
   * Trigger cloud sync
   */
  async triggerCloudSync(): Promise<BridgeResponse> {
    if (!this.isDesktopEnv) {
      return { success: false, error: 'Cloud sync only available in desktop app' };
    }
    
    return this.postMessageWithResponse('cloudSync');
  }

  /**
   * Get cloud sync status
   */
  async getCloudSyncStatus(): Promise<CloudSyncStatus> {
    if (!this.isDesktopEnv) {
      return { enabled: false, status: 'idle' };
    }
    
    const response = await this.postMessageWithResponse<CloudSyncStatus>('getCloudSyncStatus');
    return response.success && response.data 
      ? response.data 
      : { enabled: false, status: 'idle' };
  }

  /**
   * Get list of installed plugins
   */
  async getPlugins(): Promise<Plugin[]> {
    if (!this.isDesktopEnv) return [];
    
    const response = await this.postMessageWithResponse<Plugin[]>('getPlugins');
    return response.success && response.data ? response.data : [];
  }

  /**
   * Execute a plugin command
   */
  async executePlugin(pluginId: string, commandName: string): Promise<BridgeResponse<string>> {
    if (!this.isDesktopEnv) {
      return { success: false, error: 'Plugins only available in desktop app' };
    }
    
    return this.postMessageWithResponse<string>('executePlugin', { pluginId, command: commandName });
  }

  /**
   * Toggle plugin enabled/disabled state
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<BridgeResponse> {
    if (!this.isDesktopEnv) {
      return { success: false, error: 'Plugins only available in desktop app' };
    }
    
    return this.postMessageWithResponse('togglePlugin', { pluginId, enabled });
  }

  /**
   * Run a system script (start-all, stop-all, health-check)
   */
  async runScript(scriptName: 'start-all.ps1' | 'stop-all.ps1' | 'health-check.ps1'): Promise<BridgeResponse<string>> {
    if (!this.isDesktopEnv) {
      return { success: false, error: 'Scripts only available in desktop app' };
    }
    
    return this.postMessageWithResponse<string>('runScript', { scriptName });
  }

  /**
   * Get a native setting value
   */
  async getSetting<T = unknown>(key: string): Promise<T | null> {
    if (!this.isDesktopEnv) return null;
    
    const response = await this.postMessageWithResponse<T>('getSetting', { key });
    return response.success ? (response.data ?? null) : null;
  }

  /**
   * Set a native setting value
   */
  async setSetting(key: string, value: unknown): Promise<boolean> {
    if (!this.isDesktopEnv) return false;
    
    const response = await this.postMessageWithResponse('setSetting', { key, value });
    return response.success;
  }

  /**
   * Open the native developer console window
   */
  openDevConsole(): void {
    if (!this.isDesktopEnv) {
      // Fallback: open browser dev tools hint
      console.log('Press F12 to open browser developer tools');
      return;
    }
    
    this.postMessage({ type: 'openDevConsole' });
  }

  /**
   * Ping the native bridge to check connection
   */
  async ping(): Promise<boolean> {
    if (!this.isDesktopEnv) return false;
    
    const response = await this.postMessageWithResponse('ping', {}, 2000);
    return response.success && response.data === 'pong';
  }
}

// Singleton instance
const nativeBridge = new NativeBridge();

export default nativeBridge;
export { NativeBridge };
