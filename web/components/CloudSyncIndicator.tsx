'use client';

import { useNativeBridge } from '@/hooks/useNativeBridge';
import { 
  CloudIcon, 
  CloudArrowUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'unknown';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return 'unknown';
  }
}

export function CloudSyncIndicator() {
  const { 
    isDesktop, 
    cloudSyncStatus,
    isLoading,
    triggerSync,
    refreshSyncStatus
  } = useNativeBridge();

  if (!isDesktop || !cloudSyncStatus.enabled) {
    return null;
  }

  const getStatusIcon = () => {
    switch (cloudSyncStatus.status) {
      case 'syncing':
        return <CloudArrowUpIcon className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'idle':
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    }
  };

  const getStatusText = () => {
    switch (cloudSyncStatus.status) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
      case 'idle':
        return cloudSyncStatus.lastSync 
          ? `Last sync: ${formatRelativeTime(cloudSyncStatus.lastSync)}`
          : 'Ready to sync';
      default:
        return 'Unknown status';
    }
  };

  const handleSync = async () => {
    if (cloudSyncStatus.status === 'syncing') return;
    try {
      await triggerSync();
      await refreshSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
      // Error state is already handled by the hook
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">
            {cloudSyncStatus.provider ? `${cloudSyncStatus.provider} Sync` : 'Cloud Sync'}
          </span>
          <span className="text-sm text-gray-300">{getStatusText()}</span>
        </div>
      </div>
      <button
        onClick={handleSync}
        disabled={cloudSyncStatus.status === 'syncing' || isLoading}
        className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Sync now"
      >
        <ArrowPathIcon className={`w-4 h-4 text-gray-400 ${cloudSyncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

export function CloudSyncIndicatorCompact() {
  const { isDesktop, cloudSyncStatus } = useNativeBridge();

  if (!isDesktop || !cloudSyncStatus.enabled) {
    return null;
  }

  const getStatusColor = () => {
    switch (cloudSyncStatus.status) {
      case 'syncing':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'idle':
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className="flex items-center gap-1" title={`Cloud sync: ${cloudSyncStatus.status}`}>
      <CloudIcon className={`w-4 h-4 ${getStatusColor()} ${cloudSyncStatus.status === 'syncing' ? 'animate-pulse' : ''}`} />
    </div>
  );
}
