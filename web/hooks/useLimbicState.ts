'use client';

import { useState, useEffect, useCallback } from 'react';

type LimbicState = {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: 'COMPANION' | 'COPILOT' | 'PEER' | 'EXPERT';
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
  last_interaction_ts?: number;
  interaction_count?: number;
  flags?: string[];
  door_slam_active?: boolean;
  crisis_active?: boolean;
  elastic_mode?: boolean;
};

type LimbicHistory = {
  timestamp: number;
  state: LimbicState;
  event?: string;
};

export function useLimbicState() {
  const [limbicState, setLimbicState] = useState<LimbicState>({
    trust: 0.5,
    warmth: 0.6,
    arousal: 0.7,
    valence: 0.6,
    posture: 'PEER',
    empathy: 0.5,
    intuition: 0.6,
    creativity: 0.5,
    wisdom: 0.5,
    humor: 0.4,
    last_interaction_ts: Date.now(),
    interaction_count: 0,
    flags: [],
    door_slam_active: false,
    crisis_active: false,
    elastic_mode: false
  });

  const [history, setHistory] = useState<LimbicHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_LIMBIC_URL || 'http://192.168.1.47:8750';

  // Fetch current limbic state
  const fetchLimbicState = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/state`);
      if (!response.ok) {
        throw new Error('Failed to fetch limbic state');
      }
      const data = await response.json();
      setLimbicState(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching limbic state:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Fetch limbic history
  const fetchLimbicHistory = useCallback(async (limit: number = 100) => {
    try {
      const response = await fetch(`${API_URL}/api/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch limbic history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching limbic history:', error);
    }
  }, [API_URL]);

  // Update limbic state
  const updateLimbicState = useCallback(async (updates: Partial<LimbicState>) => {
    try {
      const response = await fetch(`${API_URL}/api/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update limbic state');
      }

      const updatedState = await response.json();
      setLimbicState(updatedState);
      
      // Add to history
      setHistory(prev => [...prev, {
        timestamp: Date.now(),
        state: updatedState,
        event: 'manual_update'
      }].slice(-1000)); // Keep last 1000 entries
      
      return updatedState;
    } catch (error) {
      console.error('Error updating limbic state:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [API_URL]);

  // Apply interaction effect
  const applyInteraction = useCallback(async (type: 'positive' | 'negative' | 'neutral', intensity: number = 0.1) => {
    try {
      const response = await fetch(`${API_URL}/api/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, intensity }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply interaction');
      }

      const updatedState = await response.json();
      setLimbicState(updatedState);
      
      // Add to history
      setHistory(prev => [...prev, {
        timestamp: Date.now(),
        state: updatedState,
        event: `interaction_${type}`
      }].slice(-1000));
      
      return updatedState;
    } catch (error) {
      console.error('Error applying interaction:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [API_URL]);

  // Set posture
  const setPosture = useCallback(async (posture: LimbicState['posture']) => {
    return updateLimbicState({ posture });
  }, [updateLimbicState]);

  // Trigger elastic mode
  const triggerElasticMode = useCallback(async (enabled: boolean) => {
    return updateLimbicState({ elastic_mode: enabled });
  }, [updateLimbicState]);

  // Reset to baseline
  const resetToBaseline = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset limbic state');
      }

      const resetState = await response.json();
      setLimbicState(resetState);
      
      // Add to history
      setHistory(prev => [...prev, {
        timestamp: Date.now(),
        state: resetState,
        event: 'reset_to_baseline'
      }].slice(-1000));
      
      return resetState;
    } catch (error) {
      console.error('Error resetting limbic state:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [API_URL]);

  // Get posture color for visualization
  const getPostureColor = useCallback((posture?: LimbicState['posture']) => {
    const currentPosture = posture || limbicState.posture;
    switch (currentPosture) {
      case 'COMPANION': return 'rgb(34, 197, 94)'; // green
      case 'COPILOT': return 'rgb(59, 130, 246)'; // blue
      case 'PEER': return 'rgb(168, 85, 247)'; // purple
      case 'EXPERT': return 'rgb(251, 146, 60)'; // orange
      default: return 'rgb(107, 114, 128)'; // gray
    }
  }, [limbicState.posture]);

  // Get emotion description
  const getEmotionDescription = useCallback(() => {
    const { trust, warmth, arousal, valence, posture } = limbicState;
    
    if (valence > 0.7 && arousal > 0.7) return 'Excited & Happy';
    if (valence > 0.7 && arousal < 0.3) return 'Calm & Content';
    if (valence < 0.3 && arousal > 0.7) return 'Agitated & Upset';
    if (valence < 0.3 && arousal < 0.3) return 'Sad & Tired';
    
    if (trust > 0.8 && warmth > 0.8) return 'Deeply Connected';
    if (trust < 0.3 && warmth < 0.3) return 'Distant & Cautious';
    
    return posture;
  }, [limbicState]);

  // Initialize on mount
  useEffect(() => {
    fetchLimbicState();
    fetchLimbicHistory();
  }, [fetchLimbicState, fetchLimbicHistory]);

  // Set up periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLimbicState();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchLimbicState]);

  return {
    limbicState,
    history,
    loading,
    error,
    updateLimbicState,
    applyInteraction,
    setPosture,
    triggerElasticMode,
    resetToBaseline,
    getPostureColor,
    getEmotionDescription,
    fetchLimbicState,
    fetchLimbicHistory
  };
}
