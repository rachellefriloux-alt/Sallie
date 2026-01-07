/**
 * Message Bookmarks Component - Mobile Version
 * Complete message bookmarking functionality with top-tier quality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  FlatList,
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
  };
}

interface Bookmark {
  id: string;
  messageId: string;
  message: Message;
  note?: string;
  tags: string[];
  category: string;
  createdAt: string;
  isArchived: boolean;
}

interface MessageBookmarksProps {
  messages: Message[];
  onBookmarkAdded?: (bookmark: Bookmark) => void;
  onBookmarkRemoved?: (bookmarkId: string) => void;
  onBookmarkSelected?: (bookmark: Bookmark) => void;
}

export function MessageBookmarks({
  messages,
  onBookmarkAdded,
  onBookmarkRemoved,
  onBookmarkSelected,
}: MessageBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkTags, setBookmarkTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(['general', 'important', 'reference', 'ideas', 'tasks', 'personal']);
    return Array.from(cats);
  }, []);

  // Initialize with sample bookmarks
  useEffect(() => {
    const sampleBookmarks: Bookmark[] = [
      {
        id: '1',
        messageId: 'msg1',
        message: {
          id: 'msg1',
          text: 'Remember to check the API documentation for the new endpoints',
          timestamp: '2024-01-08T10:30:00Z',
          isFromUser: true,
          metadata: {
            category: 'tasks',
            priority: 'high',
            tags: ['api', 'documentation', 'endpoints'],
          },
        },
        note: 'Important for the upcoming project',
        tags: ['api', 'documentation', 'endpoints'],
        category: 'tasks',
        createdAt: '2024-01-08T10:30:00Z',
        isArchived: false,
      },
      {
        id: '2',
        messageId: 'msg2',
        message: {
          id: 'msg2',
          text: 'The new design system looks great! I especially like the color palette',
          timestamp: '2024-01-07T14:15:00Z',
          isFromUser: false,
          metadata: {
            category: 'ideas',
            priority: 'medium',
            tags: ['design', 'colors', 'palette'],
          },
        },
        tags: ['design', 'feedback', 'positive'],
        category: 'ideas',
        createdAt: '2024-01-07T14:15:00Z',
        isArchived: false,
      },
    ];
    setBookmarks(sampleBookmarks);
  }, []);

  // Animation effect
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  }, []);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks.filter(b => !b.isArchived);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookmarks, selectedCategory, searchQuery]);

  // Add bookmark
  const addBookmark = useCallback((message: Message) => {
    setSelectedMessage(message);
    setShowAddBookmark(true);
    setBookmarkNote('');
    setBookmarkTags([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Save bookmark
  const saveBookmark = useCallback(() => {
    if (!selectedMessage) return;

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      messageId: selectedMessage.id,
      message: selectedMessage,
      note: bookmarkNote,
      tags: bookmarkTags,
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      createdAt: new Date().toISOString(),
      isArchived: false,
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    setShowAddBookmark(false);
    setSelectedMessage(null);
    setBookmarkNote('');
    setBookmarkTags([]);

    if (onBookmarkAdded) {
      onBookmarkAdded(newBookmark);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectedMessage, bookmarkNote, bookmarkTags, selectedCategory, onBookmarkAdded]);

  // Remove bookmark
  const removeBookmark = useCallback((bookmarkId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
            if (onBookmarkRemoved) {
              onBookmarkRemoved(bookmarkId);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  }, [onBookmarkRemoved]);

  // Archive bookmark
  const archiveBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.map(b => 
      b.id === bookmarkId ? { ...b, isArchived: true } : b
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Add tag
  const addTag = useCallback((tag: string) => {
    if (tag && !bookmarkTags.includes(tag)) {
      setBookmarkTags(prev => [...prev, tag]);
    }
  }, [bookmarkTags]);

  // Remove tag
  const removeTag = useCallback((tag: string) => {
    setBookmarkTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Render bookmark item
  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={styles.bookmarkItem}
      onPress={() => {
        if (onBookmarkSelected) {
          onBookmarkSelected(item);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.bookmarkHeader}>
        <View style={styles.bookmarkInfo}>
          <Text style={styles.bookmarkSender}>
            {item.message.isFromUser ? 'You' : 'Sallie'}
          </Text>
          <Text style={styles.bookmarkTimestamp}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
        <View style={styles.bookmarkActions}>
          <TouchableOpacity
            style={styles.bookmarkActionButton}
            onPress={() => archiveBookmark(item.id)}
          >
            <Text style={styles.bookmarkActionIcon}>📁</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookmarkActionButton}
            onPress={() => removeBookmark(item.id)}
          >
            <Text style={styles.bookmarkActionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.bookmarkMessage} numberOfLines={3}>
        {item.message.text}
      </Text>

      {item.note && (
        <View style={styles.bookmarkNoteContainer}>
          <Text style={styles.bookmarkNoteLabel}>Note:</Text>
          <Text style={styles.bookmarkNoteText}>{item.note}</Text>
        </View>
      )}

      {item.tags.length > 0 && (
        <View style={styles.bookmarkTagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.bookmarkTag}>
              <Text style={styles.bookmarkTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bookmarkFooter}>
        <View style={styles.bookmarkCategory}>
          <Text style={styles.bookmarkCategoryText}>{item.category}</Text>
        </View>
        {item.message.metadata?.priority && (
          <View style={[
            styles.bookmarkPriority,
            item.message.metadata.priority === 'high' && styles.bookmarkPriorityHigh,
            item.message.metadata.priority === 'medium' && styles.bookmarkPriorityMedium,
            item.message.metadata.priority === 'low' && styles.bookmarkPriorityLow,
          ]}>
            <Text style={styles.bookmarkPriorityText}>
              {item.message.metadata.priority.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Bookmarks</Text>
          <Text style={styles.subtitle}>Saved messages & notes</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search bookmarks..."
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'all' && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === 'all' && styles.categoryTabTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Bookmarks List */}
      <ScrollView
        style={styles.bookmarksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBookmarks.length > 0 ? (
          <View>
            <Text style={styles.bookmarksCount}>
              {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
            </Text>
            {filteredBookmarks.map(renderBookmarkItem)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No bookmarks yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the bookmark icon on any message to save it here
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Bookmark Modal */}
      {showAddBookmark && selectedMessage && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: animationValue,
                transform: [{ scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }) }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bookmark</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddBookmark(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalMessageText} numberOfLines={3}>
                {selectedMessage.text}
              </Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  value={bookmarkNote}
                  onChangeText={setBookmarkNote}
                  placeholder="Add a note..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Tags</Text>
                <View style={styles.tagsInputContainer}>
                  {bookmarkTags.map((tag, index) => (
                    <View key={index} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        style={styles.tagRemove}
                        onPress={() => removeTag(tag)}
                      >
                        <Text style={styles.tagRemoveIcon}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Add tag..."
                  onSubmitEditing={(e) => addTag(e.nativeEvent.text)}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        selectedCategory === category && styles.categoryOptionActive
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        selectedCategory === category && styles.categoryOptionTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddBookmark(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={saveBookmark}
              >
                <Text style={styles.modalSaveButtonText}>Save Bookmark</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fef3c7',
  },
  searchContainer: {
    marginTop: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  categoryTabs: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  categoryTab: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabActive: {
    backgroundColor: '#f59e0b',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  bookmarksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookmarksCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  bookmarkItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  bookmarkTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookmarkActions: {
    flexDirection: 'row',
  },
  bookmarkActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bookmarkActionIcon: {
    fontSize: 14,
  },
  bookmarkMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  bookmarkNoteContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  bookmarkNoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  bookmarkNoteText: {
    fontSize: 12,
    color: '#78350f',
  },
  bookmarkTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  bookmarkTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  bookmarkTagText: {
    fontSize: 10,
    color: '#6b7280',
  },
  bookmarkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkCategory: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookmarkCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  bookmarkPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookmarkPriorityHigh: {
    backgroundColor: '#ef4444',
  },
  bookmarkPriorityMedium: {
    backgroundColor: '#f59e0b',
  },
  bookmarkPriorityLow: {
    backgroundColor: '#10b981',
  },
  bookmarkPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalBody: {
    flex: 1,
  },
  modalMessageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagsInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#ffffff',
    marginRight: 4,
  },
  tagRemove: {
    padding: 2,
  },
  tagRemoveIcon: {
    fontSize: 10,
    color: '#ffffff',
  },
  categoryOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#f59e0b',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#374151',
  },
  categoryOptionTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
