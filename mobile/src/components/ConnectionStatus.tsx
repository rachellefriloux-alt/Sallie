/**
 * Connection Status component for React Native mobile app
 * Matches web/components/ConnectionStatus.tsx functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface ServiceStatus {
  backend: 'connected' | 'disconnected' | 'checking';
  ollama: 'connected' | 'disconnected' | 'checking';
  qdrant: 'connected' | 'disconnected' | 'checking';
}

const API_BASE = 'http://192.168.1.47:8742'; // Backend deployed to mini PC

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ServiceStatus>({
    backend: 'checking',
    ollama: 'checking',
    qdrant: 'checking',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkServices = async () => {
    const newStatus: ServiceStatus = {
      backend: 'checking',
      ollama: 'checking',
      qdrant: 'checking',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        newStatus.backend = 'connected';
        newStatus.ollama = data.services?.ollama === 'healthy' ? 'connected' : 'disconnected';
        newStatus.qdrant = data.services?.qdrant === 'healthy' ? 'connected' : 'disconnected';
      } else {
        newStatus.backend = 'disconnected';
        newStatus.ollama = 'disconnected';
        newStatus.qdrant = 'disconnected';
      }
    } catch (error) {
      newStatus.backend = 'disconnected';
      newStatus.ollama = 'disconnected';
      newStatus.qdrant = 'disconnected';
    }

    setStatus(newStatus);
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): 'good' | 'degraded' | 'down' => {
    if (status.backend === 'connected' && status.ollama === 'connected' && status.qdrant === 'connected') {
      return 'good';
    } else if (status.backend === 'connected') {
      return 'degraded';
    } else {
      return 'down';
    }
  };

  const overallStatus = getOverallStatus();

  const getStatusColor = () => {
    switch (overallStatus) {
      case 'good': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
    }
  };

  const getStatusText = () => {
    switch (overallStatus) {
      case 'good': return 'All Systems OK';
      case 'degraded': return 'Limited Features';
      case 'down': return 'Disconnected';
    }
  };

  const renderStatusIcon = (serviceStatus: 'connected' | 'disconnected' | 'checking') => {
    if (serviceStatus === 'checking') {
      return <ActivityIndicator size="small" color="#6b7280" />;
    }
    return (
      <View
        style={[
          styles.statusDot,
          { backgroundColor: serviceStatus === 'connected' ? '#10b981' : '#ef4444' },
        ]}
      />
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { borderColor: getStatusColor() }]}
        onPress={() => setShowDetails(true)}
      >
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </TouchableOpacity>

      <Modal
        visible={showDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Service Status</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              <View style={styles.serviceItem}>
                <Text style={styles.serviceLabel}>Backend API</Text>
                <View style={styles.serviceStatus}>
                  {renderStatusIcon(status.backend)}
                  <Text style={styles.serviceStatusText}>
                    {status.backend}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceItem}>
                <Text style={styles.serviceLabel}>Ollama (AI)</Text>
                <View style={styles.serviceStatus}>
                  {renderStatusIcon(status.ollama)}
                  <Text style={styles.serviceStatusText}>
                    {status.ollama}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceItem}>
                <Text style={styles.serviceLabel}>Qdrant (Memory)</Text>
                <View style={styles.serviceStatus}>
                  {renderStatusIcon(status.qdrant)}
                  <Text style={styles.serviceStatusText}>
                    {status.qdrant}
                  </Text>
                </View>
              </View>

              <View style={styles.lastCheckContainer}>
                <Text style={styles.lastCheckText}>
                  Last checked: {lastCheck.toLocaleTimeString()}
                </Text>
              </View>

              {overallStatus === 'down' && (
                <View style={styles.troubleshootContainer}>
                  <Text style={styles.troubleshootTitle}>Troubleshooting:</Text>
                  <Text style={styles.troubleshootText}>• Check backend URL in settings</Text>
                  <Text style={styles.troubleshootText}>• Ensure phone and server on same WiFi</Text>
                  <Text style={styles.troubleshootText}>• Use IP address, not localhost</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                checkServices();
                setShowDetails(false);
              }}
            >
              <Text style={styles.refreshButtonText}>Refresh & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#9ca3af',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  serviceLabel: {
    fontSize: 16,
    color: '#d1d5db',
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceStatusText: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  lastCheckContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  lastCheckText: {
    fontSize: 12,
    color: '#6b7280',
  },
  troubleshootContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  refreshButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
