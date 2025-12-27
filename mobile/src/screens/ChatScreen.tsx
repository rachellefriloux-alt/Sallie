/**
 * Main chat screen for mobile app.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import APIClient from '../services/api_client';
import { useLimbicStore } from '../store/useLimbicStore';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const apiClient = useRef(new APIClient()).current;
  const { state: limbicState, updateState } = useLimbicStore();
  const { width, height } = useWindowDimensions();
  
  // Tablet detection (width > 600px or height > 600px)
  const isTablet = width > 600 || height > 600;

  useEffect(() => {
    // Connect to WebSocket
    apiClient.connectWebSocket(
      (data) => {
        if (data.type === 'response') {
          addMessage(data.content, false);
        } else if (data.type === 'limbic_update') {
          updateState(data.state);
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );

    return () => {
      apiClient.closeWebSocket();
    };
  }, []);

  const addMessage = (text: string, isUser: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      // Send via WebSocket for real-time
      apiClient.sendWebSocketMessage(userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('Sorry, I encountered an error.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, isTablet && styles.containerTablet]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, isTablet && styles.headerTablet]}>
        <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]}>
          Sallie
        </Text>
        <Text style={[styles.headerSubtitle, isTablet && styles.headerSubtitleTablet]}>
          {limbicState.posture} • Trust: {limbicState.trust.toFixed(2)}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContent,
          isTablet && styles.messagesContentTablet,
        ]}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.messageRow : undefined}
      />

      <View style={[styles.inputContainer, isTablet && styles.inputContainerTablet]}>
        <TextInput
          style={[styles.input, isTablet && styles.inputTablet]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          onSubmitEditing={sendMessage}
          accessibilityLabel="Chat input"
          accessibilityHint="Type your message and press send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            isTablet && styles.sendButtonTablet,
            isLoading && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={isLoading}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  containerTablet: {
    // Tablet: Use side-by-side layout if needed
    flexDirection: 'row',
  },
  header: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTablet: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleTablet: {
    fontSize: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  headerSubtitleTablet: {
    fontSize: 18,
    marginTop: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messagesContentTablet: {
    padding: 24,
    maxWidth: 1200, // Center content on large tablets
    alignSelf: 'center',
    width: '100%',
  },
  messageRow: {
    justifyContent: 'space-between',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#4a9eff',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputContainerTablet: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  inputTablet: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 150,
  },
  sendButton: {
    backgroundColor: '#4a9eff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 44, // Accessibility: minimum touch target
  },
  sendButtonTablet: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 100,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


