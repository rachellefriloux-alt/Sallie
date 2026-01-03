import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';

interface ResourceCapability {
  name: string;
  type: string;
  description: string;
  access_level: string;
  available: boolean;
  permissions_required: string[];
  risk_level: string;
  last_checked: number;
}

interface ResourceAccess {
  resource: string;
  action: string;
  timestamp: number;
  success: boolean;
  duration: number;
  error?: string;
}

export function ResourceAccessPage({ navigation }: any) {
  const [capabilities, setCapabilities] = useState<ResourceCapability[]>([]);
  const [accessHistory, setAccessHistory] = useState<ResourceAccess[]>([]);
  const [internetUrl, setInternetUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileAction, setFileAction] = useState('read');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCapabilities();
    loadAccessHistory();
  }, []);

  const loadCapabilities = async () => {
    try {
      const response = await fetch('http://localhost:8000/resources/capabilities');
      if (response.ok) {
        const data = await response.json();
        const caps = Object.entries(data.capabilities).map(([name, cap]) => ({
          name,
          ...cap
        }));
        setCapabilities(caps);
      }
    } catch (error) {
      console.error('Error loading capabilities:', error);
    }
  };

  const loadAccessHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/resources/history');
      if (response.ok) {
        const data = await response.json();
        setAccessHistory(data.history.slice(0, 20));
      }
    } catch (error) {
      console.error('Error loading access history:', error);
    }
  };

  const accessInternet = async () => {
    if (!internetUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/resources/internet?url=${encodeURIComponent(internetUrl)}`);
      if (response.ok) {
        const result = await response.json();
        Alert.alert('Internet Access', `Status: ${result.status || 'Unknown'}\nContent Length: ${result.content_length || 0}`);
      } else {
        Alert.alert('Error', 'Failed to access internet resource');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access internet resource');
    } finally {
      setIsLoading(false);
    }
  };

  const accessFiles = async () => {
    if (!filePath.trim()) {
      Alert.alert('Error', 'Please enter a file path');
      return;
    }

    setIsLoading(true);
    try {
      const body = new FormData();
      body.append('path', filePath);
      body.append('action', fileAction);
      if (fileAction === 'write' && fileContent) {
        body.append('content', fileContent);
      }

      const response = await fetch('http://localhost:8000/resources/files', {
        method: 'POST',
        body,
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('File Access', `Action: ${fileAction}\nPath: ${filePath}\nSuccess: ${result.exists !== false ? 'Yes' : 'No'}`);
      } else {
        Alert.alert('Error', 'Failed to access file');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access file');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/resources/device');
      if (response.ok) {
        const result = await response.json();
        Alert.alert('Device Info', `Platform: ${result.platform}\nArchitecture: ${result.architecture}\nPython Version: ${result.python_version}\nHostname: ${result.hostname}`);
      } else {
        Alert.alert('Error', 'Failed to get device info');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get device info');
    } finally {
      setIsLoading(false);
    }
  };

  const searchInternet = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/resources/search?query=${encodeURIComponent(searchQuery)}&max_results=10`);
      if (response.ok) {
        const result = await response.json();
        Alert.alert('Search Results', `Found ${result.results.length} results for "${searchQuery}"`);
      } else {
        Alert.alert('Error', 'Search failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCapabilities = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Resource Capabilities</Text>
      <Text style={styles.cardSubtitle}>What Sallie can access</Text>
      
      <ScrollView style={styles.capabilitiesList}>
        {capabilities.map((capability) => (
          <View key={capability.name} style={styles.capabilityItem}>
            <View style={styles.capabilityHeader}>
              <Text style={styles.capabilityName}>{capability.name}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: capability.available ? '#4caf50' : '#f44336' }
              ]} />
            </View>
            
            <Text style={styles.capabilityDescription}>{capability.description}</Text>
            <View style={styles.capabilityDetails}>
              <Text style={styles.capabilityDetail}>Type: {capability.type}</Text>
              <Text style={styles.capabilityDetail}>Access: {capability.access_level}</Text>
              <Text style={styles.capabilityDetail}>Risk: {capability.risk_level}</Text>
              <Text style={styles.capabilityDetail}>Available: {capability.available ? 'Yes' : 'No'}</Text>
            </View>
            
            {capability.permissions_required.length > 0 && (
              <Text style={styles.permissionsText}>
                Permissions: {capability.permissions_required.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderInternetAccess = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Internet Access</Text>
      <Text style={styles.cardSubtitle}>Access any internet resource</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="Enter URL (e.g., https://example.com)"
        value={internetUrl}
        onChangeText={setInternetUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Button
        mode="contained"
        onPress={accessInternet}
        loading={isLoading}
        style={styles.actionButton}
      >
        Access Resource
      </Button>
    </Card>
  );

  const renderFileAccess = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>File System Access</Text>
      <Text style={styles.cardSubtitle}>Read/write local files</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="Enter file path (e.g., /path/to/file.txt)"
        value={filePath}
        onChangeText={setFilePath}
      />
      
      <Text style={styles.sectionTitle}>Action:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
        {['read', 'write', 'list'].map((action) => (
          <TouchableOpacity
            key={action}
            style={[
              styles.actionOption,
              fileAction === action && styles.selectedAction
            ]}
            onPress={() => setFileAction(action)}
          >
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {fileAction === 'write' && (
        <TextInput
          style={styles.textInput}
          placeholder="Enter content to write"
          value={fileContent}
          onChangeText={setFileContent}
          multiline
          numberOfLines={4}
        />
      )}
      
      <Button
        mode="contained"
        onPress={accessFiles}
        loading={isLoading}
        style={styles.actionButton}
      >
        {fileAction === 'read' ? 'Read File' : 'Write File'}
      </Button>
    </Card>
  );

  const renderDeviceInfo = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Device Information</Text>
      <Text style={styles.cardSubtitle}>System and hardware details</Text>
      
      <Button
        mode="contained"
        onPress={getDeviceInfo}
        loading={isLoading}
        style={styles.actionButton}
      >
        Get Device Info
      </Button>
    </Card>
  );

  const renderSearch = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Internet Search</Text>
      <Text style={styles.cardSubtitle}>Search the web for information</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="Enter search query"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <Button
        mode="contained"
        onPress={searchInternet}
        loading={isLoading}
        style={styles.actionButton}
      >
        Search Internet
      </Button>
    </Card>
  );

  const renderAccessHistory = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Access History</Text>
      <Text style={styles.cardSubtitle}>Recent resource accesses</Text>
      
      <ScrollView style={styles.historyList}>
        {accessHistory.map((access, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyResource}>{access.resource}</Text>
              <Text style={styles.historyAction}>{access.action}</Text>
              <Text style={styles.historyTime}>
                {new Date(access.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.historyStatus}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: access.success ? '#4caf50' : '#f44336' }
              ]} />
              <Text style={styles.historyDuration}>
                {access.duration.toFixed(2)}s
              </Text>
            </View>
            
            {access.error && (
              <Text style={styles.historyError}>Error: {access.error}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resource Access</Text>
        <Text style={styles.subtitle}>Sallie's unlimited resource access</Text>
      </View>

      {renderCapabilities()}
      {renderInternetAccess()}
      {renderFileAccess()}
      {renderDeviceInfo()}
      {renderSearch()}
      {renderAccessHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionScroll: {
    marginBottom: 10,
  },
  actionOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  selectedAction: {
    backgroundColor: '#6200ee',
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  actionButton: {
    marginTop: 10,
  },
  capabilitiesList: {
    maxHeight: 200,
  },
  capabilityItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  capabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  capabilityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  capabilityDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  capabilityDetails: {
    marginBottom: 5,
  },
  capabilityDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  permissionsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyResource: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  historyAction: {
    fontSize: 12,
    color: '#333',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  historyDuration: {
    fontSize: 12,
    color: '#666',
  },
  historyError: {
    fontSize: 12,
    color: '#f44336',
    fontStyle: 'italic',
  },
});
