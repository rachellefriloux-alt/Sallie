export interface TrustTier {
  tier: number;
  name: string;
  trust_min: number;
  trust_max: number;
  capabilities: string[];
  permissions: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: string[];
  sandbox?: string;
  dry_run_supported: boolean;
  rollback_strategy: string;
}

export interface AgencyAction {
  id: string;
  actor_id: string;
  action_type: ActionType;
  resource: string;
  parameters: any;
  trust_required: number;
  status: ActionStatus;
  created_at: number;
  started_at?: number;
  completed_at?: number;
  result?: any;
  error?: string;
  rollback_id?: string;
  metadata: ActionMetadata;
}

export enum ActionType {
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  FILE_DELETE = 'file_delete',
  FILE_MOVE = 'file_move',
  DIRECTORY_CREATE = 'directory_create',
  EMAIL_SEND = 'email_send',
  EMAIL_DRAFT = 'email_draft',
  CODE_EXECUTE = 'code_execute',
  SYSTEM_COMMAND = 'system_command',
  API_CALL = 'api_call',
  DATABASE_QUERY = 'database_query',
  MEMORY_ACCESS = 'memory_access',
  HERITAGE_MODIFY = 'heritage_modify',
  AUTO_RESEARCH = 'auto_research',
  WORKFLOW_AUTOMATE = 'workflow_automate',
  SCHEDULE_TASK = 'schedule_task',
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore'
}

export enum ActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export interface ActionMetadata {
  source: 'user_request' | 'autonomous' | 'scheduled' | 'dream_cycle';
  context?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_confirmation: boolean;
  auto_rollback: boolean;
  git_commit_before?: string;
  git_commit_after?: string;
}

export interface CapabilityContract {
  name: string;
  description: string;
  actions: ActionType[];
  sandbox_path?: string;
  dry_run_available: boolean;
  rollback_available: boolean;
  trust_threshold: number;
  risk_assessment: RiskAssessment;
}

export interface RiskAssessment {
  data_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  system_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  privacy_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recovery_difficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'impossible';
  potential_impact: string[];
}

export interface TakeTheWheelRequest {
  trigger_type: 'explicit' | 'fatigue' | 'repeated_stall' | 'high_confidence';
  context: string;
  proposed_actions: ActionProposal[];
  requires_scope_confirmation: boolean;
  estimated_duration?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActionProposal {
  action: ActionType;
  description: string;
  parameters: any;
  expected_outcome: string;
  confidence: number;
}

export interface AgencyLog {
  id: string;
  timestamp: number;
  actor_id: string;
  action_id: string;
  event_type: LogEventType;
  message: string;
  details?: any;
  trust_before: number;
  trust_after?: number;
  tier_before: number;
  tier_after?: number;
}

export enum LogEventType {
  ACTION_REQUESTED = 'action_requested',
  ACTION_APPROVED = 'action_approved',
  ACTION_REJECTED = 'action_rejected',
  ACTION_STARTED = 'action_started',
  ACTION_COMPLETED = 'action_completed',
  ACTION_FAILED = 'action_failed',
  ROLLBACK_INITIATED = 'rollback_initiated',
  ROLLBACK_COMPLETED = 'rollback_completed',
  TRUST_CHANGED = 'trust_changed',
  TIER_CHANGED = 'tier_changed',
  DOOR_SLAM_TRIGGERED = 'door_slam_triggered',
  MORAL_FRICTION = 'moral_friction',
  CONSTITUTIONAL_LOCK = 'constitutional_lock'
}

export interface GitSnapshot {
  commit_hash: string;
  message: string;
  author: string;
  timestamp: number;
  files_changed: string[];
  action_id: string;
  rollback_available: boolean;
}

export interface RollbackRequest {
  action_id: string;
  reason: string;
  force?: boolean;
  timestamp: number;
}

export interface RollbackResult {
  success: boolean;
  rollback_id: string;
  commit_hash: string;
  files_restored: string[];
  error?: string;
  timestamp: number;
}

export interface AgencyConfig {
  trust_tiers: TrustTier[];
  capability_contracts: CapabilityContract[];
  whitelist_paths: string[];
  blacklist_paths: string[];
  sandbox_path: string;
  auto_backup_enabled: boolean;
  git_integration_enabled: boolean;
  max_concurrent_actions: number;
  action_timeout_seconds: number;
  rollback_retention_days: number;
  door_slam_threshold: number;
  moral_friction_enabled: boolean;
  constitutional_locks: string[];
}

export interface AgencyStats {
  total_actions: number;
  actions_by_status: Record<ActionStatus, number>;
  actions_by_type: Record<ActionType, number>;
  success_rate: number;
  average_execution_time: number;
  rollbacks_initiated: number;
  rollbacks_successful: number;
  trust_changes: number;
  tier_changes: number;
  door_slams_triggered: number;
  moral_frictions_detected: number;
  current_trust_score: number;
  current_tier: number;
  active_actions: number;
  queued_actions: number;
}

export interface AgencyAudit {
  audit_id: string;
  timestamp: number;
  period_start: number;
  period_end: number;
  total_actions: number;
  actions_reviewed: AgencyAction[];
  trust_analytics: TrustAnalytics;
  risk_assessment: RiskAnalytics;
  recommendations: string[];
  compliance_score: number;
}

export interface TrustAnalytics {
  initial_trust: number;
  final_trust: number;
  trust_delta: number;
  positive_events: number;
  negative_events: number;
  trust_by_action_type: Record<ActionType, number>;
  trust_trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RiskAnalytics {
  high_risk_actions: number;
  failed_actions: number;
  rollbacks_required: number;
  risk_by_type: Record<ActionType, number>;
  risk_trend: 'increasing' | 'decreasing' | 'stable';
  risk_mitigation_effectiveness: number;
}
