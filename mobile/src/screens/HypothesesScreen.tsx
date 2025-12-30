/**
 * Hypotheses management screen for mobile app.
 * Review and validate patterns discovered by the Dream Cycle.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import APIClient from '../services/api_client';

interface Hypothesis {
  id: string;
  pattern: string;
  evidence: Array<{ timestamp: number; observation: string }>;
  weight: number;
  status: 'pending_veto' | 'testing' | 'near_heritage' | 'rejected';
  conditional?: {
    base_belief: string;
    exception: string;
  };
  category: string;
}

export function HypothesesScreen() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { isTablet, fontSize, spacing } = useTabletLayout();
  const apiClient = React.useRef(new APIClient()).current;

  useEffect(() => {
    loadHypotheses();
  }, []);

  const loadHypotheses = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate loading with mock data
      setHypotheses([]);
    } catch (err) {
      console.error('Failed to load hypotheses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    hypothesisId: string,
    action: 'confirm' | 'deny' | 'add_context'
  ) => {
    setActionLoading(hypothesisId);
    try {
      // In a real implementation, this would call an API endpoint
      console.log(`Action: ${action} on hypothesis ${hypothesisId}`);

      if (action === 'add_context') {
        Alert.prompt(
          'Add Context',
          'Provide additional context for this hypothesis:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit',
              onPress: (context) => {
                console.log(`Context added: ${context}`);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          action === 'confirm' ? 'Confirmed' : 'Denied',
          `Hypothesis has been ${action === 'confirm' ? 'confirmed' : 'denied'}.`
        );
      }

      await loadHypotheses();
    } catch (err) {
      console.error('Failed to process action:', err);
      Alert.alert('Error', 'Failed to process action. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Loading hypotheses...</Text>
      </View>
    );
  }

  const pendingHypotheses = hypotheses.filter((h) => h.status === 'pending_veto');

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Hypothesis Management
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Review and validate patterns discovered by the Dream Cycle
        </Text>
      </View>

      {pendingHypotheses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending hypotheses</Text>
        </View>
      ) : (
        <View style={styles.hypothesesContainer}>
          {pendingHypotheses.map((hypothesis) => (
            <View key={hypothesis.id} style={styles.hypothesisCard}>
              {/* Header */}
              <View style={styles.hypothesisHeader}>
                <Text style={[styles.hypothesisPattern, isTablet && { fontSize: fontSize.base }]}>
                  {hypothesis.pattern}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{hypothesis.category}</Text>
                </View>
              </View>

              {/* Metadata */}
              <Text style={styles.metadataText}>
                Weight: {hypothesis.weight.toFixed(2)} | Evidence:{' '}
                {hypothesis.evidence.length} observations
              </Text>

              {/* Evidence */}
              <View style={styles.evidenceContainer}>
                <Text style={styles.sectionTitle}>Evidence</Text>
                {hypothesis.evidence.slice(0, 3).map((ev, idx) => (
                  <Text key={idx} style={styles.evidenceItem}>
                    • {ev.observation} (
                    {new Date(ev.timestamp * 1000).toLocaleDateString()})
                  </Text>
                ))}
                {hypothesis.evidence.length > 3 && (
                  <Text style={styles.moreEvidence}>
                    ... and {hypothesis.evidence.length - 3} more
                  </Text>
                )}
              </View>

              {/* Conditional Belief */}
              {hypothesis.conditional && (
                <View style={styles.conditionalContainer}>
                  <Text style={styles.sectionTitle}>Conditional Belief</Text>
                  <Text style={styles.conditionalText}>
                    {hypothesis.conditional.base_belief} EXCEPT when{' '}
                    {hypothesis.conditional.exception}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleAction(hypothesis.id, 'confirm')}
                  disabled={actionLoading === hypothesis.id}
                  accessibilityLabel="Confirm hypothesis"
                >
                  {actionLoading === hypothesis.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Confirm</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.denyButton]}
                  onPress={() => handleAction(hypothesis.id, 'deny')}
                  disabled={actionLoading === hypothesis.id}
                  accessibilityLabel="Deny hypothesis"
                >
                  <Text style={styles.actionButtonText}>Deny</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.contextButton]}
                  onPress={() => handleAction(hypothesis.id, 'add_context')}
                  disabled={actionLoading === hypothesis.id}
                  accessibilityLabel="Add context to hypothesis"
                >
                  <Text style={styles.contextButtonText}>Add Context</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
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
  emptyContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  hypothesesContainer: {
    gap: 16,
  },
  hypothesisCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  hypothesisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hypothesisPattern: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#a78bfa',
  },
  metadataText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  evidenceContainer: {
    marginBottom: 12,
  },
  evidenceItem: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
    lineHeight: 18,
  },
  moreEvidence: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  conditionalContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  conditionalText: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  denyButton: {
    backgroundColor: '#dc2626',
  },
  contextButton: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  contextButtonText: {
    color: '#d1d5db',
    fontWeight: '600',
    fontSize: 14,
  },
});
