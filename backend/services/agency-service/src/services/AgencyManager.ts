import { 
  TrustTier, 
  AgencyAction, 
  ActionType, 
  ActionStatus, 
  ActionMetadata, 
  CapabilityContract,
  TakeTheWheelRequest,
  AgencyLog,
  LogEventType,
  GitSnapshot,
  RollbackRequest,
  RollbackResult,
  AgencyConfig,
  AgencyStats,
  RiskAssessment
} from '../models/Agency';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class AgencyManager extends EventEmitter {
  private config: AgencyConfig;
  private currentTrust: number;
  private currentTier: TrustTier;
  private activeActions: Map<string, AgencyAction> = new Map();
  private actionHistory: AgencyAction[] = [];
  private git: simpleGit.SimpleGit;
  private logs: AgencyLog[] = [];
  private gitSnapshots: Map<string, GitSnapshot> = new Map();

  constructor(config: AgencyConfig) {
    super();
    this.config = config;
    this.currentTrust = 0.5; // Default bootstrap trust
    this.currentTier = this.config.trust_tiers[0];
    this.git = simpleGit();
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize git repository if needed
      await this.initializeGit();
      
      // Load current trust state from storage
      await this.loadTrustState();
      
      // Start background processes
      this.startBackgroundProcesses();
      
      logger.info('Agency Manager initialized successfully');
      logger.info(`Current trust: ${this.currentTrust}, Tier: ${this.currentTier.name}`);
      
    } catch (error) {
      logger.error('Failed to initialize Agency Manager:', error);
      throw error;
    }
  }

  public async requestAction(
    actionType: ActionType,
    resource: string,
    parameters: any,
    metadata: Partial<ActionMetadata>,
    actorId: string
  ): Promise<AgencyAction> {
    try {
      const action: AgencyAction = {
        id: uuidv4(),
        actor_id: actorId,
        action_type: actionType,
        resource,
        parameters,
        trust_required: this.getTrustRequirement(actionType),
        status: ActionStatus.PENDING,
        created_at: Date.now(),
        metadata: {
          source: 'user_request',
          context: metadata.context,
          urgency: metadata.urgency || 'medium',
          risk_level: metadata.risk_level || 'medium',
          requires_confirmation: metadata.requires_confirmation !== false,
          auto_rollback: metadata.auto_rollback !== false,
        },
      };

      // Check if action is allowed at current trust level
      if (!this.isActionAllowed(actionType, this.currentTrust)) {
        action.status = ActionStatus.REJECTED;
        action.error = `Insufficient trust level. Required: ${action.trust_required}, Current: ${this.currentTrust}`;
        
        await this.logEvent(LogEventType.ACTION_REJECTED, action.actor_id, action.id, 
          `Action rejected: insufficient trust`, {
            action_type: actionType,
            required_trust: action.trust_required,
            current_trust: this.currentTrust
          });
        
        return action;
      }

      // Check for moral friction
      const friction = await this.checkMoralFriction(action);
      if (friction) {
        action.status = ActionStatus.REJECTED;
        action.error = 'Moral friction detected - action conflicts with constitutional principles';
        
        await this.logEvent(LogEventType.MORAL_FRICTION, action.actor_id, action.id, 
          'Action rejected due to moral friction', {
            action_type: actionType,
            friction_reason: friction
          });
        
        return action;
      }

      // Check if confirmation is required
      if (action.metadata.requires_confirmation) {
        action.status = ActionStatus.APPROVED;
        await this.logEvent(LogEventType.ACTION_APPROVED, action.actor_id, action.id, 
          'Action approved pending confirmation');
      } else {
        // Auto-execute for low-risk actions
        await this.executeAction(action);
      }

      return action;

    } catch (error) {
      logger.error('Failed to request action:', error);
      throw error;
    }
  }

  public async executeAction(action: AgencyAction): Promise<void> {
    try {
      action.status = ActionStatus.IN_PROGRESS;
      action.started_at = Date.now();
      
      await this.logEvent(LogEventType.ACTION_STARTED, action.actor_id, action.id, 
        `Started executing ${action.action_type}`);

      // Create git snapshot before action if required
      if (this.shouldCreateSnapshot(action)) {
        const snapshot = await this.createGitSnapshot(action);
        action.metadata.git_commit_before = snapshot.commit_hash;
      }

      // Execute the action based on type
      const result = await this.performAction(action);
      
      action.status = ActionStatus.COMPLETED;
      action.completed_at = Date.now();
      action.result = result;
      
      // Update trust based on outcome
      await this.updateTrustFromAction(action, true);
      
      await this.logEvent(LogEventType.ACTION_COMPLETED, action.actor_id, action.id, 
        `Successfully completed ${action.action_type}`, { result });

      this.emit('actionCompleted', action);

    } catch (error) {
      action.status = ActionStatus.FAILED;
      action.completed_at = Date.now();
      action.error = error.message;
      
      // Update trust based on failure
      await this.updateTrustFromAction(action, false);
      
      await this.logEvent(LogEventType.ACTION_FAILED, action.actor_id, action.id, 
        `Failed to execute ${action.action_type}: ${error.message}`, { error: error.message });

      // Auto-rollback if enabled and possible
      if (action.metadata.auto_rollback && action.metadata.git_commit_before) {
        await this.initiateRollback(action.id, 'Auto-rollback due to action failure');
      }

      this.emit('actionFailed', action);
      throw error;
    }
  }

  public async initiateRollback(actionId: string, reason: string, force?: boolean): Promise<RollbackResult> {
    try {
      const action = this.actionHistory.find(a => a.id === actionId);
      if (!action) {
        throw new Error(`Action not found: ${actionId}`);
      }

      if (!action.metadata.git_commit_before) {
        throw new Error('No git snapshot available for rollback');
      }

      await this.logEvent(LogEventType.ROLLBACK_INITIATED, action.actor_id, actionId, 
        `Rollback initiated: ${reason}`);

      // Perform git rollback
      await this.git.checkout(action.metadata.git_commit_before);
      
      const rollbackResult: RollbackResult = {
        success: true,
        rollback_id: uuidv4(),
        commit_hash: action.metadata.git_commit_before,
        files_restored: [], // Would be populated by git diff
        timestamp: Date.now()
      };

      // Update action status
      action.status = ActionStatus.ROLLED_BACK;
      action.rollback_id = rollbackResult.rollback_id;

      await this.logEvent(LogEventType.ROLLBACK_COMPLETED, action.actor_id, actionId, 
        `Rollback completed successfully`, { rollback_id: rollbackResult.rollback_id });

      this.emit('rollbackCompleted', rollbackResult);
      return rollbackResult;

    } catch (error) {
      logger.error('Failed to rollback action:', error);
      throw error;
    }
  }

  public async takeTheWheel(request: TakeTheWheelRequest): Promise<AgencyAction[]> {
    try {
      const executedActions: AgencyAction[] = [];

      for (const proposal of request.proposed_actions) {
        const action = await this.requestAction(
          proposal.action,
          'take_the_wheel',
          proposal.parameters,
          {
            source: 'autonomous',
            context: request.context,
            urgency: 'high',
            risk_level: request.risk_level,
            requires_confirmation: request.requires_scope_confirmation,
            auto_rollback: true
          },
          'system'
        );

        if (action.status === ActionStatus.APPROVED) {
          await this.executeAction(action);
          executedActions.push(action);
        }
      }

      return executedActions;

    } catch (error) {
      logger.error('Failed to take the wheel:', error);
      throw error;
    }
  }

  public getCurrentTrust(): number {
    return this.currentTrust;
  }

  public getCurrentTier(): TrustTier {
    return this.currentTier;
  }

  public getActiveActions(): AgencyAction[] {
    return Array.from(this.activeActions.values());
  }

  public getActionHistory(limit?: number): AgencyAction[] {
    return limit ? this.actionHistory.slice(-limit) : this.actionHistory;
  }

  public getAgencyStats(): AgencyStats {
    const actionsByStatus = this.actionHistory.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1;
      return acc;
    }, {} as Record<ActionStatus, number>);

    const actionsByType = this.actionHistory.reduce((acc, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {} as Record<ActionType, number>);

    const completedActions = this.actionHistory.filter(a => a.status === ActionStatus.COMPLETED);
    const successRate = completedActions.length / Math.max(1, this.actionHistory.length);

    const averageExecutionTime = completedActions.length > 0
      ? completedActions.reduce((sum, action) => {
          const duration = (action.completed_at! - action.started_at!) / 1000;
          return sum + duration;
        }, 0) / completedActions.length
      : 0;

    return {
      total_actions: this.actionHistory.length,
      actions_by_status: actionsByStatus,
      actions_by_type: actionsByType,
      success_rate,
      average_execution_time,
      rollbacks_initiated: this.logs.filter(l => l.event_type === LogEventType.ROLLBACK_INITIATED).length,
      rollbacks_successful: this.logs.filter(l => l.event_type === LogEventType.ROLLBACK_COMPLETED).length,
      trust_changes: this.logs.filter(l => l.event_type === LogEventType.TRUST_CHANGED).length,
      tier_changes: this.logs.filter(l => l.event_type === LogEventType.TIER_CHANGED).length,
      door_slams_triggered: this.logs.filter(l => l.event_type === LogEventType.DOOR_SLAM_TRIGGERED).length,
      moral_frictions_detected: this.logs.filter(l => l.event_type === LogEventType.MORAL_FRICTION).length,
      current_trust_score: this.currentTrust,
      current_tier: this.currentTier.tier,
      active_actions: this.activeActions.size,
      queued_actions: 0 // Would be implemented with a queue system
    };
  }

  private async initializeGit(): Promise<void> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        await this.git.init();
        logger.info('Initialized git repository');
      }
    } catch (error) {
      logger.error('Failed to initialize git:', error);
      throw error;
    }
  }

  private async loadTrustState(): Promise<void> {
    // This would load from persistent storage
    // For now, using default values
    this.updateCurrentTier();
  }

  private startBackgroundProcesses(): void {
    // Start periodic trust decay, cleanup, etc.
    setInterval(() => {
      this.performTrustDecay();
    }, 60 * 60 * 1000); // Every hour
  }

  private isActionAllowed(actionType: ActionType, trust: number): boolean {
    const contract = this.config.capability_contracts.find(c => 
      c.actions.includes(actionType)
    );
    
    if (!contract) return false;
    
    return trust >= contract.trust_threshold;
  }

  private getTrustRequirement(actionType: ActionType): number {
    const contract = this.config.capability_contracts.find(c => 
      c.actions.includes(actionType)
    );
    
    return contract ? contract.trust_threshold : 1.0;
  }

  private async checkMoralFriction(action: AgencyAction): Promise<string | null> {
    // Check against constitutional locks
    for (const lock of this.config.constitutional_locks) {
      if (action.resource.includes(lock) || action.action_type.toString().includes(lock)) {
        return `Action conflicts with constitutional lock: ${lock}`;
      }
    }

    // Check for door slam risk
    if (this.currentTrust < this.config.door_slam_threshold) {
      const highRiskActions = [ActionType.FILE_DELETE, ActionType.SYSTEM_COMMAND, ActionType.EMAIL_SEND];
      if (highRiskActions.includes(action.action_type)) {
        return 'High-risk action detected at low trust level - potential door slam risk';
      }
    }

    return null;
  }

  private shouldCreateSnapshot(action: AgencyAction): boolean {
    const snapshotRequiredActions = [
      ActionType.FILE_WRITE,
      ActionType.FILE_DELETE,
      ActionType.FILE_MOVE,
      ActionType.DIRECTORY_CREATE,
      ActionType.HERITAGE_MODIFY
    ];
    
    return snapshotRequiredActions.includes(action.action_type);
  }

  private async createGitSnapshot(action: AgencyAction): Promise<GitSnapshot> {
    try {
      // Stage all changes
      await this.git.add('.');
      
      // Create commit
      const commitResult = await this.git.commit(`[PROGENY] Pre-action snapshot: ${action.action_type}`);
      
      const snapshot: GitSnapshot = {
        commit_hash: commitResult.commit,
        message: commitResult.commit,
        author: 'sallie-agency',
        timestamp: Date.now(),
        files_changed: [], // Would be populated by git status
        action_id: action.id,
        rollback_available: true
      };

      this.gitSnapshots.set(action.id, snapshot);
      return snapshot;

    } catch (error) {
      logger.error('Failed to create git snapshot:', error);
      throw error;
    }
  }

  private async performAction(action: AgencyAction): Promise<any> {
    // This would implement the actual action execution
    // For now, returning a mock result
    switch (action.action_type) {
      case ActionType.FILE_READ:
        return await this.performFileRead(action.resource, action.parameters);
      case ActionType.FILE_WRITE:
        return await this.performFileWrite(action.resource, action.parameters);
      case ActionType.EMAIL_DRAFT:
        return await this.performEmailDraft(action.parameters);
      default:
        throw new Error(`Action type not implemented: ${action.action_type}`);
    }
  }

  private async performFileRead(filePath: string, parameters: any): Promise<string> {
    const fullPath = path.resolve(filePath);
    
    // Check if path is in whitelist
    if (!this.isPathAllowed(fullPath)) {
      throw new Error(`Path not allowed: ${fullPath}`);
    }

    return await fs.readFile(fullPath, 'utf-8');
  }

  private async performFileWrite(filePath: string, parameters: any): Promise<void> {
    const fullPath = path.resolve(filePath);
    
    // Check if path is in whitelist
    if (!this.isPathAllowed(fullPath)) {
      throw new Error(`Path not allowed: ${fullPath}`);
    }

    await fs.writeFile(fullPath, parameters.content, 'utf-8');
  }

  private async performEmailDraft(parameters: any): Promise<string> {
    // Create email draft in outbox
    const draftId = uuidv4();
    const draftPath = path.join(this.config.sandbox_path, 'outbox', `draft_${draftId}.json`);
    
    await fs.ensureDir(path.dirname(draftPath));
    await fs.writeJSON(draftPath, {
      id: draftId,
      to: parameters.to,
      subject: parameters.subject,
      body: parameters.body,
      created_at: Date.now(),
      status: 'draft'
    });

    return draftId;
  }

  private isPathAllowed(fullPath: string): boolean {
    // Check against blacklist
    for (const blacklistPath of this.config.blacklist_paths) {
      if (fullPath.startsWith(path.resolve(blacklistPath))) {
        return false;
      }
    }

    // Check against whitelist
    for (const whitelistPath of this.config.whitelist_paths) {
      if (fullPath.startsWith(path.resolve(whitelistPath))) {
        return true;
      }
    }

    // Allow sandbox path
    if (fullPath.startsWith(path.resolve(this.config.sandbox_path))) {
      return true;
    }

    return false;
  }

  private async updateTrustFromAction(action: AgencyAction, success: boolean): Promise<void> {
    const oldTrust = this.currentTrust;
    
    if (success) {
      // Small trust increase for successful actions
      this.currentTrust = Math.min(1.0, this.currentTrust + 0.01);
    } else {
      // Larger trust decrease for failed actions
      this.currentTrust = Math.max(0.0, this.currentTrust - 0.05);
    }

    await this.updateCurrentTier();

    if (Math.abs(this.currentTrust - oldTrust) > 0.001) {
      await this.logEvent(LogEventType.TRUST_CHANGED, action.actor_id, action.id, 
        `Trust changed from ${oldTrust.toFixed(3)} to ${this.currentTrust.toFixed(3)}`, {
          old_trust: oldTrust,
          new_trust: this.currentTrust,
          action_success: success
        });
    }
  }

  private updateCurrentTier(): void {
    const newTier = this.config.trust_tiers.find(tier => 
      this.currentTrust >= tier.trust_min && this.currentTrust <= tier.trust_max
    ) || this.config.trust_tiers[0];

    if (newTier.tier !== this.currentTier.tier) {
      const oldTier = this.currentTier;
      this.currentTier = newTier;
      
      this.logEvent(LogEventType.TIER_CHANGED, 'system', '', 
        `Tier changed from ${oldTier.name} to ${newTier.name}`, {
          old_tier: oldTier.tier,
          new_tier: newTier.tier,
          trust_level: this.currentTrust
        });
      
      this.emit('tierChanged', { oldTier, newTier, trust: this.currentTrust });
    }
  }

  private performTrustDecay(): void {
    const oldTrust = this.currentTrust;
    this.currentTrust = Math.max(0.1, this.currentTrust - 0.001); // Small decay
    
    if (Math.abs(this.currentTrust - oldTrust) > 0.001) {
      this.updateCurrentTier();
    }
  }

  private async logEvent(
    eventType: LogEventType, 
    actorId: string, 
    actionId: string, 
    message: string, 
    details?: any
  ): Promise<void> {
    const log: AgencyLog = {
      id: uuidv4(),
      timestamp: Date.now(),
      actor_id: actorId,
      action_id: actionId,
      event_type: eventType,
      message,
      details,
      trust_before: this.currentTrust,
      trust_after: this.currentTrust,
      tier_before: this.currentTier.tier,
      tier_after: this.currentTier.tier
    };

    this.logs.push(log);
    
    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }

    logger.info(`Agency Log: ${message}`, log);
  }
}
