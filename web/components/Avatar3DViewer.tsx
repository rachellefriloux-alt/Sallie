import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDesign } from './DesignSystem';

interface Avatar3DViewerProps {
  style?: string;
  mood?: string;
  format?: 'threejs' | 'aframe' | 'model-viewer';
  autoRotate?: boolean;
  showControls?: boolean;
  onStyleChange?: (style: string) => void;
  onMoodChange?: (mood: string) => void;
}

export function Avatar3DViewer({ 
  style = 'stylized', 
  mood = 'curious', 
  format = 'model-viewer',
  autoRotate = true,
  showControls = true,
  onStyleChange,
  onMoodChange 
}: Avatar3DViewerProps) {
  const { tokens, theme, emotionalState, setEmotionalState } = useDesign();
  const styles = createAvatarStyles(theme, emotionalState);
  const [currentStyle, setCurrentStyle] = useState(style);
  const [currentMood, setCurrentMood] = useState(mood);
  const [isLoading, setIsLoading] = useState(true);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  const { width, height } = Dimensions.get('window');

  const avatarStyles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic human appearance' },
    { id: 'stylized', name: 'Stylized', description: 'Artistic stylized representation' },
    { id: 'anime', name: 'Anime', description: 'Anime-inspired character design' },
    { id: 'cartoon', name: 'Cartoon', description: 'Cartoon-like appearance' },
    { id: 'fantasy', name: 'Fantasy', description: 'Magical and ethereal form' },
    { id: 'scifi', name: 'Sci-Fi', description: 'Futuristic technological being' },
    { id: 'abstract', name: 'Abstract', description: 'Abstract conceptual representation' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple geometric form' },
    { id: 'organic', name: 'Organic', description: 'Natural, flowing organic shape' },
    { id: 'geometric', name: 'Geometric', description: 'Precise geometric patterns' },
    { id: 'particle', name: 'Particle', description: 'Dynamic particle-based form' },
    { id: 'light', name: 'Light', description: 'Pure energy and light manifestation' },
    { id: 'crystalline', name: 'Crystalline', description: 'Crystalline structured form' },
  ];

  const avatarMoods = [
    { id: 'happy', name: 'Happy', color: '#ffeb3b', icon: '😊' },
    { id: 'curious', name: 'Curious', color: '#2196f3', icon: '🤔' },
    { id: 'thoughtful', name: 'Thoughtful', color: '#9c27b0', icon: '🤔' },
    { id: 'excited', name: 'Excited', color: '#ff5722', icon: '🎉' },
    { id: 'calm', name: 'Calm', color: '#4caf50', icon: '😌' },
    { id: 'focused', name: 'Focused', color: '#ff9800', icon: '🎯' },
    { id: 'playful', name: 'Playful', color: '#e91e63', icon: '🎮' },
    { id: 'mysterious', name: 'Mysterious', color: '#673ab7', icon: '🌙' },
    { id: 'wise', name: 'Wise', color: '#795548', icon: '🦉' },
    { id: 'compassionate', name: 'Compassionate', color: '#f44336', icon: '💝' },
    { id: 'creative', name: 'Creative', color: '#00bcd4', icon: '🎨' },
    { id: 'analytical', name: 'Analytical', color: '#607d8b', icon: '📊' },
  ];

  useEffect(() => {
    loadAvatar();
  }, [currentStyle, currentMood, format]);

  const loadAvatar = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the avatar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load the appropriate viewer
      if (format === 'model-viewer') {
        loadModelViewer();
      } else if (format === 'aframe') {
        loadAFrame();
      } else if (format === 'threejs') {
        loadThreeJS();
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelViewer = () => {
    if (!viewerRef.current) return;
    
    // Create model-viewer element
    const modelViewer = document.createElement('model-viewer');
    modelViewer.setAttribute('src', `/models/${currentStyle}_avatar.glb`);
    modelViewer.setAttribute('ar', 'ar-modes="webxr scene-viewer quick-look"');
    modelViewer.setAttribute('camera-controls', '');
    modelViewer.setAttribute('auto-rotate', autoRotate.toString());
    modelViewer.setAttribute('shadow-intensity', '1');
    modelViewer.setAttribute('animation-name', 'idle');
    modelViewer.setAttribute('style', 'width: 100%; height: 400px; background-color: #1a1a2e;');
    
    // Clear previous content
    viewerRef.current.innerHTML = '';
    viewerRef.current.appendChild(modelViewer);
  };

  const loadAFrame = () => {
    if (!viewerRef.current) return;
    
    const aframeHTML = `
      <a-scene background="color: #1a1a2e" style="width: 100%; height: 400px;">
        <a-assets>
          <a-asset-item id="avatar-model" src="/models/${currentStyle}_avatar.glb"></a-asset-item>
        </a-assets>
        
        <a-entity 
          gltf-model="#avatar-model"
          position="0 1 0"
          scale="1 1 1"
          animation-mixer="clip: idle"
          material="metalness: 0.3; roughness: 0.4; emissive: ${getMoodColor(currentMood)}; emissiveIntensity: 0.1"
        >
        </a-entity>
        
        <!-- Lighting -->
        <a-light type="ambient" color="#404040" intensity="0.4"></a-light>
        <a-light type="directional" color="#ffffff" position="1 4 2" intensity="0.8"></a-light>
        <a-light type="point" color="${getMoodColor(currentMood)}" position="0 3 0" intensity="0.5"></a-light>
        
        <!-- Camera -->
        <a-camera position="0 2 5" look-at="0 1 0"></a-camera>
      </a-scene>
    `;
    
    viewerRef.current.innerHTML = aframeHTML;
  };

  const loadThreeJS = () => {
    if (!viewerRef.current) return;
    
    // This would load a Three.js scene
    // For now, we'll show a placeholder
    viewerRef.current.innerHTML = `
      <div style="width: 100%; height: 400px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px;">
        <div style="text-align: center; color: white;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎭</div>
          <div style="font-size: 18px; margin-bottom: 8px;">${currentStyle.charAt(0).toUpperCase() + currentStyle.slice(1)} Avatar</div>
          <div style="font-size: 14px; opacity: 0.7;">Mood: ${currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}</div>
          <div style="font-size: 12px; opacity: 0.5; margin-top: 16px;">Three.js rendering</div>
        </div>
      </div>
    `;
  };

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      happy: '#ffeb3b',
      curious: '#2196f3',
      thoughtful: '#9c27b0',
      excited: '#ff5722',
      calm: '#4caf50',
      focused: '#ff9800',
      playful: '#e91e63',
      mysterious: '#673ab7',
      wise: '#795548',
      compassionate: '#f44336',
      creative: '#00bcd4',
      analytical: '#607d8b',
    };
    return moodColors[mood] || '#ffffff';
  };

  const handleStyleChange = (newStyle: string) => {
    setCurrentStyle(newStyle);
    setShowStyleSelector(false);
    onStyleChange?.(newStyle);
  };

  const handleMoodChange = (newMood: string) => {
    setCurrentMood(newMood);
    setShowMoodSelector(false);
    onMoodChange?.(newMood);
    setEmotionalState(newMood);
  };

  const renderAvatarViewer = () => (
    <View style={styles.avatarContainer}>
      <View style={styles.viewerHeader}>
        <Text style={styles.viewerTitle}>Sallie's 3D Avatar</Text>
        <Text style={styles.viewerSubtitle}>
          {currentStyle.charAt(0).toUpperCase() + currentStyle.slice(1)} • {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
        </Text>
      </View>
      
      <View style={styles.viewerWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Avatar...</Text>
            <View style={styles.loadingSpinner} />
          </View>
        ) : (
          <View 
            ref={viewerRef} 
            style={styles.avatarViewer}
            testID="avatar-viewer"
          />
        )}
      </View>
      
      {showControls && (
        <View style={styles.viewerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowStyleSelector(!showStyleSelector)}
          >
            <Text style={styles.controlButtonText}>Style</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowMoodSelector(!showMoodSelector)}
          >
            <Text style={styles.controlButtonText}>Mood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={loadAvatar}
          >
            <Text style={styles.controlButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStyleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Choose Avatar Style</Text>
      <ScrollView style={styles.selectorScroll} showsVerticalScrollIndicator={false}>
        {avatarStyles.map((avatarStyle) => (
          <TouchableOpacity
            key={avatarStyle.id}
            style={[
              styles.selectorItem,
              currentStyle === avatarStyle.id && styles.selectedItem
            ]}
            onPress={() => handleStyleChange(avatarStyle.id)}
          >
            <View style={styles.selectorContent}>
              <Text style={styles.selectorName}>{avatarStyle.name}</Text>
              <Text style={styles.selectorDescription}>{avatarStyle.description}</Text>
            </View>
            {currentStyle === avatarStyle.id && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMoodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Choose Avatar Mood</Text>
      <ScrollView style={styles.selectorScroll} showsVerticalScrollIndicator={false}>
        {avatarMoods.map((avatarMood) => (
          <TouchableOpacity
            key={avatarMood.id}
            style={[
              styles.selectorItem,
              currentMood === avatarMood.id && styles.selectedItem
            ]}
            onPress={() => handleMoodChange(avatarMood.id)}
          >
            <View style={styles.moodContent}>
              <Text style={styles.moodIcon}>{avatarMood.icon}</Text>
              <View style={styles.moodInfo}>
                <Text style={styles.selectorName}>{avatarMood.name}</Text>
                <View style={[styles.moodColorIndicator, { backgroundColor: avatarMood.color }]} />
              </View>
            </View>
            {currentMood === avatarMood.id && (
              <Text style={styles.selectedIndicator}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderAvatarViewer()}
      
      {showStyleSelector && renderStyleSelector()}
      {showMoodSelector && renderMoodSelector()}
    </View>
  );
}

const createAvatarStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows } = DesignTokens;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    avatarContainer: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    viewerHeader: {
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    
    viewerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    viewerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    
    viewerWrapper: {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      marginBottom: spacing[4],
    },
    
    avatarViewer: {
      width: '100%',
      height: 400,
      backgroundColor: '#1a1a2e',
      borderRadius: borderRadius.lg,
    },
    
    loadingContainer: {
      width: '100%',
      height: 400,
      backgroundColor: '#1a1a2e',
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    loadingText: {
      fontSize: typography.fontSize.base,
      color: colors.white,
      marginBottom: spacing[3],
    },
    
    loadingSpinner: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.primary[500],
      borderTopColor: 'transparent',
      borderStyle: 'solid',
    },
    
    viewerControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    
    controlButton: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      minWidth: 80,
      alignItems: 'center',
    },
    
    controlButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    
    selectorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    
    selectorTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[4],
      textAlign: 'center',
    },
    
    selectorScroll: {
      flex: 1,
    },
    
    selectorItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.lg,
      marginBottom: spacing[2],
      backgroundColor: theme === 'light' ? colors.gray[50] : colors.gray[700],
    },
    
    selectedItem: {
      backgroundColor: colors.primary[100],
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    
    selectorContent: {
      flex: 1,
    },
    
    selectorName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[1],
    },
    
    selectorDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    
    moodContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    
    moodIcon: {
      fontSize: 24,
      marginRight: spacing[3],
    },
    
    moodInfo: {
      flex: 1,
    },
    
    moodColorIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginTop: spacing[1],
    },
    
    selectedIndicator: {
      fontSize: 18,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[500],
      marginLeft: spacing[3],
    },
  });
};

export default Avatar3DViewer;
