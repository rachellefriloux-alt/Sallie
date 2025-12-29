'use client';

import { useEffect, useState } from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ServiceStatus {
  backend: 'connected' | 'disconnected' | 'checking';
  ollama: 'connected' | 'disconnected' | 'checking';
  qdrant: 'connected' | 'disconnected' | 'checking';
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<ServiceStatus>({
    backend: 'checking',
    ollama: 'checking',
    qdrant: 'checking',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkServices = async () => {
    const newStatus: ServiceStatus = {
      backend: 'checking',
      ollama: 'checking',
      qdrant: 'checking',
    };

    // Check backend
    try {
      const response = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        newStatus.backend = 'connected';
        
        // Check Ollama status from health endpoint
        if (data.services?.ollama === 'healthy') {
          newStatus.ollama = 'connected';
        } else {
          newStatus.ollama = 'disconnected';
        }
        
        // Check Qdrant status from health endpoint
        if (data.services?.qdrant === 'healthy') {
          newStatus.qdrant = 'connected';
        } else {
          newStatus.qdrant = 'disconnected';
        }
      } else {
        newStatus.backend = 'disconnected';
        newStatus.ollama = 'disconnected';
        newStatus.qdrant = 'disconnected';
      }
    } catch (error) {
      newStatus.backend = 'disconnected';
      newStatus.ollama = 'disconnected';
      newStatus.qdrant = 'disconnected';
    }

    setStatus(newStatus);
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): 'good' | 'degraded' | 'down' => {
    if (status.backend === 'connected' && status.ollama === 'connected' && status.qdrant === 'connected') {
      return 'good';
    } else if (status.backend === 'connected') {
      return 'degraded';
    } else {
      return 'down';
    }
  };

  const overallStatus = getOverallStatus();

  const StatusIcon = () => {
    switch (overallStatus) {
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const StatusText = () => {
    switch (overallStatus) {
      case 'good':
        return <span className="text-green-500">All Systems Operational</span>;
      case 'degraded':
        return <span className="text-yellow-500">Some Services Unavailable</span>;
      case 'down':
        return <span className="text-red-500">Backend Disconnected</span>;
    }
  };

  const getServiceIcon = (serviceStatus: 'connected' | 'disconnected' | 'checking') => {
    switch (serviceStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        title="Service Status"
      >
        <StatusIcon />
        <span className="text-sm hidden md:inline">
          <StatusText />
        </span>
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="font-semibold text-white">Service Status</h3>
              <button
                onClick={() => checkServices()}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Backend API</span>
                <div className="flex items-center space-x-2">
                  {getServiceIcon(status.backend)}
                  <span className="text-xs text-gray-400 capitalize">
                    {status.backend}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Ollama (AI)</span>
                <div className="flex items-center space-x-2">
                  {getServiceIcon(status.ollama)}
                  <span className="text-xs text-gray-400 capitalize">
                    {status.ollama}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Qdrant (Memory)</span>
                <div className="flex items-center space-x-2">
                  {getServiceIcon(status.qdrant)}
                  <span className="text-xs text-gray-400 capitalize">
                    {status.qdrant}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            </div>

            {overallStatus === 'down' && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-300 mb-2">Troubleshooting:</p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>Check if backend is running</li>
                  <li>Verify Docker services are started</li>
                  <li>Run: <code className="bg-gray-900 px-1">./start-sallie.sh</code></li>
                </ul>
              </div>
            )}

            {overallStatus === 'degraded' && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-300 mb-2">Note:</p>
                <p className="text-xs text-gray-400">
                  Some features may be limited. Check that Docker services are running.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
