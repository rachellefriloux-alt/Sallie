/**
 * Settings screen for mobile app.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useLimbicStore } from '../store/useLimbicStore';

export function SettingsScreen() {
  const { state } = useLimbicStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [syncEnabled, setSyncEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>API Endpoint</Text>
          <Text style={styles.settingValue}>http://192.168.1.47:8742</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sync Status</Text>
          <Text style={styles.settingValue}>{syncEnabled ? 'Enabled' : 'Disabled'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limbic State</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Trust</Text>
          <Text style={styles.settingValue}>{state.trust.toFixed(2)}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Warmth</Text>
          <Text style={styles.settingValue}>{state.warmth.toFixed(2)}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Arousal</Text>
          <Text style={styles.settingValue}>{state.arousal.toFixed(2)}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Valence</Text>
          <Text style={styles.settingValue}>{state.valence.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sync Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonDanger]}>
          <Text style={styles.buttonText}>Reset Connection</Text>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  settingValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

