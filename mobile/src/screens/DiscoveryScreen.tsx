import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDiscovery, SallieDevice } from '../services/DiscoveryService';

const DiscoveryScreen: React.FC = () => {
  const {
    isScanning,
    devices,
    connectedDevice,
    error,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnect,
    refresh,
  } = useDiscovery();

  useEffect(() => {
    // Start scanning when component mounts
    startScanning();
    
    // Cleanup when component unmounts
    return () => {
      stopScanning();
    };
  }, []);

  const handleConnectToDevice = async (device: SallieDevice) => {
    try {
      const success = await connectToDevice(device);
      if (success) {
        Alert.alert(
          'Connected!',
          `Successfully connected to ${device.name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to main app or chat screen
                // This would be handled by navigation
              },
            },
          ]
        );
      } else {
        Alert.alert('Connection Failed', 'Unable to connect to the device. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while connecting.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    Alert.alert('Disconnected', 'You have been disconnected from Sallie.');
  };

  const renderDeviceItem = ({ item }: { item: SallieDevice }) => {
    const isConnected = connectedDevice?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          isConnected && styles.connectedDevice,
        ]}
        onPress={() => isConnected ? handleDisconnect() : handleConnectToDevice(item)}
        disabled={isScanning}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceDetails}>
            {item.host}:{item.port}
          </Text>
          <Text style={styles.deviceVersion}>
            Version: {item.version}
          </Text>
          <Text style={styles.deviceLastSeen}>
            Last seen: {item.lastSeen.toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.deviceStatus}>
          {isConnected ? (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleConnectToDevice(item)}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Looking for Sallie...</Text>
      <Text style={styles.emptyStateMessage}>
        Make sure Sallie is running on your network
      </Text>
      {isScanning && (
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.scanner} />
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Find Sallie</Text>
      <Text style={styles.subtitle}>
        Discover Sallie devices on your network
      </Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {connectedDevice && (
        <View style={styles.connectedInfo}>
          <Text style={styles.connectedInfoText}>
            Connected to: {connectedDevice.name}
          </Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={refresh}
            tintColor="#8B5CF6"
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  connectedInfo: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedInfoText: {
    color: '#059669',
    fontSize: 14,
    flex: 1,
  },
  disconnectButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectedDevice: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  deviceVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  deviceLastSeen: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  connectedBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanner: {
    marginTop: 16,
  },
});

export default DiscoveryScreen;
