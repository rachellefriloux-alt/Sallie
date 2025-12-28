/**
 * Sync screen for mobile app.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { syncClient } from '../services/sync_client';

export function SyncScreen() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await syncClient.getSyncStatus();
      setLastSync(status.last_sync ? new Date(status.last_sync) : null);
      setDevices(status.devices || []);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await syncClient.requestFullSync();
      setSyncStatus('success');
      setLastSync(new Date());
      await loadSyncStatus();
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed:', error);
    } finally {
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last Sync</Text>
          <Text style={styles.statusValue}>
            {lastSync ? lastSync.toLocaleString() : 'Never'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusIndicator}>
            {syncStatus === 'syncing' && <ActivityIndicator size="small" color="#6366f1" />}
            <Text style={styles.statusValue}>
              {syncStatus === 'syncing' ? 'Syncing...' : 
               syncStatus === 'success' ? 'Success' :
               syncStatus === 'error' ? 'Error' : 'Idle'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        {devices.length === 0 ? (
          <Text style={styles.emptyText}>No devices connected</Text>
        ) : (
          devices.map((device, index) => (
            <View key={index} style={styles.deviceRow}>
              <View>
                <Text style={styles.deviceName}>{device.name || device.device_id}</Text>
                <Text style={styles.deviceInfo}>
                  {device.platform} • Last seen: {device.last_sync ? new Date(device.last_sync).toLocaleString() : 'Never'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.button, syncStatus === 'syncing' && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statusValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  deviceInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

