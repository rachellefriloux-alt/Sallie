export interface Memory {
  id: string;
  content: string;
  embedding: number[];
  metadata: MemoryMetadata;
  created_at: number;
  updated_at: number;
  access_count: number;
  last_accessed: number;
  salience: number;
  tags: string[];
  actor_id?: string; // For Kinship multi-user support
}

export interface MemoryMetadata {
  type: MemoryType;
  source: MemorySource;
  context?: string;
  emotional_weight?: number;
  importance?: number;
  freshness?: number;
  creator_id?: string;
  session_id?: string;
  interaction_id?: string;
  heritage_relevance?: number;
  hypothesis_id?: string;
  dream_cycle_id?: string;
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  OBSERVATION = 'observation',
  LEARNING = 'learning',
  HERITAGE = 'heritage',
  HYPOTHESIS = 'hypothesis',
  DECISION = 'decision',
  REFLECTION = 'reflection',
  INSIGHT = 'insight',
  PATTERN = 'pattern',
  GOAL = 'goal',
  EVENT = 'event',
  FACT = 'fact',
  QUESTION = 'question',
  ANSWER = 'answer'
}

export enum MemorySource {
  USER_INPUT = 'user_input',
  AI_RESPONSE = 'ai_response',
  SYSTEM_GENERATED = 'system_generated',
  SENSOR_ARRAY = 'sensor_array',
  DREAM_CYCLE = 'dream_cycle',
  CONVERGENCE = 'convergence',
  HERITAGE_IMPORT = 'heritage_import',
  EXTERNAL_IMPORT = 'external_import'
}

export interface MemorySearchRequest {
  query: string;
  query_embedding?: number[];
  limit?: number;
  threshold?: number;
  filters?: MemoryFilter;
  include_metadata?: boolean;
  actor_id?: string;
}

export interface MemoryFilter {
  type?: MemoryType[];
  source?: MemorySource[];
  tags?: string[];
  date_range?: {
    start: number;
    end: number;
  };
  salience_min?: number;
  importance_min?: number;
  creator_id?: string;
  actor_id?: string;
}

export interface MemorySearchResult {
  memories: Memory[];
  total_count: number;
  search_time_ms: number;
  query_used: string;
  filters_applied: MemoryFilter;
}

export interface MemoryCreateRequest {
  content: string;
  metadata: MemoryMetadata;
  tags?: string[];
  actor_id?: string;
  generate_embedding?: boolean;
}

export interface MemoryUpdateRequest {
  id: string;
  content?: string;
  metadata?: Partial<MemoryMetadata>;
  tags?: string[];
  regenerate_embedding?: boolean;
}

export interface MemoryDeleteRequest {
  id: string;
  actor_id?: string;
  permanent?: boolean;
}

export interface MemoryBatch {
  memories: Memory[];
  batch_id: string;
  created_at: number;
  processed_at?: number;
  status: BatchStatus;
  error?: string;
}

export enum BatchStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface MemoryStats {
  total_memories: number;
  memories_by_type: Record<MemoryType, number>;
  memories_by_source: Record<MemorySource, number>;
  average_salience: number;
  most_recent_memory: number;
  oldest_memory: number;
  access_frequency: number;
  storage_size_mb: number;
  actor_stats?: Record<string, {
    memory_count: number;
    last_access: number;
  }>;
}

export interface MemoryConfig {
  embedding_model: string;
  embedding_dimension: number;
  max_batch_size: number;
  search_limit_default: number;
  search_threshold_default: number;
  salience_decay_rate: number;
  freshness_weight: number;
  diversity_weight: number;
  mrr_lambda: number; // Maximal Marginal Relevance lambda
  auto_cleanup_days: number;
  compression_enabled: boolean;
  cache_size_mb: number;
  retention_policy: RetentionPolicy;
}

export interface RetentionPolicy {
  max_age_days: number;
  max_memories_per_actor: number;
  importance_threshold: number;
  salience_threshold: number;
  preserve_heritage: boolean;
  preserve_high_importance: boolean;
  preserve_recent: number; // days
}

export interface MemoryExport {
  memories: Memory[];
  export_format: 'json' | 'csv' | 'txt';
  filters?: MemoryFilter;
  include_embeddings: boolean;
  export_timestamp: number;
  file_size_bytes: number;
}

export interface MemoryImport {
  memories: Memory[];
  import_format: 'json' | 'csv' | 'txt';
  source_file: string;
  import_timestamp: number;
  conflicts: ImportConflict[];
  imported_count: number;
  skipped_count: number;
}

export interface ImportConflict {
  memory_id: string;
  conflict_type: 'duplicate' | 'invalid_format' | 'missing_data';
  resolution: 'skip' | 'merge' | 'replace';
  description: string;
}

export interface MemoryConsolidation {
  consolidation_id: string;
  patterns_found: Pattern[];
  hypotheses_generated: Hypothesis[];
  memories_merged: string[];
  consolidation_timestamp: number;
  confidence_score: number;
}

export interface Pattern {
  id: string;
  description: string;
  evidence: string[];
  confidence: number;
  category: 'behavior' | 'preference' | 'trigger' | 'value';
  frequency: number;
  last_observed: number;
}

export interface Hypothesis {
  id: string;
  pattern: string;
  evidence: Array<{
    timestamp: number;
    observation: string;
  }>;
  confidence: number;
  category: 'behavior' | 'preference' | 'trigger' | 'value';
  status: 'pending_veto' | 'testing' | 'near_heritage' | 'rejected';
  conditional?: {
    base_belief: string;
    exception: string;
    synthesized_from: string[];
  };
}
