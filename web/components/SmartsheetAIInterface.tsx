import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface Smartsheet {
  id: string;
  name: string;
  description: string;
  sheet_type: string;
  rows: number;
  columns: number;
  cells_count: number;
  charts_count: number;
  formulas_count: number;
  created_at: string;
  updated_at: string;
}

interface SmartsheetAnalysis {
  id: string;
  sheet_id: string;
  analysis_type: string;
  insights: string[];
  statistics: any;
  recommendations: string[];
  charts: string[];
  created_at: string;
}

interface SmartsheetChart {
  id: string;
  title: string;
  chart_type: string;
  data_range: string;
  created_at: string;
}

export function SmartsheetAIInterface({ navigation }: any) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createSmartsheetStyles(theme, emotionalState);
  const [activeTab, setActiveTab] = useState<'sheets' | 'analysis' | 'charts'>('sheets');
  const [sheets, setSheets] = useState<Smartsheet[]>([]);
  const [analyses, setAnalyses] = useState<SmartsheetAnalysis[]>([]);
  const [charts, setCharts] = useState<SmartsheetChart[]>([]);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateSmartSheet = async () => {
    setIsCreatingSheet(true);
    try {
      // Simulate smart sheet creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSheet: Smartsheet = {
        id: `sheet_${Date.now()}`,
        name: 'AI-Generated Sheet',
        description: 'Automatically created spreadsheet with AI optimization',
        sheet_type: 'dashboard',
        rows: 100,
        columns: 26,
        cells_count: 2600,
        charts_count: 3,
        formulas_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSheets([newSheet, ...sheets]);
    } catch (error) {
      console.error('Smart sheet creation failed:', error);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleAnalyzeSheet = async (sheetId: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate sheet analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const newAnalysis: SmartsheetAnalysis = {
        id: `analysis_${Date.now()}`,
        sheet_id: sheetId,
        analysis_type: 'comprehensive',
        insights: [
          'Data shows strong upward trend in Q3',
          'Customer satisfaction improved by 23%',
          'Revenue growth exceeds projections'
        ],
        statistics: {
          total_rows: 100,
          total_columns: 26,
          numeric_columns: 15,
          text_columns: 11,
          data_quality_score: 0.92,
          completeness_score: 0.88
        },
        recommendations: [
          'Focus on high-performing segments',
          'Consider expanding to new markets',
          'Optimize resource allocation'
        ],
        charts: ['trend_chart', 'comparison_chart', 'distribution_chart'],
        created_at: new Date().toISOString()
      };
      
      setAnalyses([newAnalysis, ...analyses]);
    } catch (error) {
      console.error('Sheet analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateChart = async (sheetId: string) => {
    try {
      // Simulate chart generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newChart: SmartsheetChart = {
        id: `chart_${Date.now()}`,
        title: 'AI-Generated Chart',
        chart_type: 'line',
        data_range: 'A1:C20',
        created_at: new Date().toISOString()
      };
      
      setCharts([newChart, ...charts]);
    } catch (error) {
      console.error('Chart generation failed:', error);
    }
  };

  const renderTabButton = (tab: 'sheets' | 'analysis' | 'charts', title: string) => (
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

  const renderSheetsTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCreateSmartSheet}
        disabled={isCreatingSheet}
      >
        <Text style={styles.actionButtonText}>
          {isCreatingSheet ? 'Creating...' : 'Create Smart Sheet'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Spreadsheets</Text>
        {sheets.map((sheet, index) => (
          <View key={sheet.id} style={styles.sheetCard}>
            <Text style={styles.sheetName}>{sheet.name}</Text>
            <Text style={styles.sheetDescription}>{sheet.description}</Text>
            <Text style={styles.sheetType}>{sheet.sheet_type}</Text>
            
            <View style={styles.sheetStats}>
              <Text style={styles.sheetStat}>
                {sheet.rows} × {sheet.columns}
              </Text>
              <Text style={styles.sheetStat}>
                {sheet.cells_count} cells
              </Text>
              <Text style={styles.sheetStat}>
                {sheet.charts_count} charts
              </Text>
              <Text style={styles.sheetStat}>
                {sheet.formulas_count} formulas
              </Text>
            </View>
            
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetActionButton}
                onPress={() => handleAnalyzeSheet(sheet.id)}
                disabled={isAnalyzing}
              >
                <Text style={styles.sheetActionText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sheetActionButton}
                onPress={() => handleGenerateChart(sheet.id)}
              >
                <Text style={styles.sheetActionText}>Generate Chart</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalysisTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Analysis</Text>
        <Text style={styles.analysisDescription}>
          AI-powered insights and recommendations for your spreadsheets.
        </Text>
        
        {analyses.map((analysis, index) => (
          <View key={analysis.id} style={styles.analysisCard}>
            <Text style={styles.analysisType}>{analysis.analysis_type}</Text>
            <Text style={styles.analysisDate}>
              {new Date(analysis.created_at).toLocaleDateString()}
            </Text>
            
            <View style={styles.analysisSection}>
              <Text style={styles.sectionSubtitle}>Key Insights</Text>
              {analysis.insights.map((insight, idx) => (
                <Text key={idx} style={styles.insight}>• {insight}</Text>
              ))}
            </View>
            
            <View style={styles.analysisSection}>
              <Text style={styles.sectionSubtitle}>Statistics</Text>
              {Object.entries(analysis.statistics).map(([key, value]) => (
                <Text key={key} style={styles.stat}>
                  {key}: {value}
                </Text>
              ))}
            </View>
            
            <View style={styles.analysisSection}>
              <Text style={styles.sectionSubtitle}>Recommendations</Text>
              {analysis.recommendations.map((rec, idx) => (
                <Text key={idx} style={styles.recommendation}>• {rec}</Text>
              ))}
            </View>
            
            <View style={styles.analysisSection}>
              <Text style={styles.sectionSubtitle}>Generated Charts</Text>
              {analysis.charts.map((chart, idx) => (
                <Text key={idx} style={styles.chartType}>{chart}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderChartsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Charts & Visualizations</Text>
        <Text style={styles.chartsDescription}>
          Automatically generated charts and visualizations from your data.
        </Text>
        
        {charts.map((chart, index) => (
          <View key={chart.id} style={styles.chartCard}>
            <Text style={styles.chartTitle}>{chart.title}</Text>
            <Text style={styles.chartType}>{chart.chart_type}</Text>
            <Text style={styles.chartRange}>Range: {chart.data_range}</Text>
            <Text style={styles.chartDate}>
              {new Date(chart.created_at).toLocaleDateString()}
            </Text>
            
            <View style={styles.chartPreview}>
              <Text style={styles.chartPreviewText}>Chart Preview</Text>
              <View style={styles.chartPlaceholder} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Smartsheet AI</Text>
        <Text style={styles.subtitle}>AI-powered spreadsheet automation</Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('sheets', 'Sheets')}
        {renderTabButton('analysis', 'Analysis')}
        {renderTabButton('charts', 'Charts')}
      </View>

      {activeTab === 'sheets' && renderSheetsTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'charts' && renderChartsTab()}
    </Animated.View>
  );
}

const createSmartsheetStyles = (theme: any, emotionalState: string) => StyleSheet.create({
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
  sheetCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sheetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  sheetDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  sheetType: {
    fontSize: 14,
    color: theme.primary,
    marginBottom: 12,
  },
  sheetStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  sheetStat: {
    backgroundColor: theme.background,
    color: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetActionButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  sheetActionText: {
    color: theme.onSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  analysisDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  analysisType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  analysisDate: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  analysisSection: {
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  insight: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  stat: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  recommendation: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  chartType: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  chartsDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  chartRange: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  chartDate: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  chartPreview: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chartPreviewText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  chartPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
