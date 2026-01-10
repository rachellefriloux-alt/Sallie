import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Zap, 
  Activity,
  Clock,
  Star,
  Heart,
  Rocket,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Trophy,
  Medal,
  GraduationCap,
  BrainCircuit,
  NeuralNetwork,
  Database,
  FileText,
  Code,
  Globe,
  Users,
  Settings,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  TargetIcon
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface LearningDashboardPremiumProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  practice_count: number;
  last_practiced: string;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  learning_rate: number;
  retention_rate: number;
  difficulty_score: number;
  time_to_mastery: number;
  prerequisites: string[];
  related_skills: string[];
  practice_streak: number;
  best_practice_score: number;
  total_practice_time: number;
  next_practice_recommended: string;
  neural_efficiency: number;
  knowledge_depth: number;
  application_success_rate: number;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number;
  completion_percentage: number;
  skills_required: string[];
  skills_acquired: string[];
  current_module: string;
  total_modules: number;
  progress_milestones: {
    module: string;
    completed: boolean;
    completed_at?: string;
    score?: number;
  }[];
  learning_objectives: string[];
  prerequisites: string[];
  outcomes: string[];
  last_progress_update: string;
  average_session_time: number;
  retention_score: number;
  application_projects: number;
}

interface LearningSession {
  id: string;
  skill_id: string;
  skill_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  practice_type: 'guided' | 'free' | 'challenge' | 'assessment';
  difficulty: number;
  performance_score: number;
  improvement_score: number;
  mistakes_made: number;
  mistakes_corrected: number;
  insights_gained: string[];
  neural_activity: {
    focus_level: number;
    engagement_level: number;
    cognitive_load: number;
    learning_efficiency: number;
  };
  context: {
    time_of_day: string;
    environment: string;
    session_length: 'short' | 'medium' | 'long';
    preceding_activity: string;
  };
}

interface LearningMetrics {
  total_skills: number;
  mastered_skills: number;
  in_progress_skills: number;
  total_practice_time: number;
  average_session_duration: number;
  learning_velocity: number;
  retention_rate: number;
  application_success_rate: number;
  neural_efficiency: number;
  knowledge_depth_score: number;
  learning_streak_days: number;
  best_practice_streak: number;
  total_insights_gained: number;
  difficulty_progression: number;
  cross_domain_connections: number;
  adaptive_learning_score: number;
  performance_trend: 'improving' | 'stable' | 'declining';
  optimal_learning_time: string;
  preferred_learning_style: string;
  cognitive_load_capacity: number;
}

const SKILL_CATEGORIES = [
  { id: 'technical', name: 'Technical', icon: Code, color: '#3B82F6' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#8B5CF6' },
  { id: 'analytical', name: 'Analytical', icon: BarChart3, color: '#10B981' },
  { id: 'communication', name: 'Communication', icon: Users, color: '#F59E0B' },
  { id: 'leadership', name: 'Leadership', icon: Trophy, color: '#EF4444' },
  { id: 'adaptive', name: 'Adaptive', icon: BrainCircuit, color: '#06B6D4' }
];

const MASTERY_LEVELS = {
  beginner: { min: 0, max: 0.25, color: '#EF4444', label: 'Beginner' },
  intermediate: { min: 0.25, max: 0.5, color: '#F59E0B', label: 'Intermediate' },
  advanced: { min: 0.5, max: 0.75, color: '#3B82F6', label: 'Advanced' },
  expert: { min: 0.75, max: 0.9, color: '#8B5CF6', label: 'Expert' },
  master: { min: 0.9, max: 1.0, color: '#10B981', label: 'Master' }
};

export const LearningDashboardPremium: React.FC<LearningDashboardPremiumProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'skills']));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'proficiency' | 'practice_count' | 'last_practiced' | 'mastery_level'>('proficiency');

  // Animation values
  const pulseScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeUpdates || !autoRefresh) return;

    const interval = setInterval(() => {
      loadLearningData();
    }, 3000);
    return () => clearInterval(interval);
  }, [realTimeUpdates, autoRefresh]);

  // Initialize data
  useEffect(() => {
    loadLearningData();
  }, []);

  // Pulse animation for connected status
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const loadLearningData = useCallback(async () => {
    try {
      // Simulate API calls
      const mockSkills: Skill[] = [
        {
          id: '1',
          name: 'React Development',
          category: 'technical',
          proficiency: 0.87,
          practice_count: 156,
          last_practiced: new Date(Date.now() - 86400000).toISOString(),
          mastery_level: 'expert',
          learning_rate: 0.92,
          retention_rate: 0.94,
          difficulty_score: 0.75,
          time_to_mastery: 120,
          prerequisites: ['JavaScript', 'HTML/CSS'],
          related_skills: ['TypeScript', 'Next.js', 'React Native'],
          practice_streak: 12,
          best_practice_score: 0.96,
          total_practice_time: 48.5,
          next_practice_recommended: '2025-01-10T14:00:00Z',
          neural_efficiency: 0.89,
          knowledge_depth: 0.91,
          application_success_rate: 0.93
        },
        {
          id: '2',
          name: 'Creative Problem Solving',
          category: 'creative',
          proficiency: 0.73,
          practice_count: 89,
          last_practiced: new Date(Date.now() - 172800000).toISOString(),
          mastery_level: 'advanced',
          learning_rate: 0.78,
          retention_rate: 0.85,
          difficulty_score: 0.68,
          time_to_mastery: 90,
          prerequisites: ['Critical Thinking'],
          related_skills: ['Design Thinking', 'Innovation', 'Brainstorming'],
          practice_streak: 7,
          best_practice_score: 0.88,
          total_practice_time: 32.1,
          next_practice_recommended: '2025-01-09T16:00:00Z',
          neural_efficiency: 0.82,
          knowledge_depth: 0.79,
          application_success_rate: 0.86
        },
        {
          id: '3',
          name: 'Data Analysis',
          category: 'analytical',
          proficiency: 0.91,
          practice_count: 203,
          last_practiced: new Date(Date.now() - 3600000).toISOString(),
          mastery_level: 'expert',
          learning_rate: 0.95,
          retention_rate: 0.97,
          difficulty_score: 0.82,
          time_to_mastery: 150,
          prerequisites: ['Statistics', 'Excel'],
          related_skills: ['Machine Learning', 'Data Visualization', 'SQL'],
          practice_streak: 23,
          best_practice_score: 0.98,
          total_practice_time: 61.2,
          next_practice_recommended: '2025-01-08T10:00:00Z',
          neural_efficiency: 0.94,
          knowledge_depth: 0.93,
          application_success_rate: 0.96
        }
      ];

      const mockPaths: LearningPath[] = [
        {
          id: '1',
          name: 'Full Stack Development',
          description: 'Master end-to-end web development',
          category: 'technical',
          difficulty: 'advanced',
          estimated_duration: 180,
          completion_percentage: 0.67,
          skills_required: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
          skills_acquired: ['HTML/CSS', 'JavaScript', 'React'],
          current_module: 'Backend Development',
          total_modules: 8,
          progress_milestones: [
            { module: 'Frontend Basics', completed: true, completed_at: '2024-12-01T10:00:00Z', score: 0.94 },
            { module: 'React Fundamentals', completed: true, completed_at: '2024-12-15T14:00:00Z', score: 0.91 },
            { module: 'State Management', completed: true, completed_at: '2025-01-02T16:00:00Z', score: 0.88 },
            { module: 'Backend Development', completed: false }
          ],
          learning_objectives: [
            'Build responsive web applications',
            'Implement RESTful APIs',
            'Manage application state',
            'Deploy applications to production'
          ],
          prerequisites: ['Basic Programming'],
          outcomes: ['Full Stack Developer', 'Portfolio Projects', 'Industry Readiness'],
          last_progress_update: new Date(Date.now() - 86400000).toISOString(),
          average_session_time: 45,
          retention_score: 0.89,
          application_projects: 3
        }
      ];

      const mockSessions: LearningSession[] = [
        {
          id: '1',
          skill_id: '1',
          skill_name: 'React Development',
          start_time: new Date(Date.now() - 7200000).toISOString(),
          end_time: new Date(Date.now() - 3600000).toISOString(),
          duration: 3600,
          practice_type: 'guided',
          difficulty: 0.75,
          performance_score: 0.92,
          improvement_score: 0.08,
          mistakes_made: 3,
          mistakes_corrected: 3,
          insights_gained: ['Component optimization patterns', 'State management best practices'],
          neural_activity: {
            focus_level: 0.89,
            engagement_level: 0.94,
            cognitive_load: 0.72,
            learning_efficiency: 0.91
          },
          context: {
            time_of_day: 'morning',
            environment: 'quiet',
            session_length: 'medium',
            preceding_activity: 'break'
          }
        }
      ];

      const mockMetrics: LearningMetrics = {
        total_skills: 24,
        mastered_skills: 8,
        in_progress_skills: 12,
        total_practice_time: 156.7,
        average_session_duration: 42.3,
        learning_velocity: 0.87,
        retention_rate: 0.91,
        application_success_rate: 0.89,
        neural_efficiency: 0.86,
        knowledge_depth_score: 0.83,
        learning_streak_days: 15,
        best_practice_streak: 23,
        total_insights_gained: 342,
        difficulty_progression: 0.78,
        cross_domain_connections: 18,
        adaptive_learning_score: 0.92,
        performance_trend: 'improving',
        optimal_learning_time: '09:00',
        preferred_learning_style: 'visual',
        cognitive_load_capacity: 0.74
      };

      setSkills(mockSkills);
      setLearningPaths(mockPaths);
      setRecentSessions(mockSessions);
      setLearningMetrics(mockMetrics);
      setError(null);
    } catch (error) {
      console.error('Failed to load learning data:', error);
      setError('Failed to load learning data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getMasteryLevel = (proficiency: number) => {
    for (const [level, config] of Object.entries(MASTERY_LEVELS)) {
      if (proficiency >= config.min && proficiency <= config.max) {
        return { level, ...config };
      }
    }
    return { level: 'beginner', ...MASTERY_LEVELS.beginner };
  };

  const getCategoryIcon = (category: string) => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.icon || Brain;
  };

  const getCategoryColor = (category: string) => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.color || '#6B7280';
  };

  const filteredAndSortedSkills = useMemo(() => {
    let filtered = skills;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'proficiency':
          return b.proficiency - a.proficiency;
        case 'practice_count':
          return b.practice_count - a.practice_count;
        case 'last_practiced':
          return new Date(b.last_practiced).getTime() - new Date(a.last_practiced).getTime();
        case 'mastery_level':
          return b.proficiency - a.proficiency;
        default:
          return 0;
      }
    });
  }, [skills, selectedCategory, searchQuery, sortBy]);

  const renderSkillItem = ({ item: skill }: { item: Skill }) => {
    const mastery = getMasteryLevel(skill.proficiency);
    const CategoryIcon = getCategoryIcon(skill.category);
    const categoryColor = getCategoryColor(skill.category);
    
    return (
      <TouchableOpacity
        style={styles.skillItem}
        onPress={() => setSelectedSkill(skill)}
      >
        <View style={styles.skillHeader}>
          <View style={[styles.skillIcon, { backgroundColor: categoryColor + '20' }]}>
            <CategoryIcon size={16} style={{ color: categoryColor }} />
          </View>
          <View style={styles.skillInfo}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillCategory}>{skill.category}</Text>
          </View>
          <View style={styles.skillLevel}>
            <Text style={[styles.masteryLevel, { color: mastery.color }]}>
              {mastery.label}
            </Text>
            <Text style={styles.proficiencyText}>
              {(skill.proficiency * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Proficiency</Text>
          <Text style={styles.progressValue}>{(skill.proficiency * 100).toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${skill.proficiency * 100}%`, backgroundColor: mastery.color }
            ]} 
          />
        </View>

        <View style={styles.skillMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Practice:</Text>
            <Text style={styles.metricValue}>{skill.practice_count}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Streak:</Text>
            <Text style={styles.metricValue}>{skill.practice_streak}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Neural:</Text>
            <Text style={styles.metricValue}>{(skill.neural_efficiency * 100).toFixed(0)}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Depth:</Text>
            <Text style={styles.metricValue}>{(skill.knowledge_depth * 100).toFixed(0)}%</Text>
          </View>
        </View>

        {showAdvancedMetrics && (
          <View style={styles.nextPractice}>
            <Text style={styles.nextPracticeLabel}>Next Practice</Text>
            <Text style={styles.nextPracticeDate}>
              {new Date(skill.next_practice_recommended).toLocaleDateString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingSpinner,
            { transform: [{ rotate: rotationValue }] }
          ]}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1', '#4F46E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2', '#0E7490']}
                style={styles.crownIcon}
              >
                <Text style={styles.crownText}>🧠</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Learning Dashboard</Text>
                <Text style={styles.headerSubtitle}>Adaptive Learning & Neural Development</Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => setAutoRefresh(!autoRefresh)}
                style={[
                  styles.iconButton,
                  autoRefresh && styles.iconButtonActive
                ]}
              >
                <RefreshCw 
                  size={16} 
                  color={autoRefresh ? "#FFFFFF" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Learning Metrics Overview */}
      {learningMetrics && (
        <BlurView intensity={20} tint="dark" style={styles.metricsCard}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.metricsCardGradient}
          >
            <Text style={styles.metricsTitle}>Learning Metrics</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{learningMetrics.total_skills}</Text>
                <Text style={styles.metricCardLabel}>Total Skills</Text>
                <Text style={styles.metricCardSubtext}>{learningMetrics.mastered_skills} mastered</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>
                  {(learningMetrics.learning_velocity * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricCardLabel}>Learning Velocity</Text>
                <Text style={styles.metricCardSubtext}>{learningMetrics.performance_trend}</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>
                  {(learningMetrics.neural_efficiency * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricCardLabel}>Neural Efficiency</Text>
                <Text style={styles.metricCardSubtext}>
                  Cognitive: {(learningMetrics.cognitive_load_capacity * 100).toFixed(0)}%
                </Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricCardValue}>{learningMetrics.learning_streak_days}</Text>
                <Text style={styles.metricCardLabel}>Learning Streak</Text>
                <Text style={styles.metricCardSubtext}>Best: {learningMetrics.best_practice_streak} days</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      )}

      {/* Skills Section */}
      <BlurView intensity={20} tint="dark" style={styles.skillsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.skillsCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('skills')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Brain size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Skills Development</Text>
              <Text style={styles.sectionCount}>({filteredAndSortedSkills.length})</Text>
            </View>
            {expandedSections.has('skills') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('skills') && (
            <View style={styles.skillsContent}>
              {/* Filters and Search */}
              <View style={styles.filtersContainer}>
                <View style={styles.searchContainer}>
                  <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search skills..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => {/* Handle category filter */}}
                >
                  <Text style={styles.filterButtonText}>All Categories</Text>
                  <ChevronDown size={12} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Skills List */}
              <FlatList
                data={filteredAndSortedSkills}
                renderItem={renderSkillItem}
                keyExtractor={(item) => item.id}
                style={styles.skillsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Learning Paths */}
      <BlurView intensity={20} tint="dark" style={styles.pathsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.pathsCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('paths')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Target size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Learning Paths</Text>
              <Text style={styles.sectionCount}>({learningPaths.length})</Text>
            </View>
            {expandedSections.has('paths') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('paths') && (
            <View style={styles.pathsContent}>
              {learningPaths.map((path) => (
                <TouchableOpacity
                  key={path.id}
                  style={styles.pathItem}
                  onPress={() => setSelectedPath(path)}
                >
                  <View style={styles.pathHeader}>
                    <View style={styles.pathInfo}>
                      <Text style={styles.pathName}>{path.name}</Text>
                      <Text style={styles.pathDescription}>{path.description}</Text>
                    </View>
                    <View style={styles.pathProgress}>
                      <Text style={styles.pathProgressValue}>
                        {(path.completion_percentage * 100).toFixed(0)}%
                      </Text>
                      <Text style={styles.pathCurrentModule}>{path.current_module}</Text>
                    </View>
                  </View>

                  <View style={styles.pathProgressBar}>
                    <View 
                      style={[
                        styles.pathProgressFill,
                        { width: `${path.completion_percentage * 100}%` }
                      ]} 
                    />
                  </View>

                  <View style={styles.pathMetrics}>
                    <Text style={styles.pathMetric}>
                      Duration: {path.estimated_duration}h
                    </Text>
                    <Text style={styles.pathMetric}>
                      Modules: {path.current_module.split(' ').pop()}/{path.total_modules}
                    </Text>
                    <Text style={styles.pathMetric}>
                      Retention: {(path.retention_score * 100).toFixed(0)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {/* Handle practice */}}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1', '#4F46E5']}
            style={styles.controlButtonGradient}
          >
            <Target size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Start Practice</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {/* Handle assessment */}}
        >
          <LinearGradient
            colors={['#06B6D4', '#0891B2', '#0E7490']}
            style={styles.controlButtonGradient}
          >
            <BarChart3 size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Assessment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    borderTopColor: 'transparent',
    borderRadius: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  crownText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  iconButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  metricsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  metricsCardGradient: {
    padding: 20,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  metricCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  metricCardLabel: {
    fontSize: 10,
    color: '#A78BFA',
    textAlign: 'center',
  },
  metricCardSubtext: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  skillsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  skillsCardGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  skillsContent: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  skillsList: {
    flex: 1,
  },
  skillItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  skillCategory: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  skillLevel: {
    alignItems: 'flex-end',
  },
  masteryLevel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  proficiencyText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skillMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricItem: {
    width: '48%',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  nextPractice: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 8,
    marginTop: 8,
  },
  nextPracticeLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  nextPracticeDate: {
    fontSize: 8,
    color: '#8B5CF6',
  },
  pathsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  pathsCardGradient: {
    padding: 20,
  },
  pathsContent: {
    flex: 1,
  },
  pathItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pathInfo: {
    flex: 1,
  },
  pathName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pathDescription: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  pathProgress: {
    alignItems: 'fleximport React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Zap, 
  Activity,
  Clock,
  Star,
  Heart,
  Rocket,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Trophy,
  Medal,
  GraduationCap,
  BrainCircuit,
  NeuralNetwork,
  Database,
  FileText,
  Code,
  Globe,
  Users,
  Settings,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  TargetIcon,
  AlertCircle
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface LearningDashboardPremiumProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  practice_count: number;
  last_practiced: string;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  learning_rate: number;
  retention_rate: number;
  difficulty_score: number;
  time_to_mastery: number;
  prerequisites: string[];
  related_skills: string[];
  practice_streak: number;
  best_practice_score: number;
  total_practice_time: number;
  next_practice_recommended: string;
  neural_efficiency: number;
  knowledge_depth: number;
  application_success_rate: number;
}

const SKILL_CATEGORIES = [
  { id: 'technical', name: 'Technical', icon: Code, color: '#3B82F6' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#8B5CF6' },
  { id: 'analytical', name: 'Analytical', icon: BarChart3, color: '#10B981' },
  { id: 'communication', name: 'Communication', icon: Users, color: '#F59E0B' },
  { id: 'leadership', name: 'Leadership', icon: Trophy, color: '#EF4444' },
  { id: 'adaptive', name: 'Adaptive', icon: BrainCircuit, color: '#06B6D4' }
];

const MASTERY_LEVELS = {
  beginner: { min: 0, max: 0.25, color: '#EF4444', label: 'Beginner' },
  intermediate: { min: 0.25, max: 0.5, color: '#F59E0B', label: 'Intermediate' },
  advanced: { min: 0.5, max: 0.75, color: '#3B82F6', label: 'Advanced' },
  expert: { min: 0.75, max: 0.9, color: '#8B5CF6', label: 'Expert' },
  master: { min: 0.9, max: 1.0, color: '#10B981', label: 'Master' }
};

export const LearningDashboardPremium: React.FC<LearningDashboardPremiumProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'skills']));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const pulseScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);

  // Simulate real-time data updates
  useEffect(() => {
    if (!realTimeUpdates || !autoRefresh) return;

    const interval = setInterval(() => {
      loadLearningData();
    }, 3000);
    return () => clearInterval(interval);
  }, [realTimeUpdates, autoRefresh]);

  // Initialize data
  useEffect(() => {
    loadLearningData();
  }, []);

  // Pulse animation
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const loadLearningData = useCallback(async () => {
    try {
      const mockSkills: Skill[] = [
        {
          id: '1',
          name: 'React Development',
          category: 'technical',
          proficiency: 0.87,
          practice_count: 156,
          last_practiced: new Date(Date.now() - 86400000).toISOString(),
          mastery_level: 'expert',
          learning_rate: 0.92,
          retention_rate: 0.94,
          difficulty_score: 0.75,
          time_to_mastery: 120,
          prerequisites: ['JavaScript', 'HTML/CSS'],
          related_skills: ['TypeScript', 'Next.js', 'React Native'],
          practice_streak: 12,
          best_practice_score: 0.96,
          total_practice_time: 48.5,
          next_practice_recommended: '2025-01-10T14:00:00Z',
          neural_efficiency: 0.89,
          knowledge_depth: 0.91,
          application_success_rate: 0.93
        },
        {
          id: '2',
          name: 'Creative Problem Solving',
          category: 'creative',
          proficiency: 0.73,
          practice_count: 89,
          last_practiced: new Date(Date.now() - 172800000).toISOString(),
          mastery_level: 'advanced',
          learning_rate: 0.78,
          retention_rate: 0.85,
          difficulty_score: 0.68,
          time_to_mastery: 90,
          prerequisites: ['Critical Thinking'],
          related_skills: ['Design Thinking', 'Innovation', 'Brainstorming'],
          practice_streak: 7,
          best_practice_score: 0.88,
          total_practice_time: 32.1,
          next_practice_recommended: '2025-01-09T16:00:00Z',
          neural_efficiency: 0.82,
          knowledge_depth: 0.79,
          application_success_rate: 0.86
        }
      ];

      setSkills(mockSkills);
      setError(null);
    } catch (error) {
      console.error('Failed to load learning data:', error);
      setError('Failed to load learning data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getMasteryLevel = (proficiency: number) => {
    for (const [level, config] of Object.entries(MASTERY_LEVELS)) {
      if (proficiency >= config.min && proficiency <= config.max) {
        return { level, ...config };
      }
    }
    return { level: 'beginner', ...MASTERY_LEVELS.beginner };
  };

  const getCategoryIcon = (category: string) => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.icon || Brain;
  };

  const getCategoryColor = (category: string) => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.color || '#6B7280';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingSpinner,
            { transform: [{ rotate: rotationValue }] }
          ]}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <AlertCircle size={20} color="#EF4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <LinearGradient
          colors={['#8B5CF6', '#6366F1', '#4F46E5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#06B6D4', '#0891B2', '#0E7490']}
                style={styles.crownIcon}
              >
                <Text style={styles.crownText}>🧠</Text>
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Learning Dashboard</Text>
                <Text style={styles.headerSubtitle}>Adaptive Learning & Neural Development</Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => setAutoRefresh(!autoRefresh)}
                style={[
                  styles.iconButton,
                  autoRefresh && styles.iconButtonActive
                ]}
              >
                <RefreshCw 
                  size={16} 
                  color={autoRefresh ? "#FFFFFF" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Skills Section */}
      <BlurView intensity={20} tint="dark" style={styles.skillsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.skillsCardGradient}
        >
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('skills')}
          >
            <View style={styles.sectionHeaderLeft}>
              <Brain size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Skills Development</Text>
              <Text style={styles.sectionCount}>({skills.length})</Text>
            </View>
            {expandedSections.has('skills') ? (
              <ChevronDown size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {expandedSections.has('skills') && (
            <View style={styles.skillsContent}>
              {/* Search */}
              <View style={styles.searchContainer}>
                <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search skills..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Skills List */}
              {skills.map((skill) => {
                const mastery = getMasteryLevel(skill.proficiency);
                const CategoryIcon = getCategoryIcon(skill.category);
                const categoryColor = getCategoryColor(skill.category);
                
                return (
                  <TouchableOpacity
                    key={skill.id}
                    style={styles.skillItem}
                  >
                    <View style={styles.skillHeader}>
                      <View style={[styles.skillIcon, { backgroundColor: categoryColor + '20' }]}>
                        <CategoryIcon size={16} style={{ color: categoryColor }} />
                      </View>
                      <View style={styles.skillInfo}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <Text style={styles.skillCategory}>{skill.category}</Text>
                      </View>
                      <View style={styles.skillLevel}>
                        <Text style={[styles.masteryLevel, { color: mastery.color }]}>
                          {mastery.label}
                        </Text>
                        <Text style={styles.proficiencyText}>
                          {(skill.proficiency * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${skill.proficiency * 100}%`, backgroundColor: mastery.color }
                        ]} 
                      />
                    </View>

                    <View style={styles.skillMetrics}>
                      <Text style={styles.metricText}>Practice: {skill.practice_count}</Text>
                      <Text style={styles.metricText}>Streak: {skill.practice_streak}</Text>
                      <Text style={styles.metricText}>Neural: {(skill.neural_efficiency * 100).toFixed(0)}%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </LinearGradient>
      </BlurView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1', '#4F46E5']}
            style={styles.controlButtonGradient}
          >
            <Target size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Start Practice</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['#06B6D4', '#0891B2', '#0E7490']}
            style={styles.controlButtonGradient}
          >
            <BarChart3 size={20} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Assessment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#8B5CF6',
    borderTopColor: 'transparent',
    borderRadius: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  crownText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  iconButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  skillsCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  skillsCardGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  skillsContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  skillItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  skillCategory: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  skillLevel: {
    alignItems: 'flex-end',
  },
  masteryLevel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  proficiencyText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skillMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});