'use client';

import { ReactNode } from 'react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-3',
  };

  const content = (
    <div className="text-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-violet-400 border-t-transparent border-l-transparent border-r-transparent mx-auto mb-4`}>
        <span className="sr-only">Loading</span>
      </div>
      <p className="text-gray-400 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        {content}
      </div>
    );
  }

  return content;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="mb-4 text-gray-600">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
  retry?: () => void;
  details?: string;
}

export function ErrorState({ title, message, retry, details }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <svg 
          className="w-16 h-16 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-red-400 mb-2">{title}</h3>
      {message && (
        <p className="text-gray-400 mb-4 max-w-md">{message}</p>
      )}
      {details && (
        <details className="mb-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
            Show technical details
          </summary>
          <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-gray-400 overflow-auto max-w-md">
            {details}
          </pre>
        </details>
      )}
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  color?: 'violet' | 'green' | 'blue' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  progress, 
  label, 
  color = 'violet',
  size = 'md'
}: ProgressBarProps) {
  const colorClasses = {
    violet: 'bg-violet-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
