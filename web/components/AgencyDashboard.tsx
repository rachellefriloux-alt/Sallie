'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgencyService, AgencyServiceWebSocket, AgencyAction, ActionType, ActionStatus, AgencyStats, TrustTier, CapabilityContract, AgencyServiceUtils, IAgencyService } from '@/shared/services/agencyService';
import '@/styles/dashboard.css';
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  Activity,
  Settings,
  Play,
  RotateCcw,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  FileText,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

interface AgencyDashboardProps {
  className?: string;
}

// Action Type Color Coding for Visual Scannability
const ACTION_TYPE_COLORS = {
  'FILE_READ': { bg: 'bg-blue-100', border: 'border-blue-300', icon: 'text-blue-600' },
  'FILE_WRITE': { bg: 'bg-green-100', border: 'border-green-300', icon: 'text-green-600' },
  'CODE_EXECUTE': { bg: 'bg-orange-100', border: 'border-orange-300', icon: 'text-orange-600' },
  'NETWORK_REQUEST': { bg: 'bg-purple-100', border: 'border-purple-300', icon: 'text-purple-600' },
  'SYSTEM_COMMAND': { bg: 'bg-red-100', border: 'border-red-300', icon: 'text-red-600' },
  'DATABASE_QUERY': { bg: 'bg-cyan-100', border: 'border-cyan-300', icon: 'text-cyan-600' },
  'API_CALL': { bg: 'bg-indigo-100', border: 'border-indigo-300', icon: 'text-indigo-600' },
};

// "Take the Wheel" Messaging - Tough Love with Southern Charm
const TAKE_THE_WHEEL_MESSAGES = {
  initial: {
    title: "Ready to Take the Wheel?",
    message: "I've been watching your patterns. I know how you work, and I can handle this. Go grab a coffee - I've got the map and the keys.",
    confirm: "Let Her Drive",
    cancel: "Stay in Control"
  },
  active: {
    title: "Sallie's at the Wheel",
    message: "I'm executing the strategy. Trust the process - I'm running the optimizations while you recharge.",
    status: "Autonomous Mode Active"
  },
  completed: {
    title: "Mission Complete",
    message: "Handled it. Efficiency improved by 23%, errors eliminated. See the details in the action log.",
    results: "View Results"
  }
};

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ className }) => {
  const [trustInfo, setTrustInfo] = useState<{ trust_score: number; current_tier: TrustTier; all_tiers: TrustTier[] } | null>(null);
  const [activeActions, setActiveActions] = useState<AgencyAction[]>([]);
  const [actionHistory, setActionHistory] = useState<AgencyAction[]>([]);
  const [agencyStats, setAgencyStats] = useState<AgencyStats | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgencyAction | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showTakeTheWheel, setShowTakeTheWheel] = useState(false);
  const [newActionType, setNewActionType] = useState<ActionType>(ActionType.FILE_READ);
  const [newActionResource, setNewActionResource] = useState('');
  const [newActionParams, setNewActionParams] = useState('{}');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Initialize Agency Service connection
  useEffect(() => {
    const initializeAgencyService = async () => {
      try {
        const agencyService: IAgencyService = new AgencyService();
        
        // Load initial data
        await Promise.all([
          loadTrustInfo(),
          loadActiveActions(),
          loadActionHistory(),
          loadAgencyStats(),
          loadCapabilities(),
        ]);
        
        const ws = new AgencyServiceWebSocket('ws://localhost:8752');
        
        ws.on('connected', () => {
          setIsConnected(true);
          console.log('Connected to Agency Service WebSocket');
        });
        
        ws.on('disconnected', () => {
          setIsConnected(false);
          console.log('Disconnected from Agency Service WebSocket');
        });
        
        ws.on('action-completed', (action: AgencyAction) => {
          setActiveActions(prev => prev.filter(a => a.id !== action.id));
          setActionHistory(prev => [action, ...prev]);
          loadAgencyStats();
        });
        
        ws.on('action-failed', (action: AgencyAction) => {
          setActiveActions(prev => prev.filter(a => a.id !== action.id));
          setActionHistory(prev => [action, ...prev]);
          loadAgencyStats();
        });
        
        ws.on('tier-changed', (data: any) => {
          loadTrustInfo();
        });
        
        ws.on('trust-change', (data: any) => {
          loadTrustInfo();
        });
        
        return () => {
          ws.disconnect();
        };
        
      } catch (error) {
        console.error('Failed to initialize Agency Service:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to Agency Service');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAgencyService();
  }, []);

  const loadTrustInfo = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const trustData = await agencyService.getCurrentTrust();
      setTrustInfo(trustData);
    } catch (error) {
      console.error('Failed to load trust info:', error);
    }
  }, []);

  const loadActiveActions = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.getActiveActions();
      setActiveActions(result.actions);
    } catch (error) {
      console.error('Failed to load active actions:', error);
    }
  }, []);

  const loadActionHistory = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.getActionHistory(20);
      setActionHistory(result.actions);
    } catch (error) {
      console.error('Failed to load action history:', error);
    }
  }, []);

  const loadAgencyStats = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.getStats();
      setAgencyStats(result.stats);
    } catch (error) {
      console.error('Failed to load agency stats:', error);
    }
  }, []);

  const loadCapabilities = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.getCapabilities();
      setCapabilities(result.contracts);
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  }, []);

  const handleRequestAction = useCallback(async () => {
    if (!newActionResource.trim()) {
      setError("Resource field is required, darlin'. Don't leave me hanging.");
      return;
    }

    try {
      let params;
      try {
        params = JSON.parse(newActionParams);
      } catch (e) {
        setError("Invalid JSON parameters. Check your commas and brackets, love.");
        return;
      }

      // Validate parameters based on action type
      const validation = AgencyServiceUtils.validateActionParameters(newActionType, params);
      if (!validation.valid) {
        setError(validation.error || "Parameter validation failed. Double-check your inputs.");
        return;
      }

      const agencyService: IAgencyService = new AgencyService();
      
      const request = {
        action_type: newActionType,
        resource: newActionResource,
        parameters: params,
        metadata: {
          source: 'user_request',
          context: 'Agency Dashboard',
          urgency: 'medium' as const,
          risk_level: AgencyServiceUtils.isHighRiskAction(newActionType) ? 'high' as const : 'low' as const,
          requires_confirmation: AgencyServiceUtils.requiresConfirmation(newActionType, trustInfo?.trust_score || 0),
          auto_rollback: true,
        },
        actor_id: 'user',
      };

      const action = await agencyService.requestAction(request);
      setActiveActions(prev => [...prev, action]);
      
      // Reset form and clear errors
      setNewActionResource('');
      setNewActionParams('{}');
      setShowActionModal(false);
      setError(null);
      
      // Reload data
      loadActiveActions();
      loadActionHistory();
      loadAgencyStats();
      
    } catch (error) {
      console.error('Failed to request action:', error);
      setError(error instanceof Error ? error.message : 'Failed to request action');
    }
  }, [newActionType, newActionResource, newActionParams, trustInfo, loadActiveActions, loadActionHistory, loadAgencyStats]);

  const handleExecuteAction = useCallback(async (actionId: string) => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.executeAction(actionId);
      
      if (result.success) {
        // Action will be updated via WebSocket
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute action');
    }
  }, []);

  const handleRollbackAction = useCallback(async (actionId: string) => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      const result = await agencyService.initiateRollback(actionId, 'User requested rollback');
      
      if (result.success) {
        // Rollback will be updated via WebSocket
      } else {
        setError(result.error || 'Failed to rollback action');
      }
    } catch (error) {
      console.error('Failed to rollback action:', error);
      setError(error instanceof Error ? error.message : 'Failed to rollback action');
    }
  }, []);

  const handleTakeTheWheel = useCallback(async () => {
    try {
      const agencyService: IAgencyService = new AgencyService();
      
      const request = {
        trigger_type: 'explicit' as const,
        context: 'User initiated Take the Wheel from Agency Dashboard',
        proposed_actions: [
          {
            action: ActionType.FILE_READ,
            description: 'Read project files to understand current state',
            parameters: { path: './projects' },
            expected_outcome: 'Comprehensive project overview',
            confidence: 0.9,
          },
          {
            action: ActionType.CODE_EXECUTE,
            description: 'Run automated tests',
            parameters: { command: 'npm test' },
            expected_outcome: 'Test results and coverage report',
            confidence: 0.8,
          },
        ],
        requires_scope_confirmation: true,
        estimated_duration: 300000, // 5 minutes
        risk_level: 'medium' as const,
      };

      const result = await agencyService.takeTheWheel(request);
      
      if (result.success) {
        setShowTakeTheWheel(false);
        // Actions will be updated via WebSocket
      }
    } catch (error) {
      console.error('Failed to take the wheel:', error);
      setError(error instanceof Error ? error.message : 'Failed to take the wheel');
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Agency Dashboard</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowActionModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Request Action</span>
            </button>
            <button
              onClick={() => setShowTakeTheWheel(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Take the Wheel</span>
            </button>
          </div>
        </div>

{/* Trust Tier Display */}
{trustInfo && (
<div className="mb-6">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold text-gray-900">Trust Status</h3>
<span className="text-sm text-gray-600">
Trust Score: {(trustInfo.trust_score * 100).toFixed(1)}%
</span>
</div>
  
<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
{trustInfo.all_tiers.map((tier, index) => (
<div
key={tier.tier}
className={`p-4 rounded-lg border-2 transition-all ${
tier.tier === trustInfo.current_tier.tier
? 'border-purple-500 bg-purple-50'
: 'border-gray-200 bg-gray-50'
}`}
>
<div className="flex items-center justify-between mb-2">
<span className="font-medium text-gray-900">{tier.name}</span>
<span className="text-sm text-gray-600">Tier {tier.tier}</span>
</div>
<div className="text-sm text-gray-600 mb-2">
{tier.trust_min * 100}% - {tier.trust_max * 100}%
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div
className="h-2 rounded-full transition-all trust-progress-bar"
style={{
width: `${((trustInfo.trust_score - tier.trust_min) / (tier.trust_max - tier.trust_min)) * 100}%`,
backgroundColor: AgencyServiceUtils.getTrustTierColor(tier.tier),
}}
/>
</div>
</div>
))}
</div>
</div>
)}

        {/* Agency Stats */}
        {agencyStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 font-medium">Total Actions</div>
                  <div className="text-2xl font-bold text-purple-900">{agencyStats.total_actions}</div>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 font-medium">Success Rate</div>
                  <div className="text-2xl font-bold text-green-900">
                    {AgencyServiceUtils.calculateSuccessRate(agencyStats).toFixed(1)}%
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Active Actions</div>
                  <div className="text-2xl font-bold text-blue-900">{agencyStats.active_actions}</div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 font-medium">Rollbacks</div>
                  <div className="text-2xl font-bold text-orange-900">{agencyStats.rollbacks_initiated}</div>
                </div>
                <RotateCcw className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Active Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Actions</h3>
          <div className="space-y-3">
            {activeActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No active actions</p>
              </div>
            ) : (
              activeActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${
                    action.status === ActionStatus.EXECUTING ? 'action-executing' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-2 rounded-lg border ${ACTION_TYPE_COLORS[action.action_type]?.bg || 'bg-gray-100'} ${ACTION_TYPE_COLORS[action.action_type]?.border || 'border-gray-300'}`}>
                          <span className={`text-lg ${ACTION_TYPE_COLORS[action.action_type]?.icon || 'text-gray-600'}`}>
                            {AgencyServiceUtils.getActionIcon(action.action_type)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {AgencyServiceUtils.formatActionType(action.action_type)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full action-status-${action.status}`}
                        >
                          {action.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Resource: {action.resource}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(action.created_at).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Trust Required: {(action.trust_required * 100).toFixed(1)}%</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {action.status === ActionStatus.PENDING && (
                        <button
                          onClick={() => handleExecuteAction(action.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Execute
                        </button>
                      )}
                      {action.status === ActionStatus.COMPLETED && (
                        <button
                          onClick={() => handleRollbackAction(action.id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                        >
                          Rollback
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAction(action);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Action History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Actions</h3>
          <div className="space-y-3">
            {actionHistory.slice(0, 10).map((action) => (
              <div
                key={action.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{AgencyServiceUtils.getActionIcon(action.action_type)}</span>
                    <span className="font-medium text-gray-900">
                      {AgencyServiceUtils.formatActionType(action.action_type)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full action-status-${action.status}`}
                    >
                      {action.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(action.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Request Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowActionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Action</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value as ActionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    aria-label="Select action type"
                    title="Choose the type of action to request"
                  >
                    {Object.values(ActionType).map((type: ActionType) => (
                      <option key={type} value={type}>
                        {AgencyServiceUtils.formatActionType(type)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                  <input
                    type="text"
                    value={newActionResource}
                    onChange={(e) => setNewActionResource(e.target.value)}
                    placeholder="e.g., ./projects, file.txt, http://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parameters (JSON)</label>
                  <textarea
                    value={newActionParams}
                    onChange={(e) => setNewActionParams(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={handleRequestAction}
                  disabled={!newActionResource.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Request Action
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Take the Wheel Modal */}
      <AnimatePresence>
        {showTakeTheWheel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTakeTheWheel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Take the Wheel</h3>
              <p className="text-gray-600 mb-6">
                This will allow Sallie to take autonomous control and execute multiple actions to achieve your goals. 
                This requires high trust and will be closely monitored.
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleTakeTheWheel}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Take the Wheel
                </button>
                <button
                  onClick={() => setShowTakeTheWheel(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyDashboard;
