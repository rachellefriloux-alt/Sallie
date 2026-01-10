// Agency Dashboard Type Definitions

export interface TrustTier {
  tier: number;
  name: string;
  trust_min: number;
  trust_max: number;
  permissions: string[];
  restrictions: string[];
  color: string;
}

export interface AgencyAction {
  id: string;
  action_type: string;
  resource: string;
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'rollback';
  trust_required: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  metadata: {
    source: string;
    context: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    requires_confirmation: boolean;
    auto_rollback: boolean;
  };
  execution_log?: string[];
  rollback_available: boolean;
}

export interface AgencyStats {
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  active_actions: number;
  rollbacks_initiated: number;
  rollbacks_successful: number;
  avg_execution_time: number;
  trust_score: number;
  current_tier: number;
  capabilities_used: number;
  security_events: number;
  performance_metrics: {
    cpu_usage: number;
    memory_usage: number;
    network_latency: number;
    response_time: number;
  };
}

export interface CapabilityContract {
  id: string;
  name: string;
  description: string;
  category: string;
  trust_required: number;
  risk_level: string;
  usage_count: number;
  last_used: string;
  success_rate: number;
  enabled: boolean;
  restrictions: string[];
}

export interface AgencyDashboardProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

export interface ActionTypeInfo {
  icon: React.ComponentType<any>;
  color: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
}
