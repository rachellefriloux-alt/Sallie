/**
 * Control screen for mobile app.
 * Creator control mechanisms - take control, emergency stop, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import APIClient from '../services/api_client';

interface ControlStatus {
  creator_has_control: boolean;
  emergency_stop_active: boolean;
  state_locked: boolean;
  can_proceed: boolean;
  last_control_ts: number | null;
  control_reason: string | null;
}

interface HistoryEntry {
  action: string;
  timestamp: number;
  reason?: string;
}

export function ControlScreen() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ControlStatus>({
    creator_has_control: false,
    emergency_stop_active: false,
    state_locked: false,
    can_proceed: true,
    last_control_ts: null,
    control_reason: null,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { isTablet, fontSize, spacing } = useTabletLayout();
  const apiClient = React.useRef(new APIClient()).current;

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the API
      // For now, using default values
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeControl = () => {
    Alert.alert(
      'Take Control',
      'This will give you full control over Sallie. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Control',
          onPress: async () => {
            console.log('Taking control...');
            setStatus((prev) => ({ ...prev, creator_has_control: true }));
          },
        },
      ]
    );
  };

  const handleReleaseControl = () => {
    console.log('Releasing control...');
    setStatus((prev) => ({ ...prev, creator_has_control: false }));
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      '🛑 Emergency Stop',
      'This will immediately halt all autonomous actions. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'STOP',
          style: 'destructive',
          onPress: async () => {
            console.log('Emergency stop activated!');
            setStatus((prev) => ({ ...prev, emergency_stop_active: true }));
          },
        },
      ]
    );
  };

  const handleResume = () => {
    console.log('Resuming operations...');
    setStatus((prev) => ({ ...prev, emergency_stop_active: false }));
  };

  const handleLockState = () => {
    console.log('Locking state...');
    setStatus((prev) => ({ ...prev, state_locked: true }));
  };

  const handleUnlockState = () => {
    console.log('Unlocking state...');
    setStatus((prev) => ({ ...prev, state_locked: false }));
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return 'Never';
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Control Panel
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Creator control mechanisms
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={styles.loader} />
      ) : (
        <>
          {/* Status Overview */}
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Control Mode</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: status.creator_has_control ? '#f59e0b' : '#10b981' },
                  ]}
                >
                  {status.creator_has_control ? 'Creator Control' : 'Autonomous'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Emergency Stop</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: status.emergency_stop_active ? '#ef4444' : '#10b981' },
                  ]}
                >
                  {status.emergency_stop_active ? 'ACTIVE' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>State Lock</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: status.state_locked ? '#f59e0b' : '#10b981' },
                  ]}
                >
                  {status.state_locked ? 'Locked' : 'Unlocked'}
                </Text>
              </View>
            </View>
          </View>

          {/* Control Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Control Actions</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, !status.creator_has_control && styles.actionButtonPrimary]}
                onPress={handleTakeControl}
                disabled={status.creator_has_control}
              >
                <Text style={styles.actionButtonText}>Take Control</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, status.creator_has_control && styles.actionButtonPrimary]}
                onPress={handleReleaseControl}
                disabled={!status.creator_has_control}
              >
                <Text style={styles.actionButtonText}>Release Control</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, !status.state_locked && styles.actionButtonSecondary]}
                onPress={handleLockState}
                disabled={status.state_locked}
              >
                <Text style={styles.actionButtonText}>Lock State</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, status.state_locked && styles.actionButtonSecondary]}
                onPress={handleUnlockState}
                disabled={!status.state_locked}
              >
                <Text style={styles.actionButtonText}>Unlock State</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Emergency Controls */}
          <View style={[styles.actionsContainer, styles.emergencyContainer]}>
            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
              Emergency Controls
            </Text>
            <Text style={styles.emergencyWarning}>
              Use only in emergency situations. Emergency stop will immediately halt
              all autonomous actions.
            </Text>
            <View style={styles.emergencyButtons}>
              <TouchableOpacity
                style={[
                  styles.emergencyButton,
                  status.emergency_stop_active && styles.emergencyButtonActive,
                ]}
                onPress={handleEmergencyStop}
                disabled={status.emergency_stop_active}
              >
                <Text style={styles.emergencyButtonText}>🛑 EMERGENCY STOP</Text>
              </TouchableOpacity>
              {status.emergency_stop_active && (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={handleResume}
                >
                  <Text style={styles.resumeButtonText}>Resume Operations</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Control History */}
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {history.length === 0 ? (
              <Text style={styles.emptyText}>No recent control activity</Text>
            ) : (
              history.map((entry, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <Text style={styles.historyAction}>{entry.action}</Text>
                  <Text style={styles.historyTime}>
                    {formatTimestamp(entry.timestamp)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  containerTablet: {
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
  },
  contentTablet: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  loader: {
    marginTop: 40,
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusItem: {
    flex: 1,
    minWidth: 100,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#7c3aed',
  },
  actionButtonSecondary: {
    backgroundColor: '#4b5563',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emergencyContainer: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  emergencyWarning: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  emergencyButtons: {
    gap: 12,
  },
  emergencyButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  emergencyButtonActive: {
    opacity: 0.5,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resumeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  historyAction: {
    color: '#fff',
  },
  historyTime: {
    color: '#6b7280',
    fontSize: 12,
  },
});
