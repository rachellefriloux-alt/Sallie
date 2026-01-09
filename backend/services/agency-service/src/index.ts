import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AgencyManager } from './services/AgencyManager';
import { 
  TrustTier, 
  ActionType, 
  ActionStatus, 
  AgencyConfig, 
  CapabilityContract,
  TakeTheWheelRequest,
  RollbackRequest
} from './models/Agency';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware } from './middleware/metrics';
import { tracingMiddleware } from './middleware/tracing';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8752;

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://192.168.1.47:3000'],
    credentials: true
  }
});

// Initialize Agency Manager configuration
const trustTiers: TrustTier[] = [
  {
    tier: 0,
    name: 'Stranger',
    trust_min: 0.0,
    trust_max: 0.6,
    capabilities: ['suggest_actions', 'read_whitelisted_files'],
    permissions: [
      {
        action: 'file_read',
        resource: 'whitelisted_paths',
        conditions: ['path_in_whitelist'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'none'
      }
    ]
  },
  {
    tier: 1,
    name: 'Associate',
    trust_min: 0.6,
    trust_max: 0.8,
    capabilities: ['suggest_actions', 'read_whitelisted_files', 'write_to_drafts'],
    permissions: [
      {
        action: 'file_read',
        resource: 'whitelisted_paths',
        conditions: ['path_in_whitelist'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'none'
      },
      {
        action: 'file_write',
        resource: 'sandbox_paths',
        conditions: ['path_in_sandbox'],
        sandbox: '/progeny_root/drafts',
        dry_run_supported: true,
        rollback_strategy: 'git_revert'
      }
    ]
  },
  {
    tier: 2,
    name: 'Partner',
    trust_min: 0.8,
    trust_max: 0.9,
    capabilities: ['suggest_actions', 'read_whitelisted_files', 'write_to_drafts', 'write_whitelist', 'send_drafts', 'execute_safe_code'],
    permissions: [
      {
        action: 'file_read',
        resource: 'all_permitted_files',
        conditions: ['not_in_blacklist'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'none'
      },
      {
        action: 'file_write',
        resource: 'whitelist_paths',
        conditions: ['path_in_whitelist', 'git_commit_before'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'git_revert'
      },
      {
        action: 'email_draft',
        resource: 'outbox',
        conditions: ['draft_only'],
        sandbox: '/progeny_root/outbox',
        dry_run_supported: true,
        rollback_strategy: 'delete_draft'
      }
    ]
  },
  {
    tier: 3,
    name: 'Surrogate',
    trust_min: 0.9,
    trust_max: 0.95,
    capabilities: ['all_partner_capabilities', 'direct_modification', 'send_messages', 'execute_code'],
    permissions: [
      {
        action: 'file_write',
        resource: 'whitelist_paths',
        conditions: ['path_in_whitelist', 'git_commit_before'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'git_revert'
      },
      {
        action: 'email_send',
        resource: 'email_system',
        conditions: ['self_report', 'undo_window'],
        sandbox: 'none',
        dry_run_supported: false,
        rollback_strategy: 'none'
      },
      {
        action: 'code_execute',
        resource: 'safe_scripts',
        conditions: ['sandboxed', 'timeout'],
        sandbox: '/progeny_root/safe_scripts',
        dry_run_supported: true,
        rollback_strategy: 'none'
      }
    ]
  },
  {
    tier: 4,
    name: 'Full Partner',
    trust_min: 0.95,
    trust_max: 1.0,
    capabilities: ['all_capabilities', 'unrestricted_access', 'autonomous_decision_making', 'cross_platform_automation'],
    permissions: [
      {
        action: 'system_command',
        resource: 'system',
        conditions: ['safety_checks'],
        sandbox: 'none',
        dry_run_supported: true,
        rollback_strategy: 'none'
      }
    ]
  }
];

const capabilityContracts: CapabilityContract[] = [
  {
    name: 'File Management',
    description: 'File system operations with safety constraints',
    actions: [ActionType.FILE_READ, ActionType.FILE_WRITE, ActionType.FILE_DELETE, ActionType.FILE_MOVE],
    sandbox_path: '/progeny_root/drafts',
    dry_run_available: true,
    rollback_available: true,
    trust_threshold: 0.6,
    risk_assessment: {
      data_risk: 'medium',
      system_risk: 'low',
      privacy_risk: 'medium',
      recovery_difficulty: 'easy',
      potential_impact: ['data_modification', 'file_structure_changes']
    }
  },
  {
    name: 'Communication',
    description: 'Email and messaging operations',
    actions: [ActionType.EMAIL_DRAFT, ActionType.EMAIL_SEND],
    dry_run_available: true,
    rollback_available: false,
    trust_threshold: 0.8,
    risk_assessment: {
      data_risk: 'high',
      system_risk: 'low',
      privacy_risk: 'high',
      recovery_difficulty: 'impossible',
      potential_impact: ['external_communication', 'privacy_disclosure']
    }
  },
  {
    name: 'Code Execution',
    description: 'Safe code execution in sandboxed environment',
    actions: [ActionType.CODE_EXECUTE],
    sandbox_path: '/progeny_root/safe_scripts',
    dry_run_available: true,
    rollback_available: false,
    trust_threshold: 0.9,
    risk_assessment: {
      data_risk: 'medium',
      system_risk: 'high',
      privacy_risk: 'low',
      recovery_difficulty: 'moderate',
      potential_impact: ['system_execution', 'resource_usage']
    }
  }
];

const agencyConfig: AgencyConfig = {
  trust_tiers: trustTiers,
  capability_contracts: capabilityContracts,
  whitelist_paths: [
    process.env.WHITELIST_PATH || './work',
    process.env.WHITELIST_PATH2 || './projects',
    process.env.WHITELIST_PATH3 || './documents'
  ],
  blacklist_paths: [
    process.env.BLACKLIST_PATH || './secrets',
    process.env.BLACKLIST_PATH2 || './.ssh',
    process.env.BLACKLIST_PATH3 || './.gnupg'
  ],
  sandbox_path: process.env.SANDBOX_PATH || './progeny_root/drafts',
  auto_backup_enabled: process.env.AUTO_BACKUP_ENABLED !== 'false',
  git_integration_enabled: process.env.GIT_INTEGRATION_ENABLED !== 'false',
  max_concurrent_actions: parseInt(process.env.MAX_CONCURRENT_ACTIONS || '5'),
  action_timeout_seconds: parseInt(process.env.ACTION_TIMEOUT_SECONDS || '300'),
  rollback_retention_days: parseInt(process.env.ROLLBACK_RETENTION_DAYS || '30'),
  door_slam_threshold: parseFloat(process.env.DOOR_SLAM_THRESHOLD || '0.2'),
  moral_friction_enabled: process.env.MORAL_FRICTION_ENABLED !== 'false',
  constitutional_locks: [
    'door_slam',
    'moral_friction',
    'prime_directive',
    'constitutional'
  ]
};

const agencyManager = new AgencyManager(agencyConfig);

// Initialize the agency manager
agencyManager.initialize().then(() => {
  logger.info('Agency Manager initialized successfully');
}).catch(error => {
  logger.error('Failed to initialize Agency Manager:', error);
  process.exit(1);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://192.168.1.47:3000'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Metrics and tracing
app.use(metricsMiddleware);
app.use(tracingMiddleware);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'agency-service',
    trust_score: agencyManager.getCurrentTrust(),
    current_tier: agencyManager.getCurrentTier().name
  });
});

// Get current trust and tier
app.get('/trust', (req, res) => {
  res.json({
    trust_score: agencyManager.getCurrentTrust(),
    current_tier: agencyManager.getCurrentTier(),
    all_tiers: trustTiers
  });
});

// Request action
app.post('/actions/request', async (req, res) => {
  try {
    const { action_type, resource, parameters, metadata, actor_id } = req.body;
    
    if (!action_type || !resource || !actor_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'action_type, resource, and actor_id are required'
      });
    }

    const action = await agencyManager.requestAction(
      action_type,
      resource,
      parameters,
      metadata || {},
      actor_id
    );
    
    res.json({
      success: true,
      action
    });
  } catch (error) {
    logger.error('Failed to request action:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to request action'
    });
  }
});

// Execute action
app.post('/actions/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get action from history
    const action = agencyManager.getActionHistory().find(a => a.id === id);
    if (!action) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Action not found'
      });
    }

    await agencyManager.executeAction(action);
    
    res.json({
      success: true,
      message: 'Action executed successfully',
      action
    });
  } catch (error) {
    logger.error('Failed to execute action:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to execute action'
    });
  }
});

// Get action by ID
app.get('/actions/:id', (req, res) => {
  const { id } = req.params;
  const action = agencyManager.getActionHistory().find(a => a.id === id);
  
  if (!action) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Action not found'
    });
  }
  
  res.json({
    success: true,
    action
  });
});

// Get action history
app.get('/actions/history', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const history = agencyManager.getActionHistory(limit);
  
  res.json({
    success: true,
    actions: history,
    total_count: history.length
  });
});

// Get active actions
app.get('/actions/active', (req, res) => {
  const activeActions = agencyManager.getActiveActions();
  
  res.json({
    success: true,
    actions: activeActions,
    active_count: activeActions.length
  });
});

// Initiate rollback
app.post('/actions/:id/rollback', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, force } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'reason is required'
      });
    }

    const result = await agencyManager.initiateRollback(id, reason, force);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Failed to rollback action:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to rollback action'
    });
  }
});

// Take the wheel
app.post('/take-the-wheel', async (req, res) => {
  try {
    const request: TakeTheWheelRequest = req.body;
    
    if (!request.trigger_type || !request.context || !request.proposed_actions) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'trigger_type, context, and proposed_actions are required'
      });
    }

    const executedActions = await agencyManager.takeTheWheel(request);
    
    res.json({
      success: true,
      executed_actions: executedActions,
      executed_count: executedActions.length
    });
  } catch (error) {
    logger.error('Failed to take the wheel:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to take the wheel'
    });
  }
});

// Get agency statistics
app.get('/stats', (req, res) => {
  const stats = agencyManager.getAgencyStats();
  
  res.json({
    success: true,
    stats
  });
});

// Get capability contracts
app.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    contracts: capabilityContracts
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(require('./utils/metrics').getMetrics());
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    available_routes: [
      '/health',
      '/trust',
      '/actions/request',
      '/actions/:id',
      '/actions/:id/execute',
      '/actions/:id/rollback',
      '/actions/history',
      '/actions/active',
      '/take-the-wheel',
      '/stats',
      '/capabilities',
      '/metrics'
    ]
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Send current trust state
  socket.emit('trust-state', {
    trust_score: agencyManager.getCurrentTrust(),
    current_tier: agencyManager.getCurrentTier()
  });

  // Handle action requests via WebSocket
  socket.on('request-action', async (data) => {
    try {
      const { action_type, resource, parameters, metadata, actor_id } = data;
      const action = await agencyManager.requestAction(
        action_type,
        resource,
        parameters,
        metadata || {},
        actor_id
      );
      
      socket.emit('action-result', {
        success: true,
        action,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('WebSocket action request error:', error);
      socket.emit('error', {
        message: 'Failed to request action',
        error: error.message
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Listen for agency manager events
agencyManager.on('actionCompleted', (action) => {
  io.emit('action-completed', {
    action,
    timestamp: Date.now()
  });
});

agencyManager.on('actionFailed', (action) => {
  io.emit('action-failed', {
    action,
    timestamp: Date.now()
  });
});

agencyManager.on('tierChanged', ({ newTier, trust }) => {
  io.emit('tier-changed', {
    new_tier: newTier,
    trust_score: trust,
    timestamp: Date.now()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Agency Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Initial trust: ${agencyManager.getCurrentTrust()}, Tier: ${agencyManager.getCurrentTier().name}`);
});

export default app;
