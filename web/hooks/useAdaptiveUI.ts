/**
 * Adaptive UI System
 * Implements role-based layouts that adapt to different contexts and situations
 */

import { useState, useEffect, useCallback } from 'react';

export type UIRole = 'work' | 'personal' | 'crisis' | 'creative' | 'learning' | 'default';

export interface UILayout {
  role: UIRole;
  layout: {
    sidebar: boolean;
    header: boolean;
    footer: boolean;
    mainContent: string;
    components: string[];
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    mode: 'light' | 'dark' | 'auto';
  };
  features: {
    quickActions: boolean;
    commandPalette: boolean;
    multiWorkflow: boolean;
    focusMode: boolean;
    notifications: boolean;
  };
  sallieCustomization: {
    avatarStyle: string;
    voiceTone: string;
    communicationStyle: string;
    visualElements: string[];
  };
}

export interface RoleDetection {
  currentRole: UIRole;
  confidence: number;
  context: string;
  triggers: string[];
  timestamp: Date;
}

export interface AdaptiveUIConfig {
  roleDetection: {
    enabled: boolean;
    automatic: boolean;
    manualOverride: boolean;
    learningEnabled: boolean;
  };
  transitions: {
    enabled: boolean;
    duration: number;
    easing: string;
    animations: boolean;
  };
  sallieControl: {
    canCustomizeTheme: boolean;
    canCustomizeLayout: boolean;
    canCustomizeAvatar: boolean;
    requiresApproval: boolean;
  };
}

const defaultLayouts: Record<UIRole, UILayout> = {
  work: {
    role: 'work',
    layout: {
      sidebar: true,
      header: true,
      footer: false,
      mainContent: 'task-focused',
      components: ['project-manager', 'code-editor', 'file-browser', 'task-list', 'calendar']
    },
    theme: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      accent: '#10B981',
      background: '#1F2937',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: true,
      multiWorkflow: true,
      focusMode: true,
      notifications: false
    },
    sallieCustomization: {
      avatarStyle: 'professional',
      voiceTone: 'focused',
      communicationStyle: 'concise',
      visualElements: ['productivity-indicators', 'progress-bars', 'timers']
    }
  },
  
  personal: {
    role: 'personal',
    layout: {
      sidebar: false,
      header: true,
      footer: true,
      mainContent: 'conversational',
      components: ['chat-interface', 'limbic-display', 'memory-browser', 'quick-actions']
    },
    theme: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#F59E0B',
      background: '#1F1F1F',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: false,
      multiWorkflow: false,
      focusMode: false,
      notifications: true
    },
    sallieCustomization: {
      avatarStyle: 'friendly',
      voiceTone: 'warm',
      communicationStyle: 'conversational',
      visualElements: ['emotional-indicators', 'conversation-flow', 'personal-insights']
    }
  },
  
  crisis: {
    role: 'crisis',
    layout: {
      sidebar: false,
      header: true,
      footer: false,
      mainContent: 'simplified',
      components: ['emergency-actions', 'quick-help', 'status-display', 'calming-interface']
    },
    theme: {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FBBF24',
      background: '#1F1F1F',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: false,
      multiWorkflow: false,
      focusMode: true,
      notifications: true
    },
    sallieCustomization: {
      avatarStyle: 'supportive',
      voiceTone: 'calm',
      communicationStyle: 'reassuring',
      visualElements: ['breathing-indicators', 'support-messages', 'quick-actions']
    }
  },
  
  creative: {
    role: 'creative',
    layout: {
      sidebar: true,
      header: true,
      footer: false,
      mainContent: 'inspiration-focused',
      components: ['idea-board', 'media-browser', 'creative-tools', 'inspiration-feed', 'collaboration']
    },
    theme: {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#8B5CF6',
      background: '#2D1B69',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: true,
      multiWorkflow: true,
      focusMode: false,
      notifications: false
    },
    sallieCustomization: {
      avatarStyle: 'artistic',
      voiceTone: 'inspired',
      communicationStyle: 'expressive',
      visualElements: ['creative-inspirations', 'artistic-elements', 'idea-sparkles']
    }
  },
  
  learning: {
    role: 'learning',
    layout: {
      sidebar: true,
      header: true,
      footer: false,
      mainContent: 'research-focused',
      components: ['knowledge-base', 'research-tools', 'note-taking', 'progress-tracker', 'insights']
    },
    theme: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#3B82F6',
      background: '#1F2937',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: true,
      multiWorkflow: false,
      focusMode: true,
      notifications: false
    },
    sallieCustomization: {
      avatarStyle: 'scholarly',
      voiceTone: 'curious',
      communicationStyle: 'educational',
      visualElements: ['knowledge-graphs', 'learning-progress', 'insight-indicators']
    }
  },
  
  default: {
    role: 'default',
    layout: {
      sidebar: true,
      header: true,
      footer: true,
      mainContent: 'balanced',
      components: ['dashboard', 'quick-overview', 'recent-activity', 'notifications']
    },
    theme: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#F59E0B',
      background: '#1F1F1F',
      mode: 'dark'
    },
    features: {
      quickActions: true,
      commandPalette: true,
      multiWorkflow: false,
      focusMode: false,
      notifications: true
    },
    sallieCustomization: {
      avatarStyle: 'balanced',
      voiceTone: 'adaptive',
      communicationStyle: 'versatile',
      visualElements: ['status-indicators', 'activity-feed', 'quick-info']
    }
  }
};

export function useAdaptiveUI() {
  const [currentRole, setCurrentRole] = useState<UIRole>('default');
  const [currentLayout, setCurrentLayout] = useState<UILayout>(defaultLayouts.default);
  const [roleDetection, setRoleDetection] = useState<RoleDetection>({
    currentRole: 'default',
    confidence: 0.5,
    context: 'initial',
    triggers: [],
    timestamp: new Date()
  });
  const [config, setConfig] = useState<AdaptiveUIConfig>({
    roleDetection: {
      enabled: true,
      automatic: true,
      manualOverride: true,
      learningEnabled: true
    },
    transitions: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      animations: true
    },
    sallieControl: {
      canCustomizeTheme: true,
      canCustomizeLayout: true,
      canCustomizeAvatar: true,
      requiresApproval: false
    }
  });

  // Detect role based on context
  const detectRole = useCallback((context: string, triggers: string[]): UIRole => {
    if (!config.roleDetection.enabled) return currentRole;
    
    const contextLower = context.toLowerCase();
    const triggersLower = triggers.map(t => t.toLowerCase());
    
    // Crisis detection (highest priority)
    if (contextLower.includes('crisis') || contextLower.includes('emergency') ||
        contextLower.includes('urgent') || contextLower.includes('help') ||
        triggersLower.some(t => t.includes('stress') || t.includes('anxiety'))) {
      return 'crisis';
    }
    
    // Work detection
    if (contextLower.includes('work') || contextLower.includes('project') ||
        contextLower.includes('task') || contextLower.includes('deadline') ||
        contextLower.includes('meeting') || contextLower.includes('productivity') ||
        triggersLower.some(t => t.includes('work') || t.includes('task'))) {
      return 'work';
    }
    
    // Creative detection
    if (contextLower.includes('creative') || contextLower.includes('art') ||
        contextLower.includes('design') || contextLower.includes('inspiration') ||
        contextLower.includes('idea') || contextLower.includes('brainstorm') ||
        triggersLower.some(t => t.includes('creative') || t.includes('art'))) {
      return 'creative';
    }
    
    // Learning detection
    if (contextLower.includes('learn') || contextLower.includes('study') ||
        contextLower.includes('research') || contextLower.includes('knowledge') ||
        contextLower.includes('education') || contextLower.includes('skill') ||
        triggersLower.some(t => t.includes('learn') || t.includes('study'))) {
      return 'learning';
    }
    
    // Personal detection
    if (contextLower.includes('personal') || contextLower.includes('life') ||
        contextLower.includes('family') || contextLower.includes('friends') ||
        contextLower.includes('relationship') || contextLower.includes('wellbeing') ||
        triggersLower.some(t => t.includes('personal') || t.includes('life'))) {
      return 'personal';
    }
    
    return 'default';
  }, [currentRole, config.roleDetection.enabled]);

  // Switch to a specific role
  const switchRole = useCallback((role: UIRole, context?: string) => {
    const newLayout = defaultLayouts[role];
    
    setCurrentRole(role);
    setCurrentLayout(newLayout);
    setRoleDetection({
      currentRole: role,
      confidence: 1.0,
      context: context || 'manual_switch',
      triggers: [],
      timestamp: new Date()
    });
    
    console.log(`[ADAPTIVE UI] Switched to ${role} role`);
  }, []);

  // Update layout based on Sallie's preferences
  const updateLayoutFromSallie = useCallback((customizations: Partial<UILayout>) => {
    if (!config.sallieControl.canCustomizeLayout) return;
    
    setCurrentLayout(prev => ({
      ...prev,
      ...customizations
    }));
    
    console.log(`[ADAPTIVE UI] Layout updated by Sallie`);
  }, [config.sallieControl.canCustomizeLayout]);

  // Update theme based on Sallie's preferences
  const updateThemeFromSallie = useCallback((theme: Partial<UILayout['theme']>) => {
    if (!config.sallieControl.canCustomizeTheme) return;
    
    setCurrentLayout(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...theme
      }
    }));
    
    console.log(`[ADAPTIVE UI] Theme updated by Sallie`);
  }, [config.sallieControl.canCustomizeTheme]);

  // Update Sallie customization
  const updateSallieCustomization = useCallback((customization: Partial<UILayout['sallieCustomization']>) => {
    setCurrentLayout(prev => ({
      ...prev,
      sallieCustomization: {
        ...prev.sallieCustomization,
        ...customization
      }
    }));
    
    console.log(`[ADAPTIVE UI] Sallie customization updated`);
  }, []);

  // Get available roles
  const getAvailableRoles = useCallback((): UIRole[] => {
    return Object.keys(defaultLayouts) as UIRole[];
  }, []);

  // Get role suggestions based on current context
  const getRoleSuggestions = useCallback((context: string): UIRole[] => {
    const suggestions: UIRole[] = [];
    const contextLower = context.toLowerCase();
    
    // Suggest roles based on context keywords
    if (contextLower.includes('work') || contextLower.includes('task')) {
      suggestions.push('work');
    }
    if (contextLower.includes('personal') || contextLower.includes('life')) {
      suggestions.push('personal');
    }
    if (contextLower.includes('creative') || contextLower.includes('art')) {
      suggestions.push('creative');
    }
    if (contextLower.includes('learn') || contextLower.includes('study')) {
      suggestions.push('learning');
    }
    
    return suggestions;
  }, []);

  // Enable/disable automatic role detection
  const toggleAutomaticDetection = useCallback((enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      roleDetection: {
        ...prev.roleDetection,
        automatic: enabled
      }
    }));
  }, []);

  // Enable/disable Sallie control
  const toggleSallieControl = useCallback((enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      sallieControl: {
        ...prev.sallieControl,
        canCustomizeTheme: enabled,
        canCustomizeLayout: enabled,
        canCustomizeAvatar: enabled
      }
    }));
  }, []);

  // Auto-detect role based on context changes
  useEffect(() => {
    if (!config.roleDetection.automatic) return;
    
    // This would integrate with context detection system
    // For now, we'll simulate with time-based detection
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      let detectedRole: UIRole = 'default';
      
      // Time-based role detection (example)
      if (hour >= 9 && hour <= 17) {
        detectedRole = 'work';
      } else if (hour >= 18 && hour <= 22) {
        detectedRole = 'personal';
      } else if (hour >= 23 || hour <= 6) {
        detectedRole = 'default';
      }
      
      if (detectedRole !== currentRole) {
        switchRole(detectedRole, 'time_based_detection');
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [config.roleDetection.automatic, currentRole, switchRole]);

  return {
    currentRole,
    currentLayout,
    roleDetection,
    config,
    availableRoles: getAvailableRoles(),
    
    // Actions
    switchRole,
    updateLayoutFromSallie,
    updateThemeFromSallie,
    updateSallieCustomization,
    getRoleSuggestions,
    toggleAutomaticDetection,
    toggleSallieControl,
    
    // Detection
    detectRole
  };
}
