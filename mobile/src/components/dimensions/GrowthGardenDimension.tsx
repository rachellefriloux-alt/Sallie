/**
 * Growth Garden Dimension - Mobile Version
 * Complete personal growth and development tracking
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GrowthGoal {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'mental' | 'emotional' | 'spiritual' | 'professional' | 'social';
  status: 'active' | 'completed' | 'paused' | 'archived';
  progress: number;
  targetDate: string;
  createdAt: string;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  habits: Array<{
    id: string;
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    streak: number;
    lastCompleted: string;
  }>;
}

interface GrowthGardenDimensionProps {
  navigation: any;
}

const categories = [
  { id: 'physical', name: 'Physical', icon: '💪', color: '#ef4444' },
  { id: 'mental', name: 'Mental', icon: '🧠', color: '#3b82f6' },
  { id: 'emotional', name: 'Emotional', icon: '❤️', color: '#ec4899' },
  { id: 'spiritual', name: 'Spiritual', icon: '🔮', color: '#8b5cf6' },
  { id: 'professional', name: 'Professional', icon: '💼', color: '#10b981' },
  { id: 'social', name: 'Social', icon: '👥', color: '#f59e0b' },
];

export function GrowthGardenDimension({ navigation }: GrowthGardenDimensionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('physical');
  const [animationValue] = useState(new Animated.Value(0));
  const [goals, setGoals] = useState<GrowthGoal[]>([
    {
      id: 'fitness-goal',
      title: 'Fitness Transformation',
      description: 'Achieve optimal physical fitness through consistent training',
      category: 'physical',
      status: 'active',
      progress: 45,
      targetDate: '2024-06-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      milestones: [
        { id: 'm1', title: 'Lose 10 pounds', completed: true, completedAt: '2024-01-15T00:00:00Z' },
        { id: 'm2', title: 'Run 5K', completed: true, completedAt: '2024-01-20T00:00:00Z' },
        { id: 'm3', title: 'Build muscle mass', completed: false },
        { id: 'm4', title: 'Maintain healthy diet', completed: false },
      ],
      habits: [
        { id: 'h1', name: 'Morning workout', frequency: 'daily', streak: 21, lastCompleted: '2024-01-08T07:00:00Z' },
        { id: 'h2', name: 'Healthy meal prep', frequency: 'weekly', streak: 4, lastCompleted: '2024-01-07T18:00:00Z' },
      ],
    },
    {
      id: 'mindfulness-practice',
      title: 'Mindfulness Practice',
      description: 'Develop consistent meditation and mindfulness habits',
      category: 'mental',
      status: 'active',
      progress: 70,
      targetDate: '2024-03-01T00:00:00Z',
      createdAt: '2023-12-01T00:00:00Z',
      milestones: [
        { id: 'm1', title: 'Meditate 10 min daily', completed: true, completedAt: '2023-12-15T00:00:00Z' },
        { id: 'm2', title: 'Complete mindfulness course', completed: true, completedAt: '2024-01-01T00:00:00Z' },
        { id: 'm3', title: 'Practice mindful eating', completed: false },
      ],
      habits: [
        { id: 'h1', name: 'Morning meditation', frequency: 'daily', streak: 45, lastCompleted: '2024-01-08T06:30:00Z' },
        { id: 'h2', name: 'Evening reflection', frequency: 'daily', streak: 30, lastCompleted: '2024-01-08T22:00:00Z' },
      ],
    },
  ]);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalGoals = goals.length;
    const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals;
    const totalHabits = goals.reduce((sum, g) => sum + g.habits.length, 0);
    const avgStreak = goals.reduce((sum, g) => 
      sum + g.habits.reduce((hSum, h) => hSum + h.streak, 0), 0) / totalHabits;
    
    return {
      activeGoals,
      completedGoals,
      totalGoals,
      avgProgress: Math.round(avgProgress),
      totalHabits,
      avgStreak: Math.round(avgStreak),
      growthRate: avgProgress > 70 ? 'excellent' : avgProgress > 50 ? 'good' : 'developing',
    };
  }, [goals]);

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

  // Filter goals by category
  const filteredGoals = useMemo(() => {
    return goals.filter(g => g.category === selectedCategory);
  }, [goals, selectedCategory]);

  // Selected category data
  const selectedCategoryData = useMemo(() => {
    return categories.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Growth Garden</Text>
          <Text style={styles.subtitle}>Personal Growth & Development</Text>
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
              <Text style={styles.metricValue}>{derivedMetrics.activeGoals}</Text>
              <Text style={styles.metricLabel}>Active Goals</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.avgProgress}%</Text>
              <Text style={styles.metricLabel}>Avg Progress</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{derivedMetrics.avgStreak}</Text>
              <Text style={styles.metricLabel}>Avg Streak</Text>
            </View>
          </View>

          {/* Growth Rate */}
          <View style={styles.growthContainer}>
            <Text style={styles.growthLabel}>Growth Rate</Text>
            <View style={[
              styles.growthBadge,
              { backgroundColor: derivedMetrics.growthRate === 'excellent' ? '#10b981' :
                               derivedMetrics.growthRate === 'good' ? '#3b82f6' : '#f59e0b' }
            ]}>
              <Text style={styles.growthText}>
                {derivedMetrics.growthRate.charAt(0).toUpperCase() + derivedMetrics.growthRate.slice(1)}
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

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryData?.name} Goals
          </Text>
          
          {filteredGoals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
                <View style={styles.goalStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(goal.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(goal.status) }
                  ]}>
                    {goal.status}
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
                        { width: `${goal.progress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressValue}>{goal.progress}%</Text>
                </View>
              </View>

              {/* Target Date */}
              <View style={styles.targetDateContainer}>
                <Text style={styles.targetDateLabel}>Target Date</Text>
                <Text style={styles.targetDateValue}>
                  {new Date(goal.targetDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Milestones */}
              <View style={styles.milestonesContainer}>
                <Text style={styles.milestonesLabel}>Milestones</Text>
                {goal.milestones.map((milestone) => (
                  <View key={milestone.id} style={styles.milestoneItem}>
                    <View style={[
                      styles.milestoneDot,
                      { backgroundColor: milestone.completed ? '#10b981' : '#e5e7eb' }
                    ]} />
                    <Text style={[
                      styles.milestoneText,
                      milestone.completed && styles.milestoneTextCompleted
                    ]}>
                      {milestone.title}
                    </Text>
                    {milestone.completed && (
                      <Text style={styles.milestoneDate}>
                        {new Date(milestone.completedAt!).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Habits */}
              <View style={styles.habitsContainer}>
                <Text style={styles.habitsLabel}>Habits</Text>
                {goal.habits.map((habit) => (
                  <View key={habit.id} style={styles.habitItem}>
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text style={styles.habitFrequency}>{habit.frequency}</Text>
                    </View>
                    <View style={styles.habitStreak}>
                      <Text style={styles.habitStreakText}>{habit.streak} days</Text>
                      <Text style={styles.habitLastCompleted}>
                        Last: {new Date(habit.lastCompleted).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionLabel}>New Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔥</Text>
              <Text style={styles.actionLabel}>Streaks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📈</Text>
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
  growthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  growthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  growthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: {
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
    backgroundColor: '#10b981',
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
  goalsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  goalStatus: {
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
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  targetDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  targetDateValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  milestonesContainer: {
    marginBottom: 12,
  },
  milestonesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  milestoneText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  milestoneTextCompleted: {
    color: '#10b981',
    textDecorationLine: 'line-through',
  },
  milestoneDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  habitsContainer: {
    marginBottom: 12,
  },
  habitsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  habitFrequency: {
    fontSize: 10,
    color: '#6b7280',
  },
  habitStreak: {
    alignItems: 'flex-end',
  },
  habitStreakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  habitLastCompleted: {
    fontSize: 10,
    color: '#9ca3af',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
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
