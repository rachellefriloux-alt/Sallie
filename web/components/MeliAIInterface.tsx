import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface ContentWorkflow {
  id: string;
  name: string;
  content_type: string;
  current_step: number;
  total_steps: number;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

interface GeneratedContent {
  id: string;
  workflow_id: string;
  title: string;
  content_type: string;
  content: string;
  performance_metrics: any;
  validation_results: any;
  created_at: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  content_type: string;
  structure: any;
  guidelines: string[];
  created_at: string;
}

export function MeliAIInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createMeliStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'workflows' | 'content' | 'templates'>('workflows');
  const [workflows, setWorkflows] = useState<ContentWorkflow[]>([]);
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
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
      
      const newWorkflow: ContentWorkflow = {
        id: `workflow_${Date.now()}`,
        name: 'AI Content Creation Workflow',
        content_type: 'blog_post',
        current_step: 0,
        total_steps: 6,
        status: 'created',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setWorkflows([newWorkflow, ...workflows]);
    } catch (error) {
      console.error('Workflow creation failed:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setWorkflows(workflows.map(wf => 
        wf.id === workflowId 
          ? { 
              ...wf, 
              current_step: wf.current_step + 1,
              progress: Math.min(100, ((wf.current_step + 1) / wf.total_steps) * 100),
              status: wf.current_step + 1 >= wf.total_steps ? 'completed' : 'in_progress',
              updated_at: new Date().toISOString()
            }
          : wf
      ));
      
      // Generate content when workflow completes
      const workflow = workflows.find(wf => wf.id === workflowId);
      if (workflow && workflow.current_step + 1 >= workflow.total_steps) {
        await handleGenerateContent(workflowId);
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }
  };

  const handleGenerateContent = async (workflowId: string) => {
    setIsGeneratingContent(true);
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newContent: GeneratedContent = {
        id: `content_${Date.now()}`,
        workflow_id: workflowId,
        title: 'AI-Generated Content',
        content_type: 'blog_post',
        content: 'This is AI-generated content created through a step-by-step workflow process. The content has been optimized for engagement and follows best practices for the chosen format.',
        performance_metrics: {
          readability_score: 0.85,
          engagement_score: 0.92,
          seo_score: 0.88,
          brand_voice_score: 0.95
        },
        validation_results: {
          fact_check_passed: true,
          brand_guidelines_compliant: true,
          content_quality_score: 0.9
        },
        created_at: new Date().toISOString()
      };
      
      setContent([newContent, ...content]);
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const renderTabButton = (tab: 'workflows' | 'content' | 'templates', title: string) => (
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
        <Text style={styles.sectionTitle}>Content Workflows</Text>
        {workflows.map((workflow, index) => (
          <View key={workflow.id} style={styles.workflowCard}>
            <Text style={styles.workflowName}>{workflow.name}</Text>
            <Text style={styles.workflowType}>{workflow.content_type}</Text>
            <Text style={styles.workflowStatus}>{workflow.status}</Text>
            
            <View style={styles.workflowProgress}>
              <Text style={styles.progressText}>
                Step {workflow.current_step} of {workflow.total_steps}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(workflow.progress)}%
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${workflow.progress}%` }
                ]}
              />
            </View>
            
            <TouchableOpacity
              style={styles.executeButton}
              onPress={() => handleExecuteWorkflow(workflow.id)}
              disabled={workflow.status === 'completed'}
            >
              <Text style={styles.executeButtonText}>
                {workflow.status === 'completed' ? 'Completed' : 'Execute Step'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContentTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generated Content</Text>
        <Text style={styles.contentDescription}>
          AI-generated content through step-by-step workflows with brand voice consistency.
        </Text>
        
        {content.map((item, index) => (
          <View key={item.id} style={styles.contentCard}>
            <Text style={styles.contentTitle}>{item.title}</Text>
            <Text style={styles.contentType}>{item.content_type}</Text>
            
            <View style={styles.contentSection}>
              <Text style={styles.sectionSubtitle}>Content Preview</Text>
              <Text style={styles.contentPreview}>{item.content}</Text>
            </View>
            
            <View style={styles.contentSection}>
              <Text style={styles.sectionSubtitle}>Performance Metrics</Text>
              {Object.entries(item.performance_metrics).map(([key, value]) => (
                <Text key={key} style={styles.metric}>
                  {key}: {Math.round((value as number) * 100)}%
                </Text>
              ))}
            </View>
            
            <View style={styles.contentSection}>
              <Text style={styles.sectionSubtitle}>Validation Results</Text>
              {Object.entries(item.validation_results).map(([key, value]) => (
                <Text key={key} style={styles.validation}>
                  {key}: {value ? '✓' : '✗'}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTemplatesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Templates</Text>
        <Text style={styles.templatesDescription}>
          Pre-built templates for different content types with structured workflows.
        </Text>
        
        {['Blog Post', 'Social Media', 'Email', 'Article', 'Product Description'].map((type) => (
          <TouchableOpacity key={type} style={styles.templateCard}>
            <Text style={styles.templateTitle}>{type}</Text>
            <Text style={styles.templateDescription}>
              Step-by-step workflow for creating {type.toLowerCase()} content
            </Text>
            <View style={styles.templateFeatures}>
              <Text style={styles.templateFeature}>• Research & Planning</Text>
              <Text style={styles.templateFeature}>• Outline Generation</Text>
              <Text style={styles.templateFeature}>• Content Creation</Text>
              <Text style={styles.templateFeature}>• Brand Voice Application</Text>
              <Text style={styles.templateFeature}>• SEO Optimization</Text>
              <Text style={styles.templateFeature}>• Validation & Review</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Meli AI</Text>
        <Text style={styles.subtitle}>Step-by-step content creation workflows</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('workflows', 'Workflows')}
        {renderTabButton('content', 'Content')}
        {renderTabButton('templates', 'Templates')}
      </View>

      {activeTab === 'workflows' && renderWorkflowsTab()}
      {activeTab === 'content' && renderContentTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
    </Animated.View>
  );
}

const createMeliStyles = (theme: any, emotionalState: string) => StyleSheet.create({
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
  workflowType: {
    fontSize: 14,
    color: theme.primary,
    marginBottom: 4,
  },
  workflowStatus: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  workflowProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.background,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
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
  contentDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  contentType: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  contentSection: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  contentPreview: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  metric: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  validation: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  templatesDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  templateFeatures: {
    marginBottom: 8,
  },
  templateFeature: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
});
