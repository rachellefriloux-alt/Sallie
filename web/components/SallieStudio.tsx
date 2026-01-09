'use client';

import React from 'react';
import { SallieStudioOS } from './SallieStudioOS';

interface SallieStudioProps {
  limbicState?: any;
  systemStatus?: any;
  notifications?: any[];
  onNotificationRead?: (id: string) => void;
  wsConnected?: boolean;
  sendMessage?: (message: string | object) => boolean;
}

export function SallieStudio(props: SallieStudioProps) {
  return (
    <div className="studio-container h-screen overflow-hidden">
      <SallieStudioOS {...props} />
    </div>
  );
}
