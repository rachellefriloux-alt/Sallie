import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface ZapierWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  action_count: number;
  status: string;
  last_run: string | null;
  created_at: string;
}

interface ZapierTrigger {
  id: string;
  workflow_id: string;
  trigger_type: string;
  app_name: string;
  conditions: string[];
  is_active: boolean;
  created_at: string;
}

interface ZapierAction {
  id: string;
  workflow_id: string;
  action_type: string;
  app_name: string;
  parameters: any;
  execution_count: number;
  success_rate: number;
  created_at: string;
}

interface ZapierExecution {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  duration: number | null;
}

export function ZapierAIInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createZapierStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'workflows' | 'triggers' | 'executions'>('workflows');
  const [workflows, setWorkflows] = useState<ZapierWorkflow[]>([]);
  const [triggers, setTriggers] = useState<ZapierTrigger[]>([]);
  const [actions, setActions] = useState<ZapierAction[]>([]);
  const [executions, setExecutions] = useState<ZapierExecution[]>([]);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateWorkflow = async () => {
    setIsCreatingWorkflow(true);
    try {
      // Simulate workflow creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newWorkflow: ZapierWorkflow = {
        id: `workflow_${Date.now()}`,
        name: 'AI Automation Workflow',
        description: 'Automatically created workflow with AI optimization',
        trigger_type: 'webhook',
        action_count: 3,
        status: 'active',
        last_run: null,
        created_at: new Date().toISOString()
      };
      
      setWorkflows([newWorkflow, ...workflows]);
      
      // Create associated trigger and actions
      const newTrigger: ZapierTrigger = {
        id: `trigger_${Date.now()}`,
        workflow_id: newWorkflow.id,
        trigger_type: 'webhook',
        app_name: 'Webhooks',
        conditions: ['data_received', 'valid_format'],
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      const newActions: ZapierAction[] = [
        {
          id: `action_1_${Date.now()}`,
          workflow_id: newWorkflow.id,
          action_type: 'create_task',
          app_name: 'ClickUp',
          parameters: { task_name: 'AI Generated Task', priority: 'high' },
          execution_count: 0,
          success_rate: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `action_2_${Date.now()}`,
          workflow_id: newWorkflow.id,
          action_type: 'send_email',
          app_name: 'Gmail',
          parameters: { subject: 'Workflow Notification', body: 'Task created successfully' },
          execution_count: 0,
          success_rate: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `action_3_${Date.now()}`,
          workflow_id: newWorkflow.id,
          action_type: 'update_sheet',
          app_name: 'Google Sheets',
          parameters: { sheet_name: 'Automation Log', range: 'A1', value: 'Workflow executed' },
          execution_count: 0,
          success_rate: 0,
          created_at: new Date().toISOString()
        }
      ];
      
      setTriggers([newTrigger, ...triggers]);
      setActions([...newActions, ...actions]);
    } catch (error) {
      console.error('Workflow creation failed:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    setIsExecutingWorkflow(true);
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newExecution: ZapierExecution = {
        id: `execution_${Date.now()}`,
        workflow_id: workflowId,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date(Date.now() + 2000).toISOString(),
        error_message: null,
        duration: 2000
      };
      
      setExecutions([newExecution, ...executions]);
      
      // Update workflow last run
      setWorkflows(workflows.map(wf => 
        wf.id === workflowId 
          ? { ...wf, last_run: new Date().toISOString() }
          : wf
      ));
      
      // Update action execution counts
      setActions(actions.map(action => 
        action.workflow_id === workflowId 
          ? { 
              ...action, 
              execution_count: action.execution_count + 1,
              success_rate: 0.95 + Math.random() * 0.05
            }
          : action
      ));
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecutingWorkflow(false);
    }
  };

  const renderTabButton = (tab: 'workflows' | 'triggers' | 'executions', title: string) => (
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

  const renderWorkflowsTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateWorkflow}
        disabled={isCreatingWorkflow}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingWorkflow ? 'Creating...' : 'Create Workflow'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Workflows</Text>
        {workflows.map((workflow, index) => (
          <View key={workflow.id} style={styles.workflowCard}>
            <Text style={styles.workflowName}>{workflow.name}</Text>
            <Text style={styles.workflowDescription}>{workflow.description}</Text>
            <Text style={styles.workflowTrigger}>Trigger: {workflow.trigger_type}</Text>
            <Text style={styles.workflowActions}>{workflow.action_count} actions</Text>
            <Text style={styles.workflowStatus}>{workflow.status}</Text>
            
            {workflow.last_run && (
              <Text style={styles.workflowLastRun}>
                Last run: {new Date(workflow.last_run).toLocaleString()}
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.executeButton}
              onPress={() => handleExecuteWorkflow(workflow.id)}
              disabled={isExecutingWorkflow}
            >
              <Text style={styles.executeButtonText}>
                {isExecutingWorkflow ? 'Executing...' : 'Execute Workflow'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTriggersTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workflow Triggers</Text>
        <Text style={styles.triggersDescription}>
          AI-optimized triggers that start your automation workflows.
        </Text>
        
        {triggers.map((trigger, index) => (
          <View key={trigger.id} style={styles.triggerCard}>
            <Text style={styles.triggerType}>{trigger.trigger_type}</Text>
            <Text style={styles.triggerApp}>{trigger.app_name}</Text>
            <Text style={styles.triggerStatus}>
              {trigger.is_active ? 'Active' : 'Inactive'}
            </Text>
            
            <View style={styles.triggerConditions}>
              <Text style={styles.sectionSubtitle}>Conditions</Text>
              {trigger.conditions.map((condition, idx) => (
                <Text key={idx} style={styles.condition}>• {condition}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderExecutionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Execution History</Text>
        <Text style={styles.executionsDescription}>
          Recent workflow executions with performance metrics.
        </Text>
        
        {executions.map((execution, index) => (
          <View key={execution.id} style={styles.executionCard}>
            <Text style={styles.executionStatus}>{execution.status}</Text>
            <Text style={styles.executionStarted}>
              Started: {new Date(execution.started_at).toLocaleString()}
            </Text>
            {execution.completed_at && (
              <Text style={styles.executionCompleted}>
                Completed: {new Date(execution.completed_at).toLocaleString()}
              </Text>
            )}
            {execution.duration && (
              <Text style={styles.executionDuration}>
                Duration: {execution.duration}ms
              </Text>
            )}
            {execution.error_message && (
              <Text style={styles.executionError}>
                Error: {execution.error_message}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Zapier AI</Text>
        <Text style={styles.subtitle}>AI-powered workflow automation</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('workflows', 'Workflows')}
        {renderTabButton('triggers', 'Triggers')}
        {renderTabButton('executions', 'Executions')}
      </View>

      {activeTab === 'workflows' && renderWorkflowsTab()}
      {activeTab === 'triggers' && renderTriggersTab()}
      {activeTab === 'executions' && renderExecutionsTab()}
    </Animated.View>
  );
}

const createZapierStyles = (theme: any, emotionalState: string) => StyleSheet.create({
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
  workflowCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  workflowName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  workflowTrigger: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  workflowActions: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  workflowStatus: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  workflowLastRun: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  executeButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonText: {
    color: theme.onSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  triggersDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  triggerCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  triggerType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  triggerApp: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  triggerStatus: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  triggerConditions: {
    marginBottom: 8,
  },
  condition: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  executionsDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  executionCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  executionStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  executionStarted: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  executionCompleted: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  executionDuration: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  executionError: {
    fontSize: 14,
    color: theme.error,
    marginBottom: 4,
  },
});
