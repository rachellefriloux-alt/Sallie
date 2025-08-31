/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Emotional intelligence and analysis
 */

export default class EmotionalIntelligence {
  constructor() {
    this.emotionalState = {
      current: 'neutral',
      intensity: 0.5,
      history: []
    };
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    console.log('EmotionalIntelligence initialized successfully');
  }

  async analyzeMessage(message) {
    // Simple keyword-based emotional analysis
    const emotions = {
      happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'],
      sad: ['sad', 'depressed', 'unhappy', 'miserable', 'terrible'],
      angry: ['angry', 'mad', 'furious', 'upset', 'frustrated'],
      anxious: ['worried', 'anxious', 'nervous', 'scared', 'afraid'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    };

    const words = message.toLowerCase().split(' ');
    let detectedEmotion = 'neutral';
    let maxCount = 0;

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const count = keywords.filter(keyword => words.includes(keyword)).length;
      if (count > maxCount) {
        maxCount = count;
        detectedEmotion = emotion;
      }
    }

    this.updateEmotionalState(detectedEmotion);
    return detectedEmotion;
  }

  updateEmotionalState(emotion) {
    this.emotionalState.current = emotion;
    this.emotionalState.history.push({
      emotion,
      timestamp: Date.now()
    });

    // Keep only last 100 emotional states
    if (this.emotionalState.history.length > 100) {
      this.emotionalState.history = this.emotionalState.history.slice(-100);
    }
  }

  async getCurrentState() {
    return this.emotionalState;
  }

  async getEmotionalTrend() {
    const recent = this.emotionalState.history.slice(-10);
    const emotionCounts = {};
    
    recent.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    return emotionCounts;
  }
}