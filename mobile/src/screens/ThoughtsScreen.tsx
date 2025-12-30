/**
 * Thoughts Log screen for mobile app.
 * Displays internal monologue and cognitive processes.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';

interface LogEntry {
  timestamp: string;
  type: string;
  content: string;
  metadata?: any;
}

type FilterType = 'all' | 'debates' | 'friction' | 'decisions';

export function ThoughtsScreen() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const { isTablet, fontSize, spacing } = useTabletLayout();

  useEffect(() => {
    loadLogEntries();
  }, []);

  const loadLogEntries = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate loading
      setEntries([
        {
          timestamp: new Date().toISOString(),
          type: 'debate',
          content: 'Gemini proposed options, INFJ filtered...',
        },
      ]);
    } catch (err) {
      console.error('Failed to load log entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === 'all') return true;
    if (filter === 'debates' && entry.type === 'debate') return true;
    if (filter === 'friction' && entry.type === 'friction') return true;
    if (filter === 'decisions' && entry.type === 'decision') return true;
    return false;
  });

  const handleExport = async () => {
    try {
      const exportData = JSON.stringify(filteredEntries, null, 2);
      await Share.share({
        message: exportData,
        title: `Thoughts Log - ${new Date().toISOString().split('T')[0]}`,
      });
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  const toggleExpand = (entryId: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Loading thoughts log...</Text>
      </View>
    );
  }

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'debates', label: 'Debates' },
    { key: 'friction', label: 'Friction' },
    { key: 'decisions', label: 'Decisions' },
  ];

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Thoughts Log
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Internal monologue and cognitive processes
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={[styles.searchInput, isTablet && styles.searchInputTablet]}
          placeholder="Search log entries..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search thoughts log"
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                filter === option.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === option.key }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.key && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            accessibilityLabel="Export thoughts log"
          >
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Log Entries */}
      <View style={styles.entriesContainer}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No log entries found</Text>
          </View>
        ) : (
          filteredEntries.map((entry, idx) => {
            const entryId = `entry-${idx}`;
            const isExpanded = expandedEntries.has(entryId);
            const shouldTruncate = entry.content.length > 200;
            
            return (
              <View key={idx} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryType}>{entry.type.toUpperCase()}</Text>
                  <Text style={styles.entryTime}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                </View>
                
                <Text style={styles.entryContent}>
                  {isExpanded || !shouldTruncate
                    ? entry.content
                    : `${entry.content.substring(0, 200)}...`}
                </Text>
                
                {shouldTruncate && (
                  <TouchableOpacity
                    onPress={() => toggleExpand(entryId)}
                    accessibilityLabel={isExpanded ? 'Show less' : 'Show more'}
                  >
                    <Text style={styles.toggleButton}>
                      {isExpanded ? 'Show less' : 'Show more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
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
  filtersContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  searchInputTablet: {
    fontSize: 16,
    paddingVertical: 14,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed',
  },
  filterButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  exportButton: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  entriesContainer: {
    gap: 12,
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
  entryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa',
  },
  entryTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  entryContent: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  toggleButton: {
    fontSize: 12,
    color: '#a78bfa',
    marginTop: 8,
  },
});
