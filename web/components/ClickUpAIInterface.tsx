import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  assignees: string[];
  due_date: string | null;
  estimated_time: number;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  members: string[];
  tasks: string[];
  created_at: string;
}

interface ProjectInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  confidence: number;
  recommendations: string[];
  created_at: string;
}

export function ClickUpAIInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createClickUpStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'insights'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [insights, setInsights] = useState<ProjectInsight[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateSmartTask = async () => {
    setIsCreatingTask(true);
    try {
      // Simulate smart task creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTask: Task = {
        id: `task_${Date.now()}`,
        name: 'AI-Generated Task',
        description: 'Automatically created task with AI optimization',
        status: 'todo',
        priority: 'high',
        assignees: ['user'],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_time: 8.0,
        created_at: new Date().toISOString()
      };
      
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Smart task creation failed:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCreateProjectPlan = async () => {
    setIsCreatingProject(true);
    try {
      // Simulate project plan creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newProject: Project = {
        id: `project_${Date.now()}`,
        name: 'AI-Optimized Project',
        description: 'Project plan with AI-powered optimization',
        status: 'planning',
        members: ['user'],
        tasks: [],
        created_at: new Date().toISOString()
      };
      
      setProjects([newProject, ...projects]);
    } catch (error) {
      console.error('Project plan creation failed:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleGenerateInsights = async (projectId: string) => {
    try {
      // Simulate insight generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newInsight: ProjectInsight = {
        id: `insight_${Date.now()}`,
        type: 'productivity',
        title: 'Productivity Analysis',
        description: 'Team productivity analysis and recommendations',
        data: {
          total_tasks: 25,
          completed_tasks: 15,
          productivity_score: 0.8,
          team_utilization: 0.75
        },
        confidence: 0.9,
        recommendations: [
          'Focus on high-priority tasks',
          'Consider adding more resources',
          'Optimize task assignment'
        ],
        created_at: new Date().toISOString()
      };
      
      setInsights([newInsight, ...insights]);
    } catch (error) {
      console.error('Insight generation failed:', error);
    }
  };

  const renderTabButton = (tab: 'tasks' | 'projects' | 'insights', title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTasksTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateSmartTask}
        disabled={isCreatingTask}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingTask ? 'Creating...' : 'Create Smart Task'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Smart Tasks</Text>
        {tasks.map((task, index) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
            <View style={styles.taskMeta}>
              <Text style={styles.taskStatus}>{task.status}</Text>
              <Text style={styles.taskPriority}>{task.priority}</Text>
            </View>
            <Text style={styles.taskTime}>
              Est. {task.estimated_time}h
            </Text>
            {task.due_date && (
              <Text style={styles.taskDueDate}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderProjectsTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateProjectPlan}
        disabled={isCreatingProject}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingProject ? 'Creating...' : 'Create Project Plan'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Projects</Text>
        {projects.map((project, index) => (
          <View key={project.id} style={styles.projectCard}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <View style={styles.projectMeta}>
              <Text style={styles.projectStatus}>{project.status}</Text>
              <Text style={styles.projectMembers}>
                {project.members.length} members
              </Text>
            </View>
            <Text style={styles.projectTasks}>
              {project.tasks.length} tasks
            </Text>
            <TouchableOpacity
              style={styles.insightButton}
              onPress={() => handleGenerateInsights(project.id)}
            >
              <Text style={styles.insightButtonText}>Generate Insights</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Text style={styles.insightDescription}>
          AI-powered project insights and recommendations for optimal productivity.
        </Text>
        
        {insights.map((insight, index) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            <Text style={styles.insightConfidence}>
              Confidence: {Math.round(insight.confidence * 100)}%
            </Text>
            
            <View style={styles.insightData}>
              {Object.entries(insight.data).map(([key, value]) => (
                <Text key={key} style={styles.insightDataItem}>
                  {key}: {value}
                </Text>
              ))}
            </View>
            
            <View style={styles.insightRecommendations}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {insight.recommendations.map((rec, idx) => (
                <Text key={idx} style={styles.recommendationItem}>
                  • {rec}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>ClickUp AI</Text>
        <Text style={styles.subtitle}>AI-powered project management</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('tasks', 'Tasks')}
        {renderTabButton('projects', 'Projects')}
        {renderTabButton('insights', 'Insights')}
      </View>

      {activeTab === 'tasks' && renderTasksTab()}
      {activeTab === 'projects' && renderProjectsTab()}
      {activeTab === 'insights' && renderInsightsTab()}
    </Animated.View>
  );
}

const createClickUpStyles = (theme: any, emotionalState: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: theme.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: theme.onPrimary,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  actionButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: theme.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskStatus: {
    fontSize: 12,
    color: theme.textSecondary,
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  taskPriority: {
    fontSize: 12,
    color: theme.textSecondary,
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  taskTime: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  projectCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectStatus: {
    fontSize: 12,
    color: theme.textSecondary,
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  projectMembers: {
    fontSize: 12,
    color: theme.textSecondary,
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  projectTasks: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  insightButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  insightButtonText: {
    color: theme.onSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  insightDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  insightConfidence: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  insightData: {
    marginBottom: 12,
  },
  insightDataItem: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  insightRecommendations: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
});
