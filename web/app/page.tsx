'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SallieStudio } from '@/components/SallieStudio';
import { FirstRunWizard } from '@/components/FirstRunWizard';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLimbicState } from '@/hooks/useLimbicState';
import { useNotifications } from '@/hooks/useNotifications';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://192.168.1.47:8749';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    api: 'unknown',
    limbic: 'unknown',
    memory: 'unknown',
    agency: 'unknown',
    communication: 'unknown',
    sensors: 'unknown',
    genesis: 'unknown',
    heritage: 'unknown',
    convergence: 'unknown',
    dashboard: 'unknown'
  });

  // WebSocket connection for real-time updates
  const { 
    isConnected: wsConnected, 
    sendMessage, 
    lastMessage, 
    connectionStatus 
  } = useWebSocket(WS_URL);

  // Limbic state management
  const { 
    limbicState, 
    updateLimbicState, 
    getLimbicHistory 
  } = useLimbicState();

  // Notification system
  const { 
    notifications, 
    addNotification, 
    markAsRead 
  } = useNotifications();

  useEffect(() => {
    // Only check once on mount
    let mounted = true;
    
    // Check if first run flag exists in localStorage
    const hasCompletedFirstRun = localStorage.getItem('sallie_first_run_completed');
    
    const checkSystemStatus = async () => {
      try {
        // Check all service statuses
        const services = [
          'api', 'limbic', 'memory', 'agency', 'communication',
          'sensors', 'genesis', 'heritage', 'convergence', 'dashboard'
        ];
        
        const statusPromises = services.map(async (service) => {
          try {
            const response = await fetch(`${API_BASE.replace('/api', '')}/${service === 'api' ? '' : service}/health`, {
              signal: AbortSignal.timeout(3000)
            });
            if (response.ok) {
              const data = await response.json();
              return { [service]: data.status || 'healthy' };
            }
            return { [service]: 'unhealthy' };
          } catch (error) {
            return { [service]: 'unreachable' };
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = Object.assign({}, ...statuses);
        
        if (!mounted) return;
        
        setSystemStatus(statusMap);
        
        // Check convergence status
        const convergenceResponse = await fetch(`${API_BASE}/convergence/status`, {
          signal: AbortSignal.timeout(5000)
        });
        
        if (convergenceResponse.ok) {
          const convergenceData = await convergenceResponse.json();
          if (!convergenceData.completed) {
            setRedirecting(true);
            router.push('/convergence');
            return;
          }
        }
        
        // Show first run wizard if not completed before
        if (!hasCompletedFirstRun) {
          setShowFirstRun(true);
        }
        
        setChecking(false);
      } catch (error) {
        console.warn('System status check failed:', error);
        if (mounted) {
          if (!hasCompletedFirstRun) {
            setShowFirstRun(true);
          }
          setChecking(false);
        }
      }
    };

    checkSystemStatus();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        
        switch (data.type) {
          case 'limbic_update':
            if (data.data) {
              updateLimbicState(data.data);
            }
            break;
          case 'notification':
            if (data.data) {
              addNotification(data.data);
            }
            break;
          case 'system_status':
            if (data.data) {
              setSystemStatus(prev => ({ ...prev, ...data.data }));
            }
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage, updateLimbicState, addNotification]);

  const handleFirstRunComplete = () => {
    localStorage.setItem('sallie_first_run_completed', 'true');
    setShowFirstRun(false);
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Setup Complete',
      message: 'Sallie Studio is ready to use!',
      timestamp: new Date(),
      read: false
    });
  };

  if (checking || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-violet-300 opacity-20"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">
            {redirecting ? 'Redirecting to setup...' : 'Initializing Sallie Studio...'}
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div
                key={service}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'healthy' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : status === 'unhealthy'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}
              >
                {service}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFirstRun) {
    return <FirstRunWizard onComplete={handleFirstRunComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Connection Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-violet-500/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-sm font-medium">
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="text-sm">Services:</span>
                {Object.entries(systemStatus).map(([service, status]) => (
                  <div
                    key={service}
                    className={`w-2 h-2 rounded-full ${
                      status === 'healthy' ? 'bg-green-400' : 
                      status === 'unhealthy' ? 'bg-red-400' : 
                      'bg-yellow-400'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Limbic: T={limbicState.trust?.toFixed(2)} W={limbicState.warmth?.toFixed(2)} 
                A={limbicState.arousal?.toFixed(2)} V={limbicState.valence?.toFixed(2)}
              </div>
              {notifications.length > 0 && (
                <div className="relative">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Application */}
      <SallieStudio 
        limbicState={limbicState}
        systemStatus={systemStatus}
        notifications={notifications}
        onNotificationRead={markAsRead}
        wsConnected={wsConnected}
        sendMessage={sendMessage}
      />
    </div>
  );
}
