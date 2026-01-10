// Integrated Command Center Type Definitions

export interface NeuralAnalytics {
  cognitive_retention: number;
  decision_latency: number;
  focus_endurance: number;
  error_rate: number;
  neural_efficiency: number;
  learning_velocity: number;
  cognitive_load: number;
  memory_utilization: number;
  processing_speed: number;
}

export interface SystemFeed {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warn' | 'error';
}

export interface SkillData {
  id: string;
  name: string;
  description: string;
  level: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  message?: string;
}
