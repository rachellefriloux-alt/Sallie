/**
 * Heritage browser screen for mobile app.
 * Allows users to explore Sallie's identity DNA and learned beliefs.
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
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import APIClient from '../services/api_client';

interface HeritageData {
  core?: any;
  preferences?: any;
  learned?: any;
  version?: string;
}

export function HeritageScreen() {
  const [heritage, setHeritage] = useState<HeritageData>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<'core' | 'preferences' | 'learned'>('core');
  const { isTablet, fontSize, spacing } = useTabletLayout();

  useEffect(() => {
    loadHeritage();
  }, []);

  const loadHeritage = async () => {
    try {
      // In a real implementation, these would be API endpoints
      // For now, we'll simulate loading
      setHeritage({
        core: { version: '1.0', note: 'Heritage core data' },
        preferences: { version: '1.0', note: 'Support preferences' },
        learned: { version: '1.0', learned_beliefs: [], conditional_beliefs: [] },
      });
    } catch (err) {
      console.error('Failed to load heritage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Loading heritage...</Text>
      </View>
    );
  }

  const currentData = heritage[selectedFile] || {};
  const dataString = JSON.stringify(currentData, null, 2);
  const filteredData = searchQuery
    ? dataString.split('\n').filter((line) =>
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join('\n')
    : dataString;

  const files = [
    { key: 'core' as const, label: '📜 core.json' },
    { key: 'preferences' as const, label: '⚙️ preferences.json' },
    { key: 'learned' as const, label: '🧠 learned.json' },
  ];

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Heritage Browser
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Explore Sallie's identity DNA and learned beliefs
        </Text>
      </View>

      {/* File Tabs */}
      <View style={[styles.tabContainer, isTablet && styles.tabContainerTablet]}>
        {files.map((file) => (
          <TouchableOpacity
            key={file.key}
            style={[
              styles.tab,
              selectedFile === file.key && styles.tabActive,
              isTablet && styles.tabTablet,
            ]}
            onPress={() => setSelectedFile(file.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedFile === file.key }}
          >
            <Text
              style={[
                styles.tabText,
                selectedFile === file.key && styles.tabTextActive,
              ]}
            >
              {file.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isTablet && styles.searchInputTablet]}
          placeholder="Search..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search heritage data"
        />
      </View>

      {/* Content Viewer */}
      <View style={[styles.contentViewer, isTablet && styles.contentViewerTablet]}>
        <ScrollView horizontal={false}>
          <Text style={styles.codeText}>{filteredData}</Text>
        </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabContainerTablet: {
    gap: 12,
  },
  tab: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabTablet: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#a78bfa',
  },
  searchContainer: {
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
  },
  searchInputTablet: {
    fontSize: 16,
    paddingVertical: 14,
  },
  contentViewer: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 16,
    minHeight: 300,
  },
  contentViewerTablet: {
    minHeight: 400,
    padding: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
