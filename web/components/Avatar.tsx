'use client';

interface AvatarProps {
  isConnected: boolean;
}

export function Avatar({ isConnected }: AvatarProps) {
  return (
    <div className="text-center py-5" role="region" aria-label="Sallie avatar">
      <div
        className="w-36 h-36 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-1 
                   shadow-lg shadow-primary/40 animate-pulse"
      >
        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
          <span className="text-5xl font-semibold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            S
          </span>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Sallie
      </h2>
      
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-success animate-pulse' : 'bg-error'
          }`}
          aria-label={isConnected ? 'Online' : 'Offline'}
        />
        <span>{isConnected ? 'Online' : 'Connecting...'}</span>
      </div>
    </div>
  );
}

