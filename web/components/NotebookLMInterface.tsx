import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface NotebookDocument {
  id: string;
  title: string;
  content_type: string;
  source: string;
  key_concepts: string[];
  summary: string;
  questions: string[];
  created_at: string;
}

interface NotebookLMNotebook {
  id: string;
  name: string;
  description: string;
  notebook_type: string;
  documents_count: number;
  notes_count: number;
  key_concepts: string[];
  summary: string;
  created_at: string;
}

interface NotebookQuestion {
  id: string;
  notebook_id: string;
  question: string;
  answer: string;
  confidence: number;
  created_at: string;
}

export function NotebookLMInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createNotebookLMStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'notebooks' | 'documents' | 'questions'>('notebooks');
  const [notebooks, setNotebooks] = useState<NotebookLMNotebook[]>([]);
  const [documents, setDocuments] = useState<NotebookDocument[]>([]);
  const [questions, setQuestions] = useState<NotebookQuestion[]>([]);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateNotebook = async () => {
    setIsCreatingNotebook(true);
    try {
      // Simulate notebook creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNotebook: NotebookLMNotebook = {
        id: `notebook_${Date.now()}`,
        name: 'AI Research Notebook',
        description: 'Automatically organized research notebook with AI insights',
        notebook_type: 'research',
        documents_count: 0,
        notes_count: 0,
        key_concepts: [],
        summary: '',
        created_at: new Date().toISOString()
      };
      
      setNotebooks([newNotebook, ...notebooks]);
    } catch (error) {
      console.error('Notebook creation failed:', error);
    } finally {
      setIsCreatingNotebook(false);
    }
  };

  const handleAddDocument = async (notebookId: string) => {
    setIsAddingDocument(true);
    try {
      // Simulate document addition and analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newDocument: NotebookDocument = {
        id: `doc_${Date.now()}`,
        title: 'AI-Analyzed Document',
        content_type: 'pdf',
        source: 'research_paper.pdf',
        key_concepts: ['machine learning', 'neural networks', 'optimization'],
        summary: 'This paper explores advanced machine learning techniques for neural network optimization.',
        questions: [
          'What optimization methods are discussed?',
          'How do these methods compare to traditional approaches?',
          'What are the practical applications?'
        ],
        created_at: new Date().toISOString()
      };
      
      setDocuments([newDocument, ...documents]);
      
      // Update notebook document count
      setNotebooks(notebooks.map(nb => 
        nb.id === notebookId 
          ? { ...nb, documents_count: nb.documents_count + 1 }
          : nb
      ));
    } catch (error) {
      console.error('Document addition failed:', error);
    } finally {
      setIsAddingDocument(false);
    }
  };

  const handleAskQuestion = async (notebookId: string) => {
    setIsAskingQuestion(true);
    try {
      // Simulate question answering
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newQuestion: NotebookQuestion = {
        id: `question_${Date.now()}`,
        notebook_id: notebookId,
        question: 'What are the key findings in this research?',
        answer: 'The key findings include improved optimization algorithms, better convergence rates, and practical applications in real-world scenarios.',
        confidence: 0.92,
        created_at: new Date().toISOString()
      };
      
      setQuestions([newQuestion, ...questions]);
    } catch (error) {
      console.error('Question answering failed:', error);
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const renderTabButton = (tab: 'notebooks' | 'documents' | 'questions', title: string) => (
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

  const renderNotebooksTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateNotebook}
        disabled={isCreatingNotebook}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingNotebook ? 'Creating...' : 'Create Notebook'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Notebooks</Text>
        {notebooks.map((notebook, index) => (
          <View key={notebook.id} style={styles.notebookCard}>
            <Text style={styles.notebookName}>{notebook.name}</Text>
            <Text style={styles.notebookDescription}>{notebook.description}</Text>
            <Text style={styles.notebookType}>{notebook.notebook_type}</Text>
            
            <View style={styles.notebookStats}>
              <Text style={styles.notebookStat}>
                {notebook.documents_count} documents
              </Text>
              <Text style={styles.notebookStat}>
                {notebook.notes_count} notes
              </Text>
            </View>
            
            <View style={styles.notebookActions}>
              <TouchableOpacity
                style={styles.notebookActionButton}
                onPress={() => handleAddDocument(notebook.id)}
                disabled={isAddingDocument}
              >
                <Text style={styles.notebookActionText}>
                  {isAddingDocument ? 'Adding...' : 'Add Document'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.notebookActionButton}
                onPress={() => handleAskQuestion(notebook.id)}
                disabled={isAskingQuestion}
              >
                <Text style={styles.notebookActionText}>
                  {isAskingQuestion ? 'Asking...' : 'Ask Question'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDocumentsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analyzed Documents</Text>
        <Text style={styles.documentsDescription}>
          AI-powered document analysis with key concepts and insights.
        </Text>
        
        {documents.map((doc, index) => (
          <View key={doc.id} style={styles.documentCard}>
            <Text style={styles.documentTitle}>{doc.title}</Text>
            <Text style={styles.documentType}>{doc.content_type}</Text>
            <Text style={styles.documentSource}>Source: {doc.source}</Text>
            
            <View style={styles.documentSection}>
              <Text style={styles.sectionSubtitle}>Summary</Text>
              <Text style={styles.documentSummary}>{doc.summary}</Text>
            </View>
            
            <View style={styles.documentSection}>
              <Text style={styles.sectionSubtitle}>Key Concepts</Text>
              <View style={styles.conceptsContainer}>
                {doc.key_concepts.map((concept, idx) => (
                  <Text key={idx} style={styles.concept}>{concept}</Text>
                ))}
              </View>
            </View>
            
            <View style={styles.documentSection}>
              <Text style={styles.sectionSubtitle}>Generated Questions</Text>
              {doc.questions.map((question, idx) => (
                <Text key={idx} style={styles.documentQuestion}>• {question}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderQuestionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Q&A History</Text>
        <Text style={styles.questionsDescription}>
          Questions asked and answers generated from your notebook content.
        </Text>
        
        {questions.map((qa, index) => (
          <View key={qa.id} style={styles.qaCard}>
            <Text style={styles.qaQuestion}>{qa.question}</Text>
            <Text style={styles.qaAnswer}>{qa.answer}</Text>
            <Text style={styles.qaConfidence}>
              Confidence: {Math.round(qa.confidence * 100)}%
            </Text>
            <Text style={styles.qaDate}>
              {new Date(qa.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>NotebookLM</Text>
        <Text style={styles.subtitle}>AI-powered notebook and document analysis</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('notebooks', 'Notebooks')}
        {renderTabButton('documents', 'Documents')}
        {renderTabButton('questions', 'Questions')}
      </View>

      {activeTab === 'notebooks' && renderNotebooksTab()}
      {activeTab === 'documents' && renderDocumentsTab()}
      {activeTab === 'questions' && renderQuestionsTab()}
    </Animated.View>
  );
}

const createNotebookLMStyles = (theme: any, emotionalState: string) => StyleSheet.create({
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
  notebookCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notebookName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  notebookDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  notebookType: {
    fontSize: 14,
    color: theme.primary,
    marginBottom: 12,
  },
  notebookStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  notebookStat: {
    backgroundColor: theme.background,
    color: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 12,
  },
  notebookActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notebookActionButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  notebookActionText: {
    color: theme.onSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  documentsDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  documentSource: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  documentSection: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  documentSummary: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  conceptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  concept: {
    backgroundColor: theme.background,
    color: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  documentQuestion: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  questionsDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  qaCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  qaQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  qaAnswer: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  qaConfidence: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  qaDate: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});
