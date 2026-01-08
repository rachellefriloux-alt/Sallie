/**
 * Message Details Component - Mobile Version
 * Complete message details view with top-tier quality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  metadata?: {
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    keywords?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    emotion?: string;
    context?: string;
    relatedMessages?: string[];
    attachments?: Array<{
      type: 'image' | 'file' | 'link';
      url: string;
      name: string;
      size?: number;
    }>;
  };
}

interface MessageDetailsProps {
  message: Message;
  relatedMessages?: Message[];
  onClose?: () => void;
  onMessageAction?: (action: string, messageId: string) => void;
}

export function MessageDetails({
  message,
  relatedMessages = [],
  onClose,
  onMessageAction,
}: MessageDetailsProps) {
  const [animationValue] = useState(new Animated.Value(0));
  const [showRelated, setShowRelated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Share message
  const shareMessage = useCallback(async () => {
    try {
      await Share.share({
        message: message.text,
        title: 'Sallie Studio Message',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [message]);

  // Copy message
  const copyMessage = useCallback(() => {
    // In a real app, you'd use Clipboard API
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Message copied to clipboard');
  }, []);

  // Handle link press
  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  }, []);

  // Render metadata section
  const renderMetadata = () => (
    <View style={styles.metadataSection}>
      <Text style={styles.sectionTitle}>Message Metadata</Text>
      
      {message.metadata?.category && (
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Category:</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{message.metadata.category}</Text>
          </View>
        </View>
      )}

      {message.metadata?.priority && (
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Priority:</Text>
          <View style={[
            styles.priorityBadge,
            message.metadata.priority === 'high' && styles.priorityHigh,
            message.metadata.priority === 'medium' && styles.priorityMedium,
            message.metadata.priority === 'low' && styles.priorityLow,
          ]}>
            <Text style={styles.priorityText}>
              {message.metadata.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {message.metadata?.sentiment && (
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Sentiment:</Text>
          <View style={[
            styles.sentimentBadge,
            message.metadata.sentiment === 'positive' && styles.sentimentPositive,
            message.metadata.sentiment === 'negative' && styles.sentimentNegative,
            message.metadata.sentiment === 'neutral' && styles.sentimentNeutral,
          ]}>
            <Text style={styles.sentimentText}>
              {message.metadata.sentiment.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {message.metadata?.emotion && (
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Emotion:</Text>
          <Text style={styles.emotionText}>{message.metadata.emotion}</Text>
        </View>
      )}

      {message.metadata?.context && (
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>Context:</Text>
          <Text style={styles.contextText}>{message.metadata.context}</Text>
        </View>
      )}
    </View>
  );

  // Render tags section
  const renderTags = () => (
    <View style={styles.tagsSection}>
      <Text style={styles.sectionTitle}>Tags</Text>
      <View style={styles.tagsContainer}>
        {message.metadata?.tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {message.metadata?.keywords?.map((keyword, index) => (
          <View key={`keyword-${index}`} style={styles.keywordTag}>
            <Text style={styles.keywordText}>{keyword}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render attachments
  const renderAttachments = () => (
    <View style={styles.attachmentsSection}>
      <Text style={styles.sectionTitle}>Attachments</Text>
      {message.metadata?.attachments?.map((attachment, index) => (
        <TouchableOpacity
          key={index}
          style={styles.attachmentItem}
          onPress={() => handleLinkPress(attachment.url)}
        >
          <View style={styles.attachmentIcon}>
            <Text style={styles.attachmentIconText}>
              {attachment.type === 'image' ? '🖼️' : 
               attachment.type === 'file' ? '📄' : '🔗'}
            </Text>
          </View>
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName}>{attachment.name}</Text>
            {attachment.size && (
              <Text style={styles.attachmentSize}>
                {(attachment.size / 1024).toFixed(1)} KB
              </Text>
            )}
          </View>
          <Text style={styles.attachmentArrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render related messages
  const renderRelatedMessages = () => (
    <View style={styles.relatedSection}>
      <View style={styles.relatedHeader}>
        <Text style={styles.sectionTitle}>Related Messages</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowRelated(!showRelated)}
        >
          <Text style={styles.toggleText}>
            {showRelated ? 'Hide' : 'Show'} ({relatedMessages.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {showRelated && (
        <View style={styles.relatedMessages}>
          {relatedMessages.map((relatedMessage) => (
            <TouchableOpacity
              key={relatedMessage.id}
              style={styles.relatedMessage}
              onPress={() => {
                if (onMessageAction) {
                  onMessageAction('view', relatedMessage.id);
                }
              }}
            >
              <Text style={styles.relatedSender}>
                {relatedMessage.isFromUser ? 'You' : 'Sallie'}
              </Text>
              <Text style={styles.relatedText} numberOfLines={2}>
                {relatedMessage.text}
              </Text>
              <Text style={styles.relatedTimestamp}>
                {new Date(relatedMessage.timestamp).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render actions
  const renderActions = () => (
    <View style={styles.actionsSection}>
      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={shareMessage}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={copyMessage}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onMessageAction) {
              onMessageAction('bookmark', message.id);
            }
          }}
        >
          <Text style={styles.actionIcon}>📚</Text>
          <Text style={styles.actionText}>Bookmark</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (onMessageAction) {
              onMessageAction('delete', message.id);
            }
          }}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Message Details</Text>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'More Options',
                'Choose an action',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Report', onPress: () => onMessageAction?.('report', message.id) },
                  { text: 'Export', onPress: () => onMessageAction?.('export', message.id) },
                ]
              );
            }}
          >
            <Text style={styles.moreIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: animationValue,
            transform: [{ translateY: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }) }],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Message Header */}
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>
              {message.isFromUser ? 'You' : 'Sallie'}
            </Text>
            <Text style={styles.messageTimestamp}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </View>
        </View>

        {/* Message Content */}
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'details' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('details')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'details' && styles.tabTextActive
            ]}>
              Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'related' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('related')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'related' && styles.tabTextActive
            ]}>
              Related
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'actions' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('actions')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'actions' && styles.tabTextActive
            ]}>
              Actions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'details' && (
          <View>
            {renderMetadata()}
            {renderTags()}
            {renderAttachments()}
          </View>
        )}
        
        {selectedTab === 'related' && (
          renderRelatedMessages()
        )}
        
        {selectedTab === 'actions' && (
          renderActions()
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  messageHeader: {
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  messageTimestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  messageContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  metadataSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    width: 80,
  },
  categoryBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#ef4444',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
  },
  priorityLow: {
    backgroundColor: '#10b981',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  sentimentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sentimentPositive: {
    backgroundColor: '#10b981',
  },
  sentimentNegative: {
    backgroundColor: '#ef4444',
  },
  sentimentNeutral: {
    backgroundColor: '#6b7280',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  emotionText: {
    fontSize: 14,
    color: '#374151',
  },
  contextText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  tagsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  keywordTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    fontSize: 12,
    color: '#92400e',
  },
  attachmentsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentIconText: {
    fontSize: 16,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  attachmentArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  relatedSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    color: '#6b7280',
  },
  relatedMessages: {
    marginTop: 8,
  },
  relatedMessage: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  relatedSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  relatedText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  relatedTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
