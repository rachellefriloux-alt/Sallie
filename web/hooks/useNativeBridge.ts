/**
 * React hook for Sallie Desktop native bridge integration
 * 
 * Provides React components with access to native desktop features
 * when running inside the Sallie Desktop app (WebView2).
 */

import { useState, useEffect, useCallback } from 'react';
import nativeBridge, { Plugin, CloudSyncStatus, BridgeResponse } from '@/lib/native-bridge';

interface UseNativeBridgeResult {
  /** Whether running in Sallie Desktop app */
  isDesktop: boolean;
  /** Desktop app version (null if not desktop) */
  version: string | null;
  /** Whether the native bridge is connected and responding */
  isConnected: boolean;
  /** List of installed plugins */
  plugins: Plugin[];
  /** Cloud sync status */
  cloudSyncStatus: CloudSyncStatus;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message from last operation */
  error: string | null;
  
  // Actions
  /** Show native toast notification */
  showNotification: (title: string, body: string) => void;
  /** Trigger cloud sync */
  triggerSync: () => Promise<void>;
  /** Execute a plugin command */
  executePlugin: (pluginId: string, commandName: string) => Promise<string | null>;
  /** Toggle plugin enabled state */
  togglePlugin: (pluginId: string, enabled: boolean) => Promise<boolean>;
  /** Run system script */
  runScript: (script: 'start-all.ps1' | 'stop-all.ps1' | 'health-check.ps1') => Promise<string | null>;
  /** Get native setting */
  getSetting: <T>(key: string) => Promise<T | null>;
  /** Set native setting */
  setSetting: (key: string, value: unknown) => Promise<boolean>;
  /** Open developer console */
  openDevConsole: () => void;
  /** Refresh plugins list */
  refreshPlugins: () => Promise<void>;
  /** Refresh sync status */
  refreshSyncStatus: () => Promise<void>;
}

export function useNativeBridge(): UseNativeBridgeResult {
  const [isDesktop] = useState(() => nativeBridge.isDesktop());
  const [version, setVersion] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    enabled: false,
    status: 'idle'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    if (!isDesktop) return;

    const init = async () => {
      try {
        // Check connection
        const connected = await nativeBridge.ping();
        setIsConnected(connected);

        if (connected) {
          // Get version
          const ver = await nativeBridge.getVersion();
          setVersion(ver);

          // Load plugins
          const pluginList = await nativeBridge.getPlugins();
          setPlugins(pluginList);

          // Get sync status
          const syncStatus = await nativeBridge.getCloudSyncStatus();
          setCloudSyncStatus(syncStatus);
        }
      } catch (err) {
        console.error('[useNativeBridge] Init error:', err);
        setError('Failed to initialize native bridge');
      }
    };

    init();
  }, [isDesktop]);

  const showNotification = useCallback((title: string, body: string) => {
    nativeBridge.showNotification(title, body);
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isDesktop) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      setCloudSyncStatus(prev => ({ ...prev, status: 'syncing' }));
      const response = await nativeBridge.triggerCloudSync();
      
      if (response.success) {
        setCloudSyncStatus(prev => ({ 
          ...prev, 
          status: 'idle',
          lastSync: new Date().toISOString()
        }));
      } else {
        setCloudSyncStatus(prev => ({ ...prev, status: 'error' }));
        setError(response.error || 'Sync failed');
      }
    } catch (err) {
      setCloudSyncStatus(prev => ({ ...prev, status: 'error' }));
      setError('Failed to trigger sync');
    } finally {
      setIsLoading(false);
    }
  }, [isDesktop]);

  const executePlugin = useCallback(async (pluginId: string, commandName: string): Promise<string | null> => {
    if (!isDesktop) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await nativeBridge.executePlugin(pluginId, commandName);
      
      if (response.success) {
        return response.data || null;
      } else {
        setError(response.error || 'Plugin execution failed');
        return null;
      }
    } catch (err) {
      setError('Failed to execute plugin');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isDesktop]);

  const togglePlugin = useCallback(async (pluginId: string, enabled: boolean): Promise<boolean> => {
    if (!isDesktop) return false;
    
    try {
      const response = await nativeBridge.togglePlugin(pluginId, enabled);
      
      if (response.success) {
        // Update local state
        setPlugins(prev => prev.map(p => 
          p.id === pluginId ? { ...p, enabled } : p
        ));
        return true;
      } else {
        setError(response.error || 'Failed to toggle plugin');
        return false;
      }
    } catch (err) {
      setError('Failed to toggle plugin');
      return false;
    }
  }, [isDesktop]);

  const runScript = useCallback(async (
    script: 'start-all.ps1' | 'stop-all.ps1' | 'health-check.ps1'
  ): Promise<string | null> => {
    if (!isDesktop) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await nativeBridge.runScript(script);
      
      if (response.success) {
        return response.data || null;
      } else {
        setError(response.error || 'Script execution failed');
        return null;
      }
    } catch (err) {
      setError('Failed to run script');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isDesktop]);

  const getSetting = useCallback(async <T>(key: string): Promise<T | null> => {
    if (!isDesktop) return null;
    return nativeBridge.getSetting<T>(key);
  }, [isDesktop]);

  const setSetting = useCallback(async (key: string, value: unknown): Promise<boolean> => {
    if (!isDesktop) return false;
    return nativeBridge.setSetting(key, value);
  }, [isDesktop]);

  const openDevConsole = useCallback(() => {
    nativeBridge.openDevConsole();
  }, []);

  const refreshPlugins = useCallback(async () => {
    if (!isDesktop) return;
    
    try {
      const pluginList = await nativeBridge.getPlugins();
      setPlugins(pluginList);
    } catch (err) {
      setError('Failed to refresh plugins');
    }
  }, [isDesktop]);

  const refreshSyncStatus = useCallback(async () => {
    if (!isDesktop) return;
    
    try {
      const status = await nativeBridge.getCloudSyncStatus();
      setCloudSyncStatus(status);
    } catch (err) {
      setError('Failed to refresh sync status');
    }
  }, [isDesktop]);

  return {
    isDesktop,
    version,
    isConnected,
    plugins,
    cloudSyncStatus,
    isLoading,
    error,
    showNotification,
    triggerSync,
    executePlugin,
    togglePlugin,
    runScript,
    getSetting,
    setSetting,
    openDevConsole,
    refreshPlugins,
    refreshSyncStatus,
  };
}

export default useNativeBridge;
