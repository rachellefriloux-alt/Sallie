/**
 * Limbic state visualization screen with tablet optimizations.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLimbicStore } from '../store/useLimbicStore';
import { useTabletLayout } from '../hooks/useTabletLayout';

export function LimbicScreen() {
  const { state } = useLimbicStore();
  const { isTablet, fontSize, spacing } = useTabletLayout();

  const gauges = [
    {
      label: 'Trust',
      value: state.trust,
      color: '#6366f1',
    },
    {
      label: 'Warmth',
      value: state.warmth,
      color: '#8b5cf6',
    },
    {
      label: 'Energy',
      value: state.arousal,
      color: '#f59e0b',
    },
    {
      label: 'Mood',
      value: (state.valence + 1) / 2, // Map -1 to 1 range to 0 to 1
      color: '#3b82f6',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[
        styles.content,
        isTablet && styles.contentTablet,
      ]}
      accessibilityLabel="Limbic state visualization"
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Emotional State
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Current limbic metrics
        </Text>
      </View>

      <View style={[styles.gaugesContainer, isTablet && styles.gaugesContainerTablet]}>
        {gauges.map((gauge) => (
          <View
            key={gauge.label}
            style={[styles.gaugeCard, isTablet && styles.gaugeCardTablet]}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: gauge.value * 100,
              text: `${gauge.label}: ${(gauge.value * 100).toFixed(0)}%`,
            }}
          >
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeLabel, isTablet && { fontSize: fontSize.base }]}>
                {gauge.label}
              </Text>
              <Text style={[styles.gaugeValue, isTablet && { fontSize: fontSize.base }]}>
                {gauge.value.toFixed(2)}
              </Text>
            </View>
            <View style={styles.gaugeBar}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${gauge.value * 100}%`,
                    backgroundColor: gauge.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.postureCard, isTablet && styles.postureCardTablet]}>
        <Text style={[styles.postureLabel, isTablet && { fontSize: fontSize.small }]}>
          Current Mode
        </Text>
        <Text style={[styles.postureValue, isTablet && { fontSize: fontSize.large }]}>
          {state.posture || 'PEER'}
        </Text>
      </View>
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
    maxWidth: 1200,
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
    color: '#aaa',
  },
  gaugesContainer: {
    gap: 16,
  },
  gaugesContainerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  gaugeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  gaugeCardTablet: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 0,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
  },
  gaugeValue: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  gaugeBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  postureCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  postureCardTablet: {
    padding: 24,
  },
  postureLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  postureValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
});
