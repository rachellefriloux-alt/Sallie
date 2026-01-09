export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  platform?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface UserMetrics {
  userId: string;
  totalEvents: number;
  sessionDuration: number;
  lastActiveAt: Date;
  firstSeenAt: Date;
  properties: Record<string, any>;
  customMetrics: Record<string, number>;
}

export interface SessionMetrics {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  eventsCount: number;
  pageViews: number;
  bounceRate: number;
  conversionEvents: string[];
  properties: Record<string, any>;
}

export interface FunnelStage {
  stageId: string;
  funnelId: string;
  name: string;
  description: string;
  order: number;
  conditions: Record<string, any>;
  conversionRate: number;
  averageTime: number;
  dropOffRate: number;
}

export interface Funnel {
  id: string;
  name: string;
  description: string;
  stages: FunnelStage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CohortAnalysis {
  cohortId: string;
  name: string;
  description: string;
  timeRange: string;
  metrics: {
    retention: number[];
    churn: number[];
    ltv: number[];
    engagement: number[];
  };
  createdAt: Date;
}

export interface RealTimeMetrics {
  activeUsers: number;
  concurrentSessions: number;
  eventsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  timestamp: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'funnel' | 'heatmap';
  title: string;
  query: AnalyticsQuery;
  visualization: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
}

export interface AnalyticsQuery {
  dimensions: string[];
  metrics: string[];
  filters: Record<string, any>;
  timeRange: {
    start: Date;
    end: Date;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  colors: string[];
  axes: {
    x: { label: string; type: 'time' | 'category' | 'value' };
    y: { label: string; type: 'value' };
  };
  legend?: { show: boolean; position: 'top' | 'bottom' | 'left' | 'right' };
  tooltip?: { show: boolean; format: string };
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: { x: number; y: number };
  containerPadding: { x: number; y: number };
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  query: AnalyticsQuery;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    metric: string;
  };
  isActive: boolean;
  channels: ('email' | 'webhook' | 'slack')[];
  recipients: string[];
  createdAt: Date;
  triggeredAt?: Date;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule: string;
  queries: AnalyticsQuery[];
  format: 'pdf' | 'csv' | 'json';
  recipients: string[];
  isActive: boolean;
  lastGeneratedAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  normalized?: number;
}

export interface ConversionEvent {
  id: string;
  name: string;
  description: string;
  value?: number;
  currency?: string;
  properties: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficAllocation: number;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate?: Date;
  endDate?: Date;
  targetMetric: string;
  significanceLevel: number;
  results?: ABTestResults;
  createdAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficSplit: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidence: number;
  isControl?: boolean;
}

export interface ABTestResults {
  winner?: string;
  significance: number;
  confidence: number;
  uplift?: number;
  revenueImpact?: number;
  statisticalPower: number;
}
