import React from 'react';
import { NativeModules, Platform } from 'react-native';

// Types for discovery
export interface SallieDevice {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  lastSeen: Date;
}

export interface DiscoveryState {
  isScanning: boolean;
  devices: SallieDevice[];
  connectedDevice: SallieDevice | null;
  error: string | null;
}

class DiscoveryService {
  private listeners: ((state: DiscoveryState) => void)[] = [];
  private state: DiscoveryState = {
    isScanning: false,
    devices: [],
    connectedDevice: null,
    error: null,
  };

  constructor() {
    // Initialize discovery based on platform
    if (Platform.OS === 'android') {
      this.initializeAndroidDiscovery();
    } else if (Platform.OS === 'ios') {
      this.initializeIOSDiscovery();
    }
  }

  // Subscribe to state changes
  subscribe(listener: (state: DiscoveryState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Update state and notify listeners
  private setState(updates: Partial<DiscoveryState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Android discovery using react-native-zeroconf
  private async initializeAndroidDiscovery() {
    try {
      // Check if Zeroconf module is available
      const { Zeroconf } = NativeModules;
      
      if (!Zeroconf) {
        console.warn('Zeroconf not available, falling back to API discovery');
        this.setState({ 
          error: 'Zeroconf not available, using API discovery' 
        });
        return;
      }

      // Initialize Zeroconf
      await Zeroconf.init();
      
      // Scan for Sallie services
      Zeroconf.scanServiceType('_http._tcp.', 'local.');
      
      // Listen for discovered services
      Zeroconf.addServiceListener((service: any) => {
        if (service.name.includes('sallie') || service.name.includes('Sallie')) {
          const device: SallieDevice = {
            id: service.name,
            name: service.name,
            host: service.host,
            port: service.port,
            version: 'unknown',
            lastSeen: new Date(),
          };
          
          this.addDevice(device);
        }
      });

    } catch (error) {
      console.error('Failed to initialize Android discovery:', error);
      this.setState({ 
        error: 'Failed to initialize discovery' 
      });
    }
  }

  // iOS discovery using Bonjour
  private async initializeIOSDiscovery() {
    try {
      // iOS uses NSNetService for Bonjour discovery
      // This would need to be implemented via native module
      console.log('iOS discovery not yet implemented, falling back to API');
      this.setState({ 
        error: 'iOS discovery not yet implemented' 
      });
    } catch (error) {
      console.error('Failed to initialize iOS discovery:', error);
      this.setState({ 
        error: 'Failed to initialize discovery' 
      });
    }
  }

  // Add discovered device
  private addDevice(device: SallieDevice) {
    const existingDevice = this.state.devices.find(d => d.id === device.id);
    
    if (existingDevice) {
      // Update existing device
      this.setState({
        devices: this.state.devices.map(d => 
          d.id === device.id ? { ...device, lastSeen: new Date() } : d
        )
      });
    } else {
      // Add new device
      this.setState({
        devices: [...this.state.devices, device]
      });
    }
  }

  // Start scanning for devices
  async startScanning() {
    try {
      this.setState({ isScanning: true, error: null });
      
      // Try API discovery as fallback
      await this.apiDiscovery();
      
    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.setState({ 
        isScanning: false,
        error: 'Failed to start scanning' 
      });
    }
  }

  // API-based discovery (fallback)
  private async apiDiscovery() {
    try {
      // Try common local network ranges
      const commonRanges = [
        '192.168.1.100', // Common mini PC IP
        '192.168.1.50',
        '192.168.0.100',
        '192.168.0.50',
        'localhost',
        '127.0.0.1'
      ];

      for (const host of commonRanges) {
        try {
          const response = await fetch(`http://${host}:8000/api/health`, {
            timeout: 2000,
          });
          
          if (response.ok) {
            const data = await response.json();
            const device: SallieDevice = {
              id: `api-${host}`,
              name: `Sallie (${data.version || 'Unknown'})`,
              host,
              port: 8000,
              version: data.version || 'unknown',
              lastSeen: new Date(),
            };
            
            this.addDevice(device);
            break; // Found a device, stop searching
          }
        } catch {
          // Continue trying other hosts
          continue;
        }
      }
    } catch (error) {
      console.error('API discovery failed:', error);
    } finally {
      this.setState({ isScanning: false });
    }
  }

  // Stop scanning
  stopScanning() {
    this.setState({ isScanning: false });
    
    // Stop Zeroconf scanning if available
    if (Platform.OS === 'android' && NativeModules.Zeroconf) {
      try {
        NativeModules.Zeroconf.stop();
      } catch (error) {
        console.error('Failed to stop Zeroconf:', error);
      }
    }
  }

  // Connect to a device
  async connectToDevice(device: SallieDevice) {
    try {
      // Test connection
      const response = await fetch(`http://${device.host}:${device.port}/api/health`, {
        timeout: 5000,
      });
      
      if (response.ok) {
        this.setState({ 
          connectedDevice: device,
          error: null 
        });
        return true;
      } else {
        throw new Error('Device not responding');
      }
    } catch (error) {
      this.setState({ 
        error: 'Failed to connect to device',
        connectedDevice: null 
      });
      return false;
    }
  }

  // Disconnect from current device
  disconnect() {
    this.setState({ 
      connectedDevice: null 
    });
  }

  // Get current state
  getState(): DiscoveryState {
    return { ...this.state };
  }

  // Refresh device list
  async refresh() {
    this.setState({ devices: [] });
    await this.startScanning();
  }

  // Cleanup
  cleanup() {
    this.stopScanning();
    this.listeners = [];
  }
}

// Export singleton instance
export const discoveryService = new DiscoveryService();

// Export hook for React components
export const useDiscovery = () => {
  const [state, setState] = React.useState<DiscoveryState>(discoveryService.getState());
  
  React.useEffect(() => {
    const unsubscribe = discoveryService.subscribe(setState);
    return unsubscribe;
  }, []);
  
  return {
    ...state,
    startScanning: discoveryService.startScanning.bind(discoveryService),
    stopScanning: discoveryService.stopScanning.bind(discoveryService),
    connectToDevice: discoveryService.connectToDevice.bind(discoveryService),
    disconnect: discoveryService.disconnect.bind(discoveryService),
    refresh: discoveryService.refresh.bind(discoveryService),
  };
};
