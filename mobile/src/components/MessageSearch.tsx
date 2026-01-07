/**
 * Message Search Component - Mobile Version
 * Complete message search functionality with top-tier quality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
    keywords?: string[];
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  priority?: string;
  tags?: string[];
  isFromUser?: boolean;
}

interface MessageSearchProps {
  messages: Message[];
  onMessageSelected?: (message: Message) => void;
  placeholder?: string;
  maxResults?: number;
  showFilters?: boolean;
}

export function MessageSearch({
  messages,
  onMessageSelected,
  placeholder = "Search messages...",
  maxResults = 50,
  showFilters = true,
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedSender, setSelectedSender] = useState('all');
  
  const animationValue = useState(new Animated.Value(0))[0];
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Categories from messages
  const categories = useMemo(() => {
    const cats = new Set<string>();
    messages.forEach(msg => {
      if (msg.metadata?.category) {
        cats.add(msg.metadata.category);
      }
    });
    return Array.from(cats);
  }, [messages]);

  // All unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    messages.forEach(msg => {
      if (msg.metadata?.tags) {
        msg.metadata.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [messages]);

  // Search functionality
  const performSearch = useCallback((query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredMessages = messages.filter(message => {
        const searchText = message.text.toLowerCase();
        const searchLower = query.toLowerCase();
        
        // Text search
        if (!searchText.includes(searchLower)) {
          return false;
        }

        // Apply filters
        if (searchFilters.category && message.metadata?.category !== searchFilters.category) {
          return false;
        }

        if (searchFilters.priority && message.metadata?.priority !== searchFilters.priority) {
          return false;
        }

        if (searchFilters.isFromUser !== undefined && message.isFromUser !== searchFilters.isFromUser) {
          return false;
        }

        if (searchFilters.dateRange) {
          const messageDate = new Date(message.timestamp);
          if (messageDate < searchFilters.dateRange.start || messageDate > searchFilters.dateRange.end) {
            return false;
          }
        }

        if (searchFilters.tags && searchFilters.tags.length > 0) {
          const messageTags = message.metadata?.tags || [];
          const hasMatchingTag = searchFilters.tags.some(tag => messageTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        return true;
      });

      // Sort by relevance (simple implementation)
      const sortedResults = filteredMessages.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, query);
        const bScore = calculateRelevanceScore(b, query);
        return bScore - aScore;
      });

      setSearchResults(sortedResults.slice(0, maxResults));
      setIsSearching(false);

      // Add to search history
      if (query.trim() && !searchHistory.includes(query.trim())) {
        setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
      }
    }, 300);
  }, [messages, maxResults, searchHistory]);

  // Calculate relevance score
  const calculateRelevanceScore = (message: Message, query: string): number => {
    let score = 0;
    const searchText = message.text.toLowerCase();
    const searchLower = query.toLowerCase();

    // Exact match gets highest score
    if (searchText === searchLower) {
      score += 100;
    }

    // Starts with query gets high score
    if (searchText.startsWith(searchLower)) {
      score += 50;
    }

    // Contains query gets base score
    if (searchText.includes(searchLower)) {
      score += 25;
    }

    // Keyword matching
    if (message.metadata?.keywords) {
      const keywordMatches = message.metadata.keywords.filter(keyword =>
        keyword.toLowerCase().includes(searchLower)
      ).length;
      score += keywordMatches * 10;
    }

    // Tag matching
    if (message.metadata?.tags) {
      const tagMatches = message.metadata.tags.filter(tag =>
        tag.toLowerCase().includes(searchLower)
      ).length;
      score += tagMatches * 5;
    }

    // Priority bonus
    if (message.metadata?.priority === 'high') {
      score += 10;
    } else if (message.metadata?.priority === 'medium') {
      score += 5;
    }

    // Recency bonus (more recent messages get slight bonus)
    const messageAge = Date.now() - new Date(message.timestamp).getTime();
    const recencyBonus = Math.max(0, 10 - Math.floor(messageAge / (1000 * 60 * 60 * 24)));
    score += recencyBonus;

    return score;
  };

  // Handle search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Apply current filters
    const currentFilters: SearchFilters = {};
    if (selectedCategory !== 'all') {
      currentFilters.category = selectedCategory;
    }
    if (selectedPriority !== 'all') {
      currentFilters.priority = selectedPriority;
    }
    if (selectedSender !== 'all') {
      currentFilters.isFromUser = selectedSender === 'user';
    }
    
    performSearch(text, currentFilters);
  }, [selectedCategory, selectedPriority, selectedSender, performSearch]);

  // Handle message selection
  const handleMessagePress = useCallback((message: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onMessageSelected) {
      onMessageSelected(message);
    }
  }, [onMessageSelected]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <Text key={index} style={styles.highlightText}>{part}</Text> : 
        <Text key={index}>{part}</Text>
    );
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleMessagePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultSender}>
            {item.isFromUser ? 'You' : 'Sallie'}
          </Text>
          <Text style={styles.resultTimestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        {item.metadata?.priority && (
          <View style={[
            styles.priorityBadge,
            item.metadata.priority === 'high' && styles.priorityHigh,
            item.metadata.priority === 'medium' && styles.priorityMedium,
            item.metadata.priority === 'low' && styles.priorityLow,
          ]}>
            <Text style={styles.priorityText}>
              {item.metadata.priority.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.resultText} numberOfLines={3}>
        {highlightText(item.text, searchQuery)}
      </Text>
      
      {(item.metadata?.tags || item.metadata?.category) && (
        <View style={styles.resultTags}>
          {item.metadata?.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.metadata.category}</Text>
            </View>
          )}
          {item.metadata?.tags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Search Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {showFilters && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFiltersModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.filterIcon}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
          <TouchableOpacity
            style={[
              styles.quickFilter,
              selectedCategory === 'all' && styles.quickFilterActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.quickFilterText,
              selectedCategory === 'all' && styles.quickFilterTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickFilter,
              selectedSender === 'user' && styles.quickFilterActive
            ]}
            onPress={() => setSelectedSender(selectedSender === 'user' ? 'all' : 'user')}
          >
            <Text style={[
              styles.quickFilterText,
              selectedSender === 'user' && styles.quickFilterTextActive
            ]}>
              From You
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickFilter,
              selectedSender === 'sallie' && styles.quickFilterActive
            ]}
            onPress={() => setSelectedSender(selectedSender === 'sallie' ? 'all' : 'sallie')}
          >
            <Text style={[
              styles.quickFilterText,
              selectedSender === 'sallie' && styles.quickFilterTextActive
            ]}>
              From Sallie
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.quickFilter,
                selectedCategory === category && styles.quickFilterActive
              ]}
              onPress={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
            >
              <Text style={[
                styles.quickFilterText,
                selectedCategory === category && styles.quickFilterTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchQuery.length > 0 && searchResults.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords or filters</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View>
            <Text style={styles.resultsCount}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.resultsList}
            />
          </View>
        ) : searchHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            {searchHistory.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => handleSearchChange(query)}
                activeOpacity={0.7}
              >
                <Text style={styles.historyIcon}>🕐</Text>
                <Text style={styles.historyText}>{query}</Text>
                <TouchableOpacity
                  style={styles.historyRemove}
                  onPress={() => {
                    setSearchHistory(prev => prev.filter((_, i) => i !== index));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.historyRemoveIcon}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Start typing to search messages</Text>
          </View>
        )}
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
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
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 18,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  quickFilter: {
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
  quickFilterActive: {
    backgroundColor: '#8b5cf6',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#ffffff',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  highlightText: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '600',
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
  },
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#6b7280',
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  historyRemove: {
    padding: 4,
  },
  historyRemoveIcon: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
