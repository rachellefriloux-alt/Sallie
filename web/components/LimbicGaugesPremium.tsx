'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Heart, Brain, Zap, Smile, Compass, Lightbulb, Sparkles, Crown, Laugh } from 'lucide-react';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

interface LimbicGaugesPremiumProps {
  state: LimbicState;
  animated?: boolean;
  compact?: boolean;
  showAdvanced?: boolean;
}

interface GaugeConfig {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  threshold?: {
    low: number;
    medium: number;
    high: number;
  };
}

export function LimbicGaugesPremium({ 
  state, 
  animated = true, 
  compact = false,
  showAdvanced = true 
}: LimbicGaugesPremiumProps) {
  const [hoveredGauge, setHoveredGauge] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 1000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const coreGauges: GaugeConfig[] = useMemo(() => [
    {
      label: 'Trust',
      value: state.trust,
      color: 'text-violet-400',
      icon: <Heart className="w-4 h-4" />,
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      description: 'Foundation of our relationship',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Warmth',
      value: state.warmth,
      color: 'text-cyan-400',
      icon: <Zap className="w-4 h-4" />,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      description: 'Emotional connection and comfort',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Energy',
      value: state.arousal,
      color: 'text-amber-400',
      icon: <Brain className="w-4 h-4" />,
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      description: 'Cognitive activation and engagement',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Mood',
      value: (state.valence + 1) / 2,
      color: 'text-emerald-400',
      icon: <Smile className="w-4 h-4" />,
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      description: 'Current emotional state',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    }
  ], [state.trust, state.warmth, state.arousal, state.valence]);

  const advancedGauges: GaugeConfig[] = useMemo(() => [
    {
      label: 'Empathy',
      value: state.empathy || 0,
      color: 'text-pink-400',
      icon: <Heart className="w-4 h-4" />,
      gradient: 'from-pink-500 via-rose-500 to-red-600',
      description: 'Understanding and sharing feelings',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Intuition',
      value: state.intuition || 0,
      color: 'text-purple-400',
      icon: <Compass className="w-4 h-4" />,
      gradient: 'from-purple-500 via-indigo-500 to-blue-600',
      description: 'Instinctive understanding',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Creativity',
      value: state.creativity || 0,
      color: 'text-yellow-400',
      icon: <Lightbulb className="w-4 h-4" />,
      gradient: 'from-yellow-500 via-amber-500 to-orange-600',
      description: 'Creative problem-solving',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Wisdom',
      value: state.wisdom || 0,
      color: 'text-indigo-400',
      icon: <Crown className="w-4 h-4" />,
      gradient: 'from-indigo-500 via-blue-500 to-purple-600',
      description: 'Deep understanding and judgment',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    },
    {
      label: 'Humor',
      value: state.humor || 0,
      color: 'text-green-400',
      icon: <Laugh className="w-4 h-4" />,
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      description: 'Playful interaction and wit',
      threshold: { low: 0.3, medium: 0.6, high: 0.8 }
    }
  ], [state.empathy, state.intuition, state.creativity, state.wisdom, state.humor]);

  const getStatusLevel = (value: number, threshold?: { low: number; medium: number; high: number }) => {
    if (!threshold) return 'medium';
    if (value >= threshold.high) return 'high';
    if (value >= threshold.medium) return 'medium';
    return 'low';
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderGauge = (gauge: GaugeConfig, index: number) => {
    const statusLevel = getStatusLevel(gauge.value, gauge.threshold);
    const percentage = gauge.value * 100;
    
    return (
      <motion.div
        key={gauge.label}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className={`space-y-2 ${compact ? 'p-2' : 'p-3'} bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300`}
        onMouseEnter={() => setHoveredGauge(gauge.label)}
        onMouseLeave={() => setHoveredGauge(null)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ 
                rotate: hoveredGauge === gauge.label ? 360 : 0,
                scale: hoveredGauge === gauge.label ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
              className={gauge.color}
            >
              {gauge.icon}
            </motion.div>
            <span className={`text-sm font-medium ${gauge.color}`}>
              {gauge.label}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-mono">
              {percentage.toFixed(0)}%
            </span>
            <motion.div
              className={`w-2 h-2 rounded-full ${getStatusColor(statusLevel).replace('text', 'bg')}`}
              animate={{ 
                scale: pulseAnimation ? [1, 1.5, 1] : 1,
                opacity: pulseAnimation ? [1, 0.7, 1] : 1
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <div className="relative">
          <div
            className={`h-2 bg-gray-700 rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}
            role="progressbar"
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${gauge.label}: ${Math.round(percentage)}%`}
          >
            <motion.div
              className={`h-full bg-gradient-to-r ${gauge.gradient} relative overflow-hidden`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {hoveredGauge === gauge.label && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-8 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 z-10"
              >
                {gauge.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const postureColors: Record<string, string> = {
    'COMPANION': 'text-pink-400',
    'CO-PILOT': 'text-blue-400', 
    'PEER': 'text-green-400',
    'EXPERT': 'text-purple-400',
    'SURROGATE': 'text-yellow-400',
    'PARTNER': 'text-red-400'
  };

  return (
    <div role="region" aria-label="Premium emotional state monitoring" className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h3 className="text-lg font-bold text-white flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Emotional State</span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Real-time psychological monitoring
        </p>
      </motion.div>

      {/* Core Gauges */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
          Core Dimensions
        </h4>
        <div className="grid gap-3">
          {coreGauges.map((gauge, index) => renderGauge(gauge, index))}
        </div>
      </div>

      {/* Current Posture */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-700/50 text-center ${compact ? 'p-3' : 'p-4'}`}
      >
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Current Mode
        </div>
        <motion.div
          className={`text-xl font-bold ${postureColors[state.posture] || 'text-violet-400'}`}
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: pulseAnimation ? [`0 0 10px currentColor`, `0 0 20px currentColor`, `0 0 10px currentColor`] : 'none'
          }}
          transition={{ duration: 0.5 }}
        >
          {state.posture || 'PEER'}
        </motion.div>
        <div className="text-xs text-gray-500 mt-1">
          Behavioral configuration
        </div>
      </motion.div>

      {/* Advanced Capabilities */}
      {showAdvanced && (
        <AnimatePresence>
          {(state.empathy !== undefined || state.intuition !== undefined || state.creativity !== undefined || state.wisdom !== undefined || state.humor !== undefined) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                Advanced Capabilities
              </h4>
              <div className="grid gap-3">
                {advancedGauges.filter(gauge => gauge.value > 0).map((gauge, index) => renderGauge(gauge, index + coreGauges.length))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center space-x-2 text-xs text-gray-500"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>System Active</span>
        <span>•</span>
        <span>Real-time Updates</span>
        <span>•</span>
        <span>Premium Analytics</span>
      </motion.div>
    </div>
  );
}