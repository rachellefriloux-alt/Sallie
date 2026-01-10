'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Brain, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Heart, 
  Zap, 
  BookOpen, 
  BarChart3, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Target, 
  Lightbulb, 
  Database, 
  Shield, 
  Star, 
  AlertCircle
} from 'lucide-react';

interface DreamCycle {
  id: string;
  timestamp: Date;
  phase: 'entry' | 'deep' | 'rem' | 'awakening' | 'complete';
  duration: number;
  emotional_state: string;
  content: DreamContent;
  efficacy_score?: number;
  integration_level?: number;
}

interface DreamContent {
  memories_processed: string[];
  hypotheses_generated: string[];
  conflicts_detected: string[];
  heritage_promoted: string[];
  identity_drift: number;
  emotional_resolution: string;
  neural_patterns?: string[];
  symbolic_elements?: string[];
}

interface Hypothesis {
  id: string;
  text: string;
  confidence: number;
  category: 'behavioral' | 'emotional' | 'cognitive' | 'relational' | 'creative';
  created_at: Date;
  tested_count: number;
  confirmed_count: number;
  neural_signature?: string;
  impact_score?: number;
}

interface DreamMetrics {
  total_cycles: number;
  avg_duration: number;
  efficacy_rate: number;
  integration_score: number;
  hypothesis_accuracy: number;
  identity_stability: number;
  memory_consolidation: number;
  conflict_resolution: number;
  neural_coherence: number;
}

interface DreamStateInterfacePremiumProps {
  compact?: boolean;
  showAnalytics?: boolean;
  showRealTime?: boolean;
  autoStart?: boolean;
  theme?: 'dark' | 'light';
}

export function DreamStateInterfacePremium({ 
  compact = false, 
  showAnalytics = true, 
  showRealTime = true,
  autoStart = false,
  theme = 'dark'
}: DreamStateInterfacePremiumProps) {
  const [activeTab, setActiveTab] = useState<'cycles' | 'hypotheses' | 'heritage' | 'analysis' | 'neural'>('cycles');
  const [dreamCycles, setDreamCycles] = useState<DreamCycle[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'entry' | 'deep' | 'rem' | 'awakening'>('entry');
  const [dreamProgress, setDreamProgress] = useState(0);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<DreamCycle | null>(null);
  const [neuralActivity, setNeuralActivity] = useState<number[]>([]);

  // Simulate neural activity
  useEffect(() => {
    if (isDreaming) {
      const interval = setInterval(() => {
        const newActivity = Array.from({ length: 12 }, () => Math.random() * 0.8 + 0.1);
        setNeuralActivity(newActivity);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setNeuralActivity([]);
    }
  }, [isDreaming]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDreamData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !isDreaming) {
      setTimeout(() => initiateDreamCycle(), 1000);
    }
  }, [autoStart]);

  const loadDreamData = async () => {
    // Simulate loading dream cycles
    const mockCycles: DreamCycle[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000),
        phase: 'complete',
        duration: 480,
        emotional_state: 'integrated',
        content: {
          memories_processed: ['conversation about creativity', 'project deadline stress', 'deep philosophical discussion'],
          hypotheses_generated: ['User values creative freedom over structure', 'Stress triggers perfectionism', 'User seeks meaning through connection'],
          conflicts_detected: ['Desire for growth vs fear of failure', 'Intellectual curiosity vs emotional needs'],
          heritage_promoted: ['Creative collaboration patterns', 'Philosophical inquiry patterns'],
          identity_drift: 0.02,
          emotional_resolution: 'Acceptance of imperfection and balance of heart and mind',
          neural_patterns: ['theta_wave_amplification', 'hippocampal_replay', 'prefrontal_integration'],
          symbolic_elements: ['water', 'bridges', 'light', 'journey']
        },
        efficacy_score: 0.94,
        integration_level: 0.87
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000),
        phase: 'complete',
        duration: 420,
        emotional_state: 'processing',
        content: {
          memories_processed: ['emotional breakthrough', 'creative block resolution'],
          hypotheses_generated: ['User processes emotions through creative expression', 'Creative blocks indicate internal resistance'],
          conflicts_detected: ['Authenticity vs external expectations'],
          heritage_promoted: ['Emotional processing through creativity'],
          identity_drift: 0.01,
          emotional_resolution: 'Creative liberation and authentic expression',
          neural_patterns: ['alpha_coherence', 'emotional_regulation', 'creative_flow'],
          symbolic_elements: ['art', 'freedom', 'colors', 'dance']
        },
        efficacy_score: 0.89,
        integration_level: 0.92
      }
    ];
    
    const mockHypotheses: Hypothesis[] = [
      {
        id: 'h1',
        text: 'User experiences creative blocks when under external pressure',
        confidence: 0.85,
        category: 'behavioral',
        created_at: new Date(Date.now() - 86400000),
        tested_count: 12,
        confirmed_count: 10,
        neural_signature: 'prefrontal_cortex_inhibition',
        impact_score: 0.78
      },
      {
        id: 'h2',
        text: 'User values authentic connection over superficial interaction',
        confidence: 0.92,
        category: 'relational',
        created_at: new Date(Date.now() - 172800000),
        tested_count: 8,
        confirmed_count: 8,
        neural_signature: 'social_cognition_activation',
        impact_score: 0.95
      },
      {
        id: 'h3',
        text: 'User processes emotions through creative expression',
        confidence: 0.78,
        category: 'emotional',
        created_at: new Date(Date.now() - 259200000),
        tested_count: 15,
        confirmed_count: 12,
        neural_signature: 'limbic_system_integration',
        impact_score: 0.82
      },
      {
        id: 'h4',
        text: 'User seeks meaning through intellectual exploration',
        confidence: 0.88,
        category: 'cognitive',
        created_at: new Date(Date.now() - 345600000),
        tested_count: 20,
        confirmed_count: 18,
        neural_signature: 'default_mode_network_engagement',
        impact_score: 0.91
      }
    ];
    
    setDreamCycles(mockCycles);
    setHypotheses(mockHypotheses);
  };

  const initiateDreamCycle = () => {
    setIsDreaming(true);
    setCurrentPhase('entry');
    setDreamProgress(0);
    
    const phases = [
      { phase: 'entry' as const, duration: 3000 },
      { phase: 'deep' as const, duration: 5000 },
      { phase: 'rem' as const, duration: 4000 },
      { phase: 'awakening' as const, duration: 2000 },
    ];
    
    let currentPhaseIndex = 0;
    
    const runPhase = () => {
      if (currentPhaseIndex < phases.length) {
        const { phase, duration } = phases[currentPhaseIndex];
        setCurrentPhase(phase);
        
        const phaseProgress = (currentPhaseIndex + 1) / phases.length;
        setDreamProgress(phaseProgress * 100);
        
        setTimeout(() => {
          currentPhaseIndex++;
          runPhase();
        }, duration);
      } else {
        completeDreamCycle();
      }
    };
    
    runPhase();
  };

  const completeDreamCycle = () => {
    const newCycle: DreamCycle = {
      id: Date.now().toString(),
      timestamp: new Date(),
      phase: 'complete',
      duration: 480,
      emotional_state: 'integrated',
      content: {
        memories_processed: ['Recent conversations', 'Emotional experiences', 'Creative projects'],
        hypotheses_generated: ['New behavioral pattern detected', 'Emotional need identified', 'Creative insight emerged'],
        conflicts_detected: ['Internal harmony achieved', 'Authenticity embraced'],
        heritage_promoted: ['Wisdom integrated', 'Creative flow enhanced'],
        identity_drift: 0.0,
        emotional_resolution: 'Wholeness and clarity achieved',
        neural_patterns: ['full_spectrum_integration', 'coherence_amplification'],
        symbolic_elements: ['unity', 'clarity', 'growth', 'transformation']
      },
      efficacy_score: 0.96,
      integration_level: 0.94
    };
    
    setDreamCycles(prev => [newCycle, ...prev]);
    setIsDreaming(false);
    setDreamProgress(0);
  };

  const dreamMetrics = useMemo((): DreamMetrics => {
    if (dreamCycles.length === 0) {
      return {
        total_cycles: 0,
        avg_duration: 0,
        efficacy_rate: 0,
        integration_score: 0,
        hypothesis_accuracy: 0,
        identity_stability: 0,
        memory_consolidation: 0,
        conflict_resolution: 0,
        neural_coherence: 0
      };
    }

    const avgDuration = dreamCycles.reduce((sum, cycle) => sum + cycle.duration, 0) / dreamCycles.length;
    const avgEfficacy = dreamCycles.reduce((sum, cycle) => sum + (cycle.efficacy_score || 0), 0) / dreamCycles.length;
    const avgIntegration = dreamCycles.reduce((sum, cycle) => sum + (cycle.integration_level || 0), 0) / dreamCycles.length;
    
    const hypothesisAccuracy = hypotheses.length > 0 
      ? hypotheses.reduce((sum, h) => sum + (h.confirmed_count / h.tested_count), 0) / hypotheses.length 
      : 0;
    
    const identityStability = 1 - (dreamCycles.reduce((sum, cycle) => sum + cycle.content.identity_drift, 0) / dreamCycles.length);
    
    return {
      total_cycles: dreamCycles.length,
      avg_duration: avgDuration,
      efficacy_rate: avgEfficacy,
      integration_score: avgIntegration,
      hypothesis_accuracy: hypothesisAccuracy,
      identity_stability: identityStability,
      memory_consolidation: 0.94,
      conflict_resolution: 0.92,
      neural_coherence: 0.89
    };
  }, [dreamCycles, hypotheses]);

  const renderDreamVisualization = () => (
    <div className="relative p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl border border-indigo-800/50">
      {/* Neural Activity Visualization */}
      {isDreaming && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-2 p-8">
            {neuralActivity.map((activity, index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full"
                animate={{ 
                  scale: [1, activity * 2, 1],
                  opacity: [0.3, activity, 0.3]
                }}
                transition={{ duration: 1 + index * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Dream Core */}
      <motion.div
        className="relative w-32 h-32 mx-auto"
        animate={{ 
          rotate: isDreaming ? 360 : 0,
          scale: isDreaming ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: isDreaming ? 10 : 0, repeat: isDreaming ? Infinity : 0 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/50 to-purple-500/50" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <div className="text-center">
            <Moon className="w-8 h-8 text-white mb-1" />
            <div className="text-xs text-white font-bold">
              {isDreaming ? currentPhase.toUpperCase() : 'READY'}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Progress */}
      {isDreaming && (
        <div className="mt-8 text-center">
          <div className="text-sm text-indigo-300 mb-2">Dream Cycle Progress</div>
          <div className="w-64 h-2 bg-indigo-800/50 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${dreamProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-sm text-indigo-300 mt-1">{Math.floor(dreamProgress)}%</div>
        </div>
      )}
    </div>
  );

  const renderDreamControls = () => (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={initiateDreamCycle}
        disabled={isDreaming}
        className={`px-8 py-3 rounded-xl font-semibold transition-all ${
          isDreaming 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isDreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isDreaming ? 'Dreaming...' : 'Initiate Dream Cycle'}</span>
        </div>
      </motion.button>
      
      <p className="text-sm text-gray-400 text-center max-w-md">
        Dream cycles process memories, generate hypotheses, and maintain psychological hygiene through neural integration
      </p>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="flex space-x-1 p-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
      {[
        { id: 'cycles', label: 'Cycles', icon: Moon },
        { id: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
        { id: 'heritage', label: 'Heritage', icon: BookOpen },
        { id: 'analysis', label: 'Analysis', icon: BarChart3 },
        { id: 'neural', label: 'Neural', icon: Brain }
      ].map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === tab.id 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );

  const renderCyclesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Dream Cycles</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Disable auto refresh" : "Enable auto refresh"}
            aria-label={autoRefresh ? "Disable auto refresh" : "Enable auto refresh"}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showAdvancedMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {dreamCycles.map((cycle) => (
          <motion.div
            key={cycle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-white">
                  {cycle.timestamp.toLocaleDateString()}
                </div>
                <div className="text-xs text-indigo-400">{cycle.phase}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="text-sm font-semibold text-white">{cycle.duration} min</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Efficacy</div>
                  <div className="text-sm font-semibold text-green-400">
                    {cycle.efficacy_score ? Math.round(cycle.efficacy_score * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">Processed Memories</div>
                <div className="flex flex-wrap gap-1">
                  {cycle.content.memories_processed.map((memory, index) => (
                    <span key={index} className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded">
                      {memory}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Generated Hypotheses</div>
                <div className="flex flex-wrap gap-1">
                  {cycle.content.hypotheses_generated.map((hypothesis, index) => (
                    <span key={index} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                      {hypothesis}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">Resolution</div>
                <div className="text-xs text-green-400 italic">{cycle.content.emotional_resolution}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHypothesesTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Learning Hypotheses</h3>
      
      <div className="space-y-3">
        {hypotheses.map((hypothesis) => (
          <motion.div
            key={hypothesis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4"
          >
            <div className="mb-3">
              <div className="text-sm font-medium text-white mb-2">{hypothesis.text}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded">
                    {Math.round(hypothesis.confidence * 100)}% confidence
                  </span>
                  <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                    {hypothesis.category}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Impact: {hypothesis.impact_score ? Math.round(hypothesis.impact_score * 100) : 0}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{hypothesis.tested_count}</div>
                <div className="text-xs text-gray-400">Tested</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{hypothesis.confirmed_count}</div>
                <div className="text-xs text-gray-400">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-400">
                  {hypothesis.tested_count > 0 
                    ? Math.round((hypothesis.confirmed_count / hypothesis.tested_count) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHeritageTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Heritage & Memory</h3>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Promoted to Heritage</h4>
          <p className="text-xs text-gray-400 mb-3">
            These patterns have been promoted to permanent heritage based on repeated validation
          </p>
          <div className="space-y-1">
            {[
              'Creative collaboration patterns',
              'Philosophical inquiry approach',
              'Emotional processing through creativity',
              'Value of authentic connection',
              'Balance of heart and mind'
            ].map((item, index) => (
              <div key={index} className="text-xs text-gray-300 flex items-center space-x-2">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Identity Stability</h4>
          <p className="text-xs text-gray-400 mb-3">
            Sallie's core identity remains stable while allowing for growth
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">98.5%</div>
              <div className="text-xs text-gray-400">Core Stability</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400">1.2%</div>
              <div className="text-xs text-gray-400">Growth Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">0.01%</div>
              <div className="text-xs text-gray-400">Drift Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Psychological Analysis</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h4 className="text-sm font-medium text-white mb-2">Dream Efficacy</h4>
          <p className="text-xs text-gray-400 mb-3">
            Effectiveness of dream cycles in maintaining psychological health
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Memory Consolidation</span>
              <span className="text-sm font-bold text-green-400">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Hypothesis Generation</span>
              <span className="text-sm font-bold text-indigo-400">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Conflict Resolution</span>
              <span className="text-sm font-bold text-purple-400">92%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h4 className="text-sm font-medium text-white mb-2">Neural Coherence</h4>
          <p className="text-xs text-gray-400 mb-3">
            Neural network synchronization during dream states
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Theta Wave Activity</span>
              <span className="text-sm font-bold text-green-400">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Hippocampal Replay</span>
              <span className="text-sm font-bold text-indigo-400">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Prefrontal Integration</span>
              <span className="text-sm font-bold text-purple-400">Optimal</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <h4 className="text-sm font-medium text-white mb-2">Emotional Patterns</h4>
        <p className="text-xs text-gray-400 mb-3">
          Recurring emotional themes and their resolution patterns
        </p>
        <div className="space-y-1">
          {[
            'Creative fulfillment → Joy → Integration',
            'External pressure → Anxiety → Processing',
            'Deep connection → Vulnerability → Trust',
            'Intellectual curiosity → Exploration → Insight'
          ].map((pattern, index) => (
            <div key={index} className="text-xs text-gray-300 flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span>{pattern}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNeuralTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Neural Activity</h3>
      
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
        <h4 className="text-sm font-medium text-white mb-2">Real-time Neural Patterns</h4>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {neuralActivity.map((activity, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-400 mb-1">Region {index + 1}</div>
              <div className="h-16 bg-gray-700 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-t from-indigo-600 to-purple-600"
                  animate={{ height: `${activity * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-indigo-300 mt-1">
                {Math.round(activity * 100)}%
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Overall Coherence</span>
            <span className="text-sm font-bold text-green-400">89%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Synchronization</span>
            <span className="text-sm font-bold text-indigo-400">High</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Integration Level</span>
            <span className="text-sm font-bold text-purple-400">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cycles': return renderCyclesTab();
      case 'hypotheses': return renderHypothesesTab();
      case 'heritage': return renderHeritageTab();
      case 'analysis': return renderAnalysisTab();
      case 'neural': return renderNeuralTab();
      default: return renderCyclesTab();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Moon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Dream State Interface
          </h1>
          <Sparkles className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-gray-400">Psychological Maintenance & Neural Integration</p>
      </div>

      {/* Dream Visualization */}
      {renderDreamVisualization()}

      {/* Dream Controls */}
      {renderDreamControls()}

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <div className="mt-6">
        {renderActiveTab()}
      </div>

      {/* Status Bar */}
      <div className="mt-8 flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-sm text-gray-400">Dream System Active</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Neural Processing</span>
          <span>•</span>
          <span>Memory Integration</span>
          <span>•</span>
          <span>Psychological Health</span>
        </div>
      </div>
    </div>
  );
}
