import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error to analytics service (in a real app)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error tracking service
    // like Sentry, Bugsnag, or your own analytics
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      };
      
      console.log('Error logged:', errorData);
      
      // Store error locally for debugging
      // In React Native, you might use AsyncStorage
      // await AsyncStorage.setItem(`error_${Date.now()}`, JSON.stringify(errorData));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // In React Native, you might use Updates.reloadAsync from expo-updates
    // For now, we'll just clear the error state
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  private handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private copyErrorDetails = () => {
    const errorDetails = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
    `.trim();

    // In React Native, you might use Clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(errorDetails);
    } else {
      console.log('Error details (copy manually):', errorDetails);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              
              <Text style={styles.errorMessage}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.handleReload}
                >
                  <Text style={styles.buttonText}>Reload</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={this.handleDismiss}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Dismiss</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.tertiaryButton]}
                onPress={this.copyErrorDetails}
              >
                <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
                  Copy Error Details
                </Text>
              </TouchableOpacity>

              {__DEV__ && this.state.error?.stack && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugTitle}>Debug Information</Text>
                  <ScrollView style={styles.debugScroll}>
                    <Text style={styles.debugText}>
                      {this.state.error.stack}
                    </Text>
                    {this.state.errorInfo?.componentStack && (
                      <Text style={styles.debugText}>
                        Component Stack: {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#6366f1',
  },
  tertiaryButtonText: {
    color: '#9ca3af',
  },
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 8,
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugText: {
    fontSize: 12,
    color: '#d1d5db',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default ErrorBoundary;
