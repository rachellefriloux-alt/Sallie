'use client';

import React from 'react';
import { ConnectionStatus } from '@/hooks/usePremiumWebSocket';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connectionQuality: number;
  latency: number;
  encryptionEnabled: boolean;
  className?: string;
}

export function ConnectionIndicator({
  isConnected,
  connectionStatus,
  connectionQuality,
  latency,
  encryptionEnabled,
  className = ''
}: ConnectionIndicatorProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return connectionQuality > 80 ? 'bg-green-500' : connectionQuality > 50 ? 'bg-yellow-500' : 'bg-orange-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-blue-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return connectionQuality > 80 ? 'Excellent' : connectionQuality > 50 ? 'Good' : 'Fair';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getLatencyColor = () => {
    if (latency < 50) return 'text-green-400';
    if (latency < 150) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityColor = () => {
    if (connectionQuality > 80) return 'text-green-400';
    if (connectionQuality > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Neural Link Icon */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} transition-all duration-300`}>
          {isConnected && (
            <div className={`absolute inset-0 rounded-full ${getStatusColor()} animate-ping opacity-75`}></div>
          )}
        </div>
        
        {/* Encryption Indicator */}
        {encryptionEnabled && isConnected && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs">🔒</span>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-300">{getStatusText()}</span>
        
        {/* Quality Indicator */}
        {isConnected && (
          <>
            <span className={`text-xs ${getQualityColor()}`}>
              {connectionQuality}%
            </span>
            
            {/* Latency Indicator */}
            <span className={`text-xs ${getLatencyColor()}`}>
              {latency}ms
            </span>
          </>
        )}
      </div>

      {/* Neural Pulse Animation */}
      {isConnected && (
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      )}
    </div>
  );
}

// Compact version for minimal UI
export function CompactConnectionIndicator({
  isConnected,
  connectionStatus,
  connectionQuality,
  encryptionEnabled,
  className = ''
}: Omit<ConnectionIndicatorProps, 'latency'>) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return connectionQuality > 80 ? 'bg-green-500' : connectionQuality > 50 ? 'bg-yellow-500' : 'bg-orange-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-blue-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} transition-all duration-300`}>
          {isConnected && (
            <div className={`absolute inset-0 rounded-full ${getStatusColor()} animate-ping opacity-75`}></div>
          )}
        </div>
        
        {/* Encryption Indicator */}
        {encryptionEnabled && isConnected && (
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
}

// Premium version with more details
export function PremiumConnectionIndicator({
  isConnected,
  connectionStatus,
  connectionQuality,
  latency,
  encryptionEnabled,
  className = ''
}: ConnectionIndicatorProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return connectionQuality > 80 ? 'from-green-500 to-green-600' : 
               connectionQuality > 50 ? 'from-yellow-500 to-yellow-600' : 
               'from-orange-500 to-orange-600';
      case 'connecting':
      case 'reconnecting':
        return 'from-blue-500 to-blue-600';
      case 'disconnected':
        return 'from-gray-400 to-gray-500';
      case 'error':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return connectionQuality > 80 ? 'Neural Link Established' : 
               connectionQuality > 50 ? 'Connection Stable' : 
               'Connection Degraded';
      case 'connecting':
        return 'Establishing Neural Link...';
      case 'reconnecting':
        return 'Re-establishing Connection...';
      case 'disconnected':
        return 'Neural Link Offline';
      case 'error':
        return 'Connection Error';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <div className={`bg-black bg-opacity-30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Neural Link Icon */}
          <div className="relative">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getStatusColor()} transition-all duration-300`}>
              {isConnected && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getStatusColor()} animate-ping opacity-75`}></div>
              )}
            </div>
            
            {/* Encryption Indicator */}
            {encryptionEnabled && isConnected && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs">🔒</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <div className="text-sm font-medium text-white">{getStatusText()}</div>
            {isConnected && (
              <div className="text-xs text-gray-400">
                Quality: {connectionQuality}% • Latency: {latency}ms
              </div>
            )}
          </div>
        </div>

        {/* Neural Pulse Animation */}
        {isConnected && (
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        )}
      </div>

      {/* Connection Quality Bar */}
      {isConnected && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Signal Strength</span>
            <span className="text-gray-300">{connectionQuality}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getStatusColor()}`}
              style={{ width: `${connectionQuality}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Security Status */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Security</span>
          <span className={encryptionEnabled ? 'text-green-400' : 'text-yellow-400'}>
            {encryptionEnabled ? '🔒 Encrypted' : '🔓 Unencrypted'}
          </span>
        </div>
      </div>
    </div>
  );
}
