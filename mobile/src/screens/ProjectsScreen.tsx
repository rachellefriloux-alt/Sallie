/**
 * Projects screen for mobile app.
 * Create projects, manage extensions, and build together with Sallie.
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
  Alert,
} from 'react-native';
import { useTabletLayout } from '../hooks/useTabletLayout';
import APIClient from '../services/api_client';

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  created_ts: number;
}

interface Extension {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
}

interface Skill {
  name: string;
  proficiency: number;
  practice_count: number;
}

type TabType = 'projects' | 'extensions' | 'skills';

export function ProjectsScreen() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const { isTablet, fontSize, spacing } = useTabletLayout();
  const apiClient = React.useRef(new APIClient()).current;

  useEffect(() => {
    loadData();
  }, [currentTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (currentTab) {
        case 'projects':
          // Load projects
          setProjects([]);
          break;
        case 'extensions':
          // Load extensions
          setExtensions([]);
          break;
        case 'skills':
          // Load skills
          setSkills([]);
          break;
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => {
    Alert.prompt(
      'New Project',
      'Enter project description:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (description) => {
            if (description) {
              console.log('Creating project:', description);
              await loadData();
            }
          },
        },
      ]
    );
  };

  const handleNewExtension = () => {
    Alert.prompt(
      'Propose Extension',
      'What capability would you like Sallie to have?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Propose',
          onPress: async (description) => {
            if (description) {
              console.log('Proposing extension:', description);
              await loadData();
            }
          },
        },
      ]
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'extensions', label: 'Extensions' },
    { key: 'skills', label: 'Skills' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#a78bfa" />
        </View>
      );
    }

    switch (currentTab) {
      case 'projects':
        return projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>
              Create a project to start building together!
            </Text>
          </View>
        ) : (
          projects.map((project) => (
            <TouchableOpacity key={project.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{project.name}</Text>
              <Text style={styles.itemDescription}>{project.description}</Text>
              <Text style={styles.itemMeta}>Type: {project.type}</Text>
            </TouchableOpacity>
          ))
        );

      case 'extensions':
        return extensions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No extensions yet</Text>
            <Text style={styles.emptySubtext}>
              Sallie can create new capabilities for herself!
            </Text>
          </View>
        ) : (
          extensions.map((ext) => (
            <TouchableOpacity key={ext.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{ext.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ext.status) }]}>
                  <Text style={styles.statusText}>{ext.status}</Text>
                </View>
              </View>
              <Text style={styles.itemDescription}>{ext.description}</Text>
              <Text style={styles.itemMeta}>Category: {ext.category}</Text>
            </TouchableOpacity>
          ))
        );

      case 'skills':
        return skills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No skills tracked yet</Text>
            <Text style={styles.emptySubtext}>
              Start learning together to see progress!
            </Text>
          </View>
        ) : (
          skills.map((skill, idx) => (
            <View key={idx} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{skill.name}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${skill.proficiency * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(skill.proficiency * 100)}%
                </Text>
              </View>
              <Text style={styles.itemMeta}>
                Practiced {skill.practice_count} times
              </Text>
            </View>
          ))
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'approved':
        return '#3b82f6';
      case 'pending_review':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView
      style={[styles.container, isTablet && styles.containerTablet]}
      contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && { fontSize: fontSize.xl }]}>
          Projects & Building
        </Text>
        <Text style={[styles.subtitle, isTablet && { fontSize: fontSize.base }]}>
          Create, extend, and build together with Sallie
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleNewProject}>
          <Text style={styles.actionButtonText}>+ New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleNewExtension}>
          <Text style={styles.actionButtonText}>+ New Extension</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, currentTab === tab.key && styles.tabActive]}
            onPress={() => setCurrentTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>{renderContent()}</View>
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
  header: {
    marginBottom: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#fff',
  },
  contentContainer: {
    gap: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  itemMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
});
