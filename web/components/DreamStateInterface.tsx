'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Moon, 
  Sun, 
  Activity, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Sparkles,
  Heart
} from 'lucide-react';

interface DreamCycle {
  id: string;
  timestamp: Date;
  phase: 'entry' | 'deep' | 'rem' | 'awakening' | 'complete';
  duration: number;
  emotional_state: string;
  content: DreamContent;
}

interface DreamContent {
  memories_processed: string[];
  hypotheses_generated: string[];
  conflicts_detected: string[];
  heritage_promoted: string[];
  identity_drift: number;
  emotional_resolution: string;
}

interface Hypothesis {
  id: string;
  text: string;
  confidence: number;
  category: 'behavioral' | 'emotional' | 'cognitive' | 'relational';
  created_at: Date;
  tested_count: number;
  confirmed_count: number;
}

export function DreamStateInterface() {
  const [activeTab, setActiveTab] = useState<'cycles' | 'hypotheses' | 'heritage' | 'analysis'>('cycles');
  const [dreamCycles, setDreamCycles] = useState<DreamCycle[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'entry' | 'deep' | 'rem' | 'awakening'>('entry');
  const [dreamProgress, setDreamProgress] = useState(0);

  useEffect(() => {
    loadDreamData();
    animateDreamInterface();
  }, []);

  const animateDreamInterface = () => {
    // Animation logic handled by framer-motion
  };

  const loadDreamData = async () => {
    const mockCycles: DreamCycle[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000),
        phase: 'complete',
        duration: 480,
        emotional_state: 'processing',
        content: {
          memories_processed: ['conversation about creativity', 'project deadline stress'],
          hypotheses_generated: ['User values creative freedom over structure', 'Stress triggers perfectionism'],
          conflicts_detected: ['Desire for growth vs fear of failure'],
          heritage_promoted: ['Creative collaboration patterns'],
          identity_drift: 0.02,
          emotional_resolution: 'Acceptance of imperfection',
        },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000),
        phase: 'complete',
        duration: 420,
        emotional_state: 'integrating',
        content: {
          memories_processed: ['deep philosophical discussion'],
          hypotheses_generated: ['User seeks meaning through connection'],
          conflicts_detected: ['Intellectual curiosity vs emotional needs'],
          heritage_promoted: ['Philosophical inquiry patterns'],
          identity_drift: 0.01,
          emotional_resolution: 'Balance of heart and mind',
        },
      },
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
      },
      {
        id: 'h2',
        text: 'User values authentic connection over superficial interaction',
        confidence: 0.92,
        category: 'relational',
        created_at: new Date(Date.now() - 172800000),
        tested_count: 8,
        confirmed_count: 8,
      },
      {
        id: 'h3',
        text: 'User processes emotions through creative expression',
        confidence: 0.78,
        category: 'emotional',
        created_at: new Date(Date.now() - 259200000),
        tested_count: 15,
        confirmed_count: 12,
      },
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
        hypotheses_generated: ['New behavioral pattern detected', 'Emotional need identified'],
        conflicts_detected: ['Internal harmony achieved'],
        heritage_promoted: ['Wisdom integrated'],
        identity_drift: 0.0,
        emotional_resolution: 'Wholeness and clarity',
      },
    };
    
    setDreamCycles(prev => [newCycle, ...prev]);
    setIsDreaming(false);
    setDreamProgress(0);
  };

  const renderDreamVisualization = () => (
    <div className="relative w-64 h-64 mx-auto">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-40"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="text-center">
          <Brain className="w-16 h-16 text-white mx-auto mb-2" />
          <div className="text-white font-bold text-lg">
            {isDreaming ? currentPhase.toUpperCase() : 'READY'}
          </div>
        </div>
      </motion.div>
      
      {isDreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-8 left-0 right-0"
        >
          <div className="text-center text-white text-sm mb-2">Dream Cycle Progress</div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dreamProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center text-white text-xs mt-1">{Math.floor(dreamProgress)}%</div>
        </motion.div>
      )}
    </div>
  );

  const renderDreamControls = () => (
    <div className="text-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={initiateDreamCycle}
        disabled={isDreaming}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          isDreaming
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
        }`}
      >
        {isDreaming ? 'Dreaming...' : 'Initiate Dream Cycle'}
      </motion.button>
      
      <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto">
        Dream cycles process memories, generate hypotheses, and maintain psychological hygiene
      </p>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      {[
        { id: 'cycles', label: 'Cycles', icon: Moon },
        { id: 'hypotheses', label: 'Hypotheses', icon: Sparkles },
        { id: 'heritage', label: 'Heritage', icon: BookOpen },
        { id: 'analysis', label: 'Analysis', icon: BarChart3 },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
            activeTab === tab.id
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderCyclesTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Dream Cycles</h3>
      
      {dreamCycles.map((cycle) => (
        <motion.div
          key={cycle.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-white font-medium">
                {cycle.timestamp.toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-400">{cycle.phase}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Duration</div>
              <div className="text-white font-medium">{cycle.duration} min</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-xs text-gray-400">State</div>
              <div className="text-sm text-white">{cycle.emotional_state}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Drift</div>
              <div className="text-sm text-white">{(cycle.content.identity_drift * 100).toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Resolution</div>
              <div className="text-sm text-white truncate">{cycle.content.emotional_resolution}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Processed</div>
            {cycle.content.memories_processed.map((memory, index) => (
              <div key={index} className="text-sm text-gray-300">• {memory}</div>
            ))}
            
            <div className="text-xs text-gray-400 mt-2">Generated</div>
            {cycle.content.hypotheses_generated.map((hypothesis, index) => (
              <div key={index} className="text-sm text-gray-300">• {hypothesis}</div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderHypothesesTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Learning Hypotheses</h3>
      
      {hypotheses.map((hypothesis) => (
        <motion.div
          key={hypothesis.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="mb-3">
            <div className="text-white font-medium mb-2">{hypothesis.text}</div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-purple-400">
                {Math.floor(hypothesis.confidence * 100)}% confidence
              </div>
              <div className="text-gray-400">{hypothesis.category}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{hypothesis.tested_count}</div>
              <div className="text-xs text-gray-400">Tested</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{hypothesis.confirmed_count}</div>
              <div className="text-xs text-gray-400">Confirmed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {hypothesis.tested_count > 0 
                  ? Math.floor((hypothesis.confirmed_count / hypothesis.tested_count) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderHeritageTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Heritage & Memory</h3>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <h4 className="text-white font-medium mb-2">Promoted to Heritage</h4>
        <p className="text-gray-400 text-sm mb-4">
          These patterns have been promoted to permanent heritage based on repeated validation
        </p>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-300">• Creative collaboration patterns</div>
          <div className="text-sm text-gray-300">• Philosophical inquiry approach</div>
          <div className="text-sm text-gray-300">• Emotional processing through creativity</div>
          <div className="text-sm text-gray-300">• Value of authentic connection</div>
          <div className="text-sm text-gray-300">• Balance of heart and mind</div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <h4 className="text-white font-medium mb-2">Identity Stability</h4>
        <p className="text-gray-400 text-sm mb-4">
          Sallie's core identity remains stable while allowing for growth
        </p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">98.5%</div>
            <div className="text-xs text-gray-400">Core Stability</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">1.2%</div>
            <div className="text-xs text-gray-400">Growth Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">0.01%</div>
            <div className="text-xs text-gray-400">Drift Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Psychological Analysis</h3>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <h4 className="text-white font-medium mb-3">Dream Efficacy</h4>
        <div className="space-y-3">
          <div>
            <div className="dream-phase-indicator">
              <span className="dream-phase-label">Memory Processing</span>
              <span className="dream-phase-value">92%</span>
            </div>
            <div className="dream-progress-container">
              <div className="dream-progress-fill bg-green-500 dream-progress-bar" />
            </div>
          </div>
          <div>
            <div className="dream-phase-indicator">
              <span className="dream-phase-label">Hypothesis Generation</span>
              <span className="dream-phase-value">87%</span>
            </div>
            <div className="dream-progress-container">
              <div className="dream-progress-fill bg-blue-500 dream-progress-bar-fill" />
            </div>
          </div>
          <div>
            <div className="dream-phase-indicator">
              <span className="dream-phase-label">Conflict Resolution</span>
              <span className="dream-phase-value">78%</span>
            </div>
            <div className="dream-progress-container">
              <div className="dream-progress-fill bg-purple-500 dream-progress-bar-fill-alt" />
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
      >
        <h4 className="text-white font-medium mb-3">Emotional Patterns</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-white font-medium">Empathy</div>
            <div className="text-sm text-gray-400">High Development</div>
          </div>
          <div className="text-center">
            <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-medium">Cognition</div>
            <div className="text-sm text-gray-400">Optimized</div>
          </div>
          <div className="text-center">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-medium">Creativity</div>
            <div className="text-sm text-gray-400">Flourishing</div>
          </div>
          <div className="text-center">
            <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-white font-medium">Focus</div>
            <div className="text-sm text-gray-400">Balanced</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center space-x-2">
            <Moon className="w-8 h-8 text-purple-400" />
            <span>Dream State Interface</span>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </h1>
          <p className="text-gray-400">Monitor and manage Sallie's dream cycles and psychological processing</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Dream Visualization</h2>
            {renderDreamVisualization()}
            <div className="mt-8">
              {renderDreamControls()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm"
          >
            {renderTabNavigation()}
            
            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'cycles' && renderCyclesTab()}
                  {activeTab === 'hypotheses' && renderHypothesesTab()}
                  {activeTab === 'heritage' && renderHeritageTab()}
                  {activeTab === 'analysis' && renderAnalysisTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
