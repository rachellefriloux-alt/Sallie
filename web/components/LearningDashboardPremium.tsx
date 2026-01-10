'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Learning Dashboard</h2>
              <p className="text-purple-200">Adaptive Learning & Neural Development</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle auto-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`p-2 rounded-lg transition-colors ${
                realTimeMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              title="Toggle real-time mode"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Learning Metrics Overview */}
        {learningMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-purple-300 font-medium">Total Skills</div>
                  <div className="text-2xl font-bold text-white">{learningMetrics.total_skills}</div>
                </div>
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-xs text-purple-400">
                {learningMetrics.mastered_skills} mastered
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl border border-green-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-green-300 font-medium">Learning Velocity</div>
                  <div className="text-2xl font-bold text-white">
                    {(learningMetrics.learning_velocity * 100).toFixed(1)}%
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-xs text-green-400">
                {learningMetrics.performance_trend}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl border border-blue-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-blue-300 font-medium">Neural Efficiency</div>
                  <div className="text-2xl font-bold text-white">
                    {(learningMetrics.neural_efficiency * 100).toFixed(1)}%
                  </div>
                </div>
                <NeuralNetwork className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-xs text-blue-400">
                Cognitive load: {(learningMetrics.cognitive_load_capacity * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl border border-orange-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-orange-300 font-medium">Learning Streak</div>
                  <div className="text-2xl font-bold text-white">{learningMetrics.learning_streak_days}</div>
                </div>
                <Zap className="h-8 w-8 text-orange-400" />
              </div>
              <div className="text-xs text-orange-400">
                Best: {learningMetrics.best_practice_streak} days
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Skills Development</span>
              <span className="text-sm text-gray-400">({filteredAndSortedSkills.length})</span>
            </h3>
          </div>
          <button
            onClick={() => toggleSection('skills')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('skills') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {expandedSections.has('skills') && (
          <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {SKILL_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="proficiency">Proficiency</option>
                <option value="practice_count">Practice Count</option>
                <option value="last_practiced">Last Practiced</option>
                <option value="mastery_level">Mastery Level</option>
              </select>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedSkills.map((skill) => {
                const mastery = getMasteryLevel(skill.proficiency);
                const CategoryIcon = getCategoryIcon(skill.category);
                const categoryColor = getCategoryColor(skill.category);
                
                return (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: categoryColor + '20' }}>
                          <CategoryIcon className="w-4 h-4" style={{ color: categoryColor }} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{skill.name}</h4>
                          <p className="text-xs text-gray-400">{skill.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: mastery.color }}>
                          {mastery.label}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(skill.proficiency * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Proficiency</span>
                        <span>{(skill.proficiency * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${skill.proficiency * 100}%`,
                            backgroundColor: mastery.color
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>
                        <span className="text-gray-500">Practice:</span> {skill.practice_count}
                      </div>
                      <div>
                        <span className="text-gray-500">Streak:</span> {skill.practice_streak}
                      </div>
                      <div>
                        <span className="text-gray-500">Neural:</span> {(skill.neural_efficiency * 100).toFixed(0)}%
                      </div>
                      <div>
                        <span className="text-gray-500">Depth:</span> {(skill.knowledge_depth * 100).toFixed(0)}%
                      </div>
                    </div>

                    {showAdvancedMetrics && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Next Practice</span>
                          <span className="text-purple-400">
                            {new Date(skill.next_practice_recommended).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Learning Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span>Learning Paths</span>
            <span className="text-sm text-gray-400">({learningPaths.length})</span>
          </h3>
          <button
            onClick={() => toggleSection('paths')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expandedSections.has('paths') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {expandedSections.has('paths') && (
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => setSelectedPath(path)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{path.name}</h4>
                    <p className="text-sm text-gray-400">{path.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-400">
                      {(path.completion_percentage * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {path.current_module}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{path.skills_acquired.length}/{path.skills_required.length} skills</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${path.completion_percentage * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-3">
                  <div>
                    <span className="text-gray-500">Duration:</span> {path.estimated_duration}h
                  </div>
                  <div>
                    <span className="text-gray-500">Modules:</span> {path.current_module.split(' ').pop()}/{path.total_modules}
                  </div>
                  <div>
                    <span className="text-gray-500">Retention:</span> {(path.retention_score * 100).toFixed(0)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Sessions */}
      {showAdvancedMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Recent Sessions</span>
              <span className="text-sm text-gray-400">({recentSessions.length})</span>
            </h3>
            <button
              onClick={() => toggleSection('sessions')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expandedSections.has('sessions') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {expandedSections.has('sessions') && (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{session.skill_name}</span>
                      <span className="text-xs text-gray-400">{session.practice_type}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(session.start_time).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                    <div>
                      <span className="text-gray-500">Performance:</span> {(session.performance_score * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="text-gray-500">Improvement:</span> +{(session.improvement_score * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="text-gray-500">Focus:</span> {(session.neural_activity.focus_level * 100).toFixed(0)}%
                    </div>
                    <div>
                      <span className="text-gray-500">Efficiency:</span> {(session.neural_activity.learning_efficiency * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
};