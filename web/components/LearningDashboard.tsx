'use client';

// React & Next.js Core
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// External Libraries
import { motion, AnimatePresence } from 'framer-motion';

// Internal Components
import { ErrorBoundary } from './ErrorBoundary';

// Icons
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Database,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  LineChart,
  Medal,
  Pause,
  PieChart,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  SkipForward,
  Sparkles,
  Star,
  Target,
  TargetIcon,
  Trophy,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

// Types
import {
  LearningDashboardProps,
  Skill,
  LearningPath,
  LearningSession,
  LearningMetrics,
  SkillCategory,
  MasteryLevel,
} from '@/types';

// Constants
const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'technical', name: 'Technical', icon: Code, color: '#3B82F6' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#8B5CF6' },
  { id: 'analytical', name: 'Analytical', icon: BarChart3, color: '#10B981' },
  { id: 'communication', name: 'Communication', icon: Users, color: '#F59E0B' },
  { id: 'leadership', name: 'Leadership', icon: Trophy, color: '#EF4444' },
  { id: 'adaptive', name: 'Adaptive', icon: BrainCircuit, color: '#06B6D4' }
];

const MASTERY_LEVELS: Record<string, MasteryLevel> = {
  beginner: { min: 0, max: 0.25, color: '#EF4444', label: 'Beginner' },
  intermediate: { min: 0.25, max: 0.5, color: '#F59E0B', label: 'Intermediate' },
  advanced: { min: 0.5, max: 0.75, color: '#3B82F6', label: 'Advanced' },
  expert: { min: 0.75, max: 0.9, color: '#8B5CF6', label: 'Expert' },
  master: { min: 0.9, max: 1.0, color: '#10B981', label: 'Master' }
};

// Main Component
export const LearningDashboard: React.FC<LearningDashboardProps> = ({ 
  className = '',
  compact = false,
  showAdvancedMetrics = true,
  realTimeUpdates = true
}) => {
  // State
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'skills']));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'proficiency' | 'practice_count' | 'last_practiced' | 'mastery_level'>('proficiency');

  // Memoized calculations
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

  // Event handlers
  const toggleSection = useCallback((section: string): void => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const getMasteryLevel = useCallback((proficiency: number): MasteryLevel => {
    for (const [level, config] of Object.entries(MASTERY_LEVELS)) {
      if (proficiency >= config.min && proficiency <= config.max) {
        return config;
      }
    }
    return MASTERY_LEVELS.beginner;
  }, []);

  const getCategoryIcon = useCallback((category: string): React.ComponentType<any> => {
    const cat = SKILL_CATEGORIES.find(c => c.id === category);
    return cat?.icon || Brain;
  }, []);

  const getCategoryColor = useCallback((categoryId: string): string => {
    const cat = SKILL_CATEGORIES.find(c => c.id === categoryId);
    return cat?.color || '#9CA3AF';
  }, []);

  // Initialize data
  useEffect(() => {
    loadLearningData();
  }, []);

  // Data loading
  const loadLearningData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Real API calls
      const [skillsResponse, metricsResponse] = await Promise.all([
        fetch('/api/learning/skills'),
        fetch('/api/learning/metrics')
      ]);

      if (!skillsResponse.ok) {
        throw new Error(`Failed to fetch skills: ${skillsResponse.status}`);
      }
      if (!metricsResponse.ok) {
        throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`);
      }

      const skillsData = await skillsResponse.json();
      const metricsData = await metricsResponse.json();

      setSkills(skillsData);
      setLearningMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load learning data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load learning data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      loadLearningData();
    }, 3000);
    return () => clearInterval(interval);
  }, [realTimeUpdates, loadLearningData]);

  useEffect(() => {
    loadLearningData();
  }, [loadLearningData]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          aria-label="Loading Learning Dashboard"
        />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-800/50 p-6"
          role="region"
          aria-label="Learning Dashboard Header"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <BrainCircuit className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Learning Dashboard</h2>
                <p className="text-purple-200">Adaptive Learning & Neural Development</p>
              </div>
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
                  <Brain className="h-8 w-8 text-purple-400" aria-hidden="true" />
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
                  <TrendingUp className="h-8 w-8 text-green-400" aria-hidden="true" />
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
                  <Share2 className="h-8 w-8 text-blue-400" aria-hidden="true" />
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
                  <Zap className="h-8 w-8 text-orange-400" aria-hidden="true" />
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
          role="region"
          aria-label="Skills Development"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" aria-hidden="true" />
                <span>Skills Development</span>
                <span className="text-sm text-gray-400">({filteredAndSortedSkills.length})</span>
              </h3>
            </div>
            <button
              onClick={() => toggleSection('skills')}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={`${expandedSections.has('skills') ? 'Collapse' : 'Expand'} Skills Section`}
              aria-expanded={expandedSections.has('skills')}
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
                      aria-label="Search skills"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  aria-label="Filter by category"
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
                  aria-label="Sort by"
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
                      role="button"
                      tabIndex={0}
                      aria-label={`Skill: ${skill.name} - ${mastery.label}`}
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
                            role="progressbar"
                            aria-valuenow={skill.proficiency * 100}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Proficiency: ${(skill.proficiency * 100).toFixed(0)}%`}
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
      </div>
    </ErrorBoundary>
  );
};
