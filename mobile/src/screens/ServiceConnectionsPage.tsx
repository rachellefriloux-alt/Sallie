import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { Card, Button, ProgressBar, Checkbox } from 'react-native-paper';

interface ServiceConnection {
  id: string;
  name: string;
  icon: string;
  description: string;
  free_tier: string;
  capabilities: string[];
  connected: boolean;
  api_key_required: boolean;
  oauth_required: boolean;
  setup_url?: string;
  api_key?: string;
  last_connected?: number;
}

export function ServiceConnectionsPage({ navigation }: any) {
  const [services, setServices] = useState<ServiceConnection[]>([
    {
      id: 'google_cloud',
      name: 'Google Cloud',
      icon: '☁️',
      description: 'AI, Storage, Translation, Vision, Natural Language',
      free_tier: 'Generous free tier + existing subscriptions',
      capabilities: ['AI/ML', 'Storage', 'Translation', 'Vision', 'NLP', 'Logging', 'Functions'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://console.cloud.google.com/'
    },
    {
      id: 'microsoft_azure',
      name: 'Microsoft Azure',
      icon: '☁️',
      description: 'AI, Storage, Cognitive Services, Azure Functions',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['AI/ML', 'Storage', 'Cognitive Services', 'Functions', 'Databases'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://portal.azure.com/'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      description: 'GPT models, DALL-E, Embeddings, Fine-tuning',
      free_tier: 'Free credits + existing subscriptions',
      capabilities: ['Language Models', 'Image Generation', 'Embeddings', 'Fine-tuning'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://platform.openai.com/'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Code hosting, Actions, Packages, Copilot',
      free_tier: 'Free tier + Pro features',
      capabilities: ['Code Storage', 'CI/CD', 'Packages', 'Copilot', 'Pages'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://github.com/'
    },
    {
      id: 'aws',
      name: 'Amazon Web Services',
      icon: '🔷',
      description: 'Cloud computing, AI, Storage, Lambda',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Compute', 'Storage', 'AI/ML', 'Lambda', 'Databases'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://aws.amazon.com/'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      icon: '🤗',
      description: 'AI models, datasets, spaces, inference',
      free_tier: 'Free tier + Pro features',
      capabilities: ['Models', 'Datasets', 'Inference', 'Spaces', 'Pipelines'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://huggingface.co/'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🧠',
      description: 'Claude AI models, safety research',
      free_tier: 'Free credits + existing subscriptions',
      capabilities: ['Language Models', 'Safety', 'Research', 'API'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://www.anthropic.com/'
    },
    {
      id: 'cohere',
      name: 'Cohere',
      icon: '🔗',
      description: 'Language models, embeddings, classification',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Language Models', 'Embeddings', 'Classification', 'Generation'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://cohere.com/'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: '💳',
      description: 'Payment processing, financial services',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Payments', 'Subscriptions', 'Financial Data', 'Analytics'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://stripe.com/'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      icon: '📞',
      description: 'SMS, Voice, Video, Email, Chat',
      free_tier: 'Free credits + existing subscriptions',
      capabilities: ['SMS', 'Voice', 'Video', 'Email', 'Chat', 'WhatsApp'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://www.twilio.com/'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      icon: '📧',
      description: 'Email delivery, marketing, templates',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Email', 'Marketing', 'Templates', 'Analytics', 'Automation'],
      connected: false,
      api_key_required: true,
      oauth_required: false,
      setup_url: 'https://sendgrid.com/'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      description: 'Music streaming, recommendations, playlists',
      free_tier: 'Free tier + Premium features',
      capabilities: ['Music', 'Recommendations', 'Playlists', 'Audio Analysis'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://developer.spotify.com/'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Social media, trends, analytics, posting',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Social Media', 'Trends', 'Analytics', 'Posting', 'Search'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://developer.twitter.com/'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: '🤖',
      description: 'Social media, communities, content',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Social Media', 'Communities', 'Content', 'Analytics'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://www.reddit.com/dev/api/'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      description: 'Professional networking, jobs, content',
      free_tier: 'Free tier + existing subscriptions',
      capabilities: ['Professional Network', 'Jobs', 'Content', 'Analytics'],
      connected: false,
      api_key_required: true,
      oauth_required: true,
      setup_url: 'https://developer.linkedin.com/'
    }
  ]);

  const [showApiKeyInput, setShowApiKeyInput] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [connectingService, setConnectingService] = useState<string | null>(null);

  const connectService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    if (service.oauth_required) {
      // Open OAuth flow
      Linking.openURL(service.setup_url || '');
      Alert.alert('OAuth Required', `Please authorize Sallie to access ${service.name} in your browser. Once complete, return here to continue.`);
    } else if (service.api_key_required) {
      setShowApiKeyInput(serviceId);
    }
  };

  const saveApiKey = async () => {
    if (!showApiKeyInput || !apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setConnectingService(showApiKeyInput);
    
    try {
      // Test API key validity
      const isValid = await testApiKey(showApiKeyInput, apiKey);
      
      if (isValid) {
        // Save API key
        await saveServiceApiKey(showApiKeyInput, apiKey);
        
        // Update service status
        setServices(prev => prev.map(service => 
          service.id === showApiKeyInput 
            ? { ...service, connected: true, api_key: apiKey, last_connected: Date.now() }
            : service
        ));
        
        Alert.alert('Success', `${services.find(s => s.id === showApiKeyInput)?.name} connected successfully!`);
      } else {
        Alert.alert('Error', 'Invalid API key. Please check your key and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect service. Please try again.');
    } finally {
      setConnectingService(null);
      setShowApiKeyInput(null);
      setApiKey('');
    }
  };

  const testApiKey = async (serviceId: string, key: string): Promise<boolean> => {
    // Test API key validity based on service
    try {
      switch (serviceId) {
        case 'openai':
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
          });
          return response.ok;
        
        case 'huggingface':
          const hfResponse = await fetch('https://huggingface.co/api/whoami', {
            headers: { 'Authorization': `Bearer ${key}` }
          });
          return hfResponse.ok;
        
        case 'github':
          const ghResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${key}` }
          });
          return ghResponse.ok;
        
        // Add more service tests as needed
        default:
          return true; // Assume valid for now
      }
    } catch {
      return false;
    }
  };

  const saveServiceApiKey = async (serviceId: string, key: string) => {
    // Save API key securely (in production, use secure storage)
    // For now, just store in memory
    console.log(`Saving API key for ${serviceId}`);
  };

  const disconnectService = async (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, connected: false, api_key: '', last_connected: undefined }
        : service
    ));
    
    Alert.alert('Disconnected', `${services.find(s => s.id === serviceId)?.name} disconnected`);
  };

  const renderServiceCard = (service: ServiceConnection) => (
    <Card key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{service.icon}</Text>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: service.connected ? '#4caf50' : '#f44336' }
        ]} />
      </View>
      
      <View style={styles.serviceDetails}>
        <Text style={styles.freeTier}>Free Tier: {service.free_tier}</Text>
        <Text style={styles.capabilities}>Capabilities: {service.capabilities.join(', ')}</Text>
      </View>
      
      <View style={styles.serviceActions}>
        {service.connected ? (
          <Button
            mode="outlined"
            onPress={() => disconnectService(service.id)}
            style={styles.disconnectButton}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => connectService(service.id)}
            style={styles.connectButton}
          >
            Connect
          </Button>
        )}
        
        <Button
          mode="text"
          onPress={() => Linking.openURL(service.setup_url || '')}
          style={styles.setupButton}
        >
          Setup Guide
        </Button>
      </View>
      
      {service.connected && service.last_connected && (
        <Text style={styles.connectedInfo}>
          Connected: {new Date(service.last_connected).toLocaleString()}
        </Text>
      )}
    </Card>
  );

  const renderApiKeyModal = () => {
    if (!showApiKeyInput) return null;
    
    const service = services.find(s => s.id === showApiKeyInput);
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Connect {service?.name}</Text>
          <Text style={styles.modalDescription}>
            Enter your API key for {service?.name}. You can find this in your {service?.name} developer console.
          </Text>
          
          <TextInput
            style={styles.apiKeyInput}
            placeholder="Enter API key"
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => {
                setShowApiKeyInput(null);
                setApiKey('');
              }}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={saveApiKey}
              loading={connectingService === showApiKeyInput}
              disabled={!apiKey.trim()}
            >
              Connect
            </Button>
          </View>
        </View>
      </View>
    );
  };

  const connectedCount = services.filter(s => s.connected).length;
  const totalCount = services.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Connections</Text>
        <Text style={styles.subtitle}>Connect Sallie to all your services</Text>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            Connected: {connectedCount}/{totalCount} services
          </Text>
          <ProgressBar 
            progress={connectedCount / totalCount} 
            color="#4caf50" 
            style={styles.progressBar}
          />
        </View>
      </View>

      <ScrollView style={styles.servicesList}>
        {services.map(renderServiceCard)}
      </ScrollView>

      {renderApiKeyModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
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
    marginBottom: 15,
  },
  stats: {
    marginTop: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
  },
  servicesList: {
    flex: 1,
    padding: 15,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  serviceDetails: {
    marginBottom: 15,
  },
  freeTier: {
    fontSize: 12,
    color: '#4caf50',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  capabilities: {
    fontSize: 12,
    color: '#666',
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectButton: {
    flex: 1,
    marginRight: 10,
  },
  disconnectButton: {
    flex: 1,
    marginRight: 10,
  },
  setupButton: {
    minWidth: 100,
  },
  connectedInfo: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  apiKeyInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
