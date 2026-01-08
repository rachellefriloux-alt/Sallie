/**
 * Creative Atelier Dimension - Mobile Version
 * Complete creative workspace and project management
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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CreativeProject {
  id: string;
  name: string;
  description: string;
  category: 'writing' | 'art' | 'music' | 'design' | 'video' | 'other';
  status: 'active' | 'completed' | 'paused' | 'archived';
  progress: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  tags: string[];
  collaborators?: string[];
}

interface CreativeAtelierDimensionProps {
  navigation: any;
}

const categories = [
  { id: 'writing', name: 'Writing', icon: '✍️', color: '#8b5cf6' },
  { id: 'art', name: 'Art', icon: '🎨', color: '#ec4899' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#3b82f6' },
  { id: 'design', name: 'Design', icon: '🎯', color: '#10b981' },
  { id: 'video', name: 'Video', icon: '🎬', color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: '💡', color: '#6b7280' },
];

export function CreativeAtelierDimension({ navigation }: CreativeAtelierDimensionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('writing');
  const [showDetails, setShowDetails] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [projects, setProjects] = useState<CreativeProject[]>([
    {
      id: 'novel-chapter-1',
      name: 'Novel Chapter 1',
      description: 'First chapter of the mystery novel',
      category: 'writing',
      status: 'active',
      progress: 65,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-08T12:00:00Z',
      deadline: '2024-01-15T00:00:00Z',
      tags: ['fiction', 'mystery', 'creative'],
      collaborators: ['editor123', 'beta-reader456'],
    },
    {
      id: 'album-artwork',
      name: 'Album Artwork',
      description: 'Cover design for new music album',
      category: 'art',
      status: 'active',
      progress: 40,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-08T15:30:00Z',
      tags: ['digital', 'music', 'design'],
    },
    {
      id: 'soundtrack-ambient',
      name: 'Ambient Soundtrack',
      description: 'Background music for meditation app',
      category: 'music',
      status: 'paused',
      progress: 25,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-07T09:00:00Z',
      tags: ['ambient', 'meditation', 'electronic'],
    },
    {
      id: 'logo-redesign',
      name: 'Logo Redesign',
      description: 'Company logo redesign project',
      category: 'design',
      status: 'completed',
      progress: 100,
      createdAt: '2023-12-15T00:00:00Z',
      updatedAt: '2024-01-06T14:00:00Z',
      tags: ['branding', 'corporate', 'design'],
    },
    {
      id: 'tutorial-series',
      name: 'Tutorial Series',
      description: 'Video tutorial series for creative tools',
      category: 'video',
      status: 'active',
      progress: 30,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-08T16:00:00Z',
      tags: ['education', 'video', 'tutorial'],
    },
  ]);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalProjects = projects.length;
    const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects;
    
    return {
      activeProjects,
      completedProjects,
      totalProjects,
      avgProgress: Math.round(avgProgress),
      productivity: completedProjects > 0 ? 'high' : avgProgress > 50 ? 'medium' : 'low',
    };
  }, [projects]);

  // Animation effects
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

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, []);

  // Handle project creation
  const handleCreateProject = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Create New Project',
      'Start a new creative project',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: () => {
            const newProject: CreativeProject = {
              id: `project-${Date.now()}`,
              name: 'New Creative Project',
              description: 'Description of your creative project',
              category: selectedCategory as any,
              status: 'active',
              progress: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              tags: [],
            };
            setProjects(prev => [newProject, ...prev]);
          }
        },
      ]
    );
  }, [selectedCategory]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'paused': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  // Selected category data
  const selectedCategoryData = useMemo(() => {
    return categories.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#6366f1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Creative Atelier</Text>
          <Text style={styles.subtitle}>Creative Workspace & Projects</Text>
        </View>
      </LinearGradient>

      {/* Metrics Overview */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <Animated.View
          style={[
            styles.metricsContainer,
            {
              opacity: animationValue,
              transform: [{ translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }) }],
            },
          ]}
        >
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.activeProjects}</Text>
              <Text style={styles.metricLabel}>Active</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.completedProjects}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.avgProgress}%</Text>
              <Text style={styles.metricLabel}>Avg Progress</Text>
            </View>
          </View>

          {/* Productivity Indicator */}
          <View style={styles.productivityContainer}>
            <Text style={styles.productivityLabel}>Productivity</Text>
            <View style={[
              styles.productivityBadge,
              { backgroundColor: derivedMetrics.productivity === 'high' ? '#10b981' :
                               derivedMetrics.productivity === 'medium' ? '#3b82f6' : '#f59e0b' }
            ]}>
              <Text style={styles.productivityText}>
                {derivedMetrics.productivity.charAt(0).toUpperCase() + derivedMetrics.productivity.slice(1)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Project Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProject}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create New Project</Text>
        </TouchableOpacity>

        {/* Projects List */}
        <View style={styles.projectsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryData?.name} Projects
          </Text>
          
          {filteredProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                </View>
                <View style={styles.projectStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(project.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(project.status) }
                  ]}>
                    {project.status}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progress</Text>
                <View style={styles.progressBar}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${project.progress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
              </View>

              {/* Tags */}
              {project.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsLabel}>Tags</Text>
                  <View style={styles.tagsList}>
                    {project.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Deadline */}
              {project.deadline && (
                <View style={styles.deadlineContainer}>
                  <Text style={styles.deadlineLabel}>Deadline</Text>
                  <Text style={styles.deadlineValue}>
                    {new Date(project.deadline).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {/* Collaborators */}
              {project.collaborators && project.collaborators.length > 0 && (
                <View style={styles.collaboratorsContainer}>
                  <Text style={styles.collaboratorsLabel}>Collaborators</Text>
                  <Text style={styles.collaboratorsValue}>
                    {project.collaborators.length} people
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.projectActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionLabel}>Quick Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.actionIcon}>🎨</Text>
              <Text style={styles.actionLabel}>Sketch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.actionIcon}>🎵</Text>
              <Text style={styles.actionLabel}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  productivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productivityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  productivityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  productivityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryTab: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabActive: {
    backgroundColor: '#8b5cf6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  categoryNameActive: {
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  projectsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  projectStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  deadlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deadlineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  deadlineValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  collaboratorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collaboratorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  collaboratorsValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
});
