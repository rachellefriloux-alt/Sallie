// Learning Dashboard Type Definitions

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  practice_count: number;
  last_practiced: string;
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  learning_rate: number;
  retention_rate: number;
  difficulty_score: number;
  time_to_mastery: number;
  prerequisites: string[];
  related_skills: string[];
  practice_streak: number;
  best_practice_score: number;
  total_practice_time: number;
  next_practice_recommended: string;
  neural_efficiency: number;
  knowledge_depth: number;
  application_success_rate: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration: number;
  completion_percentage: number;
  skills_required: string[];
  skills_acquired: string[];
  current_module: string;
  total_modules: number;
  progress_milestones: {
    module: string;
    completed: boolean;
    completed_at?: string;
    score?: number;
  }[];
  learning_objectives: string[];
  prerequisites: string[];
  outcomes: string[];
  last_progress_update: string;
  average_session_time: number;
  retention_score: number;
  application_projects: number;
}

export interface LearningSession {
  id: string;
  skill_id: string;
  skill_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  practice_type: 'guided' | 'free' | 'challenge' | 'assessment';
  difficulty: number;
  performance_score: number;
  improvement_score: number;
  mistakes_made: number;
  mistakes_corrected: number;
  insights_gained: string[];
  neural_activity: {
    focus_level: number;
    engagement_level: number;
    cognitive_load: number;
    learning_efficiency: number;
  };
  context: {
    time_of_day: string;
    environment: string;
    session_length: 'short' | 'medium' | 'long';
    preceding_activity: string;
  };
}

export interface LearningMetrics {
  total_skills: number;
  mastered_skills: number;
  in_progress_skills: number;
  total_practice_time: number;
  average_session_duration: number;
  learning_velocity: number;
  retention_rate: number;
  application_success_rate: number;
  neural_efficiency: number;
  knowledge_depth_score: number;
  learning_streak_days: number;
  best_practice_streak: number;
  total_insights_gained: number;
  difficulty_progression: number;
  cross_domain_connections: number;
  adaptive_learning_score: number;
  performance_trend: 'improving' | 'stable' | 'declining';
  optimal_learning_time: string;
  preferred_learning_style: string;
  cognitive_load_capacity: number;
}

export interface LearningDashboardProps {
  className?: string;
  compact?: boolean;
  showAdvancedMetrics?: boolean;
  realTimeUpdates?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

export interface MasteryLevel {
  min: number;
  max: number;
  color: string;
  label: string;
}
