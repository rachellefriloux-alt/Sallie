'use client';

import React, { useState, useEffect } from 'react';
import { NavigationRail } from './NavigationRail';
import { WorkspaceArea } from './WorkspaceArea';
import { PresencePanel } from './PresencePanel';
import { FloatingMessenger } from './FloatingMessenger';

export function SallieStudio() {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');
  const [salliePresence, setSalliePresence] = useState({
    online: true,
    thinking: false,
    mood: 'peaceful',
    energy: 85
  });

  return (
    <div className="studio-container flex h-screen overflow-hidden">
      {/* Left Navigation Rail */}
      <NavigationRail 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onMessengerToggle={() => setIsMessengerOpen(!isMessengerOpen)}
      />
      
      {/* Center Workspace */}
      <WorkspaceArea 
        activeSection={activeSection}
        className="flex-1"
      />
      
      {/* Right Presence Panel */}
      <PresencePanel 
        presence={salliePresence}
        onPresenceUpdate={setSalliePresence}
        className="w-80"
      />
      
      {/* Floating Messenger (overlay) */}
      {isMessengerOpen && (
        <FloatingMessenger
          isOpen={isMessengerOpen}
          onClose={() => setIsMessengerOpen(false)}
          presence={salliePresence}
        />
      )}
    </div>
  );
}
