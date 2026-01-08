import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const API_BASE = 'http://192.168.1.47:8742';

interface AvatarState {
  current_form: string;
  emotional_state: string;
  energy_level: number;
  evolution_stage: number;
  customization_options: string[];
  last_change: string;
}

interface AvatarForm {
  id: string;
  name: string;
  icon: string;
  colors: string[];
}

interface SallieAvatarProps {
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export const SallieAvatar: React.FC<SallieAvatarProps> = ({ 
  size = 'medium', 
  interactive = true 
}) => {
  const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
  const [currentForm, setCurrentForm] = useState<string>('peacock');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));

  const avatarForms: AvatarForm[] = [
    { id: 'peacock', name: 'Peacock', icon: '🦚', colors: ['#00FF7F', '#4169E1', '#9370DB'] },
    { id: 'phoenix', name: 'Phoenix', icon: '🔥', colors: ['#FF6347', '#FF8C00', '#FFD700'] },
    { id: 'dragon', name: 'Dragon', icon: '🐉', colors: ['#9370DB', '#4B0082', '#C0C0C0'] },
    { id: 'unicorn', name: 'Unicorn', icon: '🦄', colors: ['#FFFFFF', '#FFB6C1', '#FF69B4'] },
    { id: 'crystal', name: 'Crystal', icon: '💎', colors: ['#00CED1', '#4169E1', '#FFFFFF'] },
    { id: 'cosmic', name: 'Cosmic', icon: '🌌', colors: ['#9370DB', '#000000', '#FFD700'] },
  ];

  useEffect(() => {
    const fetchAvatarState = async () => {
      try {
        const response = await fetch(`${API_BASE}/avatar/state`);
        if (response.ok) {
          const data = await response.json();
          setAvatarState(data);
          setCurrentForm(data.current_form || 'peacock');
        }
      } catch (error) {
        console.error('Failed to fetch avatar state:', error);
      }
    };

    if (interactive) {
      fetchAvatarState();
      const interval = setInterval(fetchAvatarState, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [interactive]);

  useEffect(() => {
    // Start pulse animation
    const pulse = Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);
    
    const pulseLoop = Animated.loop(pulse);
    pulseLoop.start();
    
    return () => pulseLoop.stop();
  }, [pulseAnimation]);

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 64;
      case 'medium': return 128;
      case 'large': return 256;
      default: return 128;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 48;
      case 'large': return 96;
      default: return 48;
    }
  };

  const getCurrentForm = () => {
    return avatarForms.find(form => form.id === currentForm) || avatarForms[0];
  };

  const handleFormChange = async (formId: string) => {
    try {
      setIsAnimating(true);
      const response = await fetch(`${API_BASE}/avatar/change-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: formId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvatarState(data);
        setCurrentForm(formId);
        setIsCustomizing(false);
      }
    } catch (error) {
      console.error('Failed to change avatar form:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const toggleCustomization = () => {
    if (interactive) {
      setIsCustomizing(!isCustomizing);
    }
  };

  const renderAvatar = () => {
    const currentFormData = getCurrentForm();
    const avatarSize = getSizeValue();
    const iconSize = getIconSize();
    
    return (
      <Animated.View style={[
        styles.avatarContainer,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          transform: [{ scale: pulseAnimation }],
        }
      ]}>
        {/* Gradient background */}
        <View style={[
          styles.avatarBackground,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }
        ]}>
          {/* Peacock pattern overlay */}
          <View style={styles.peacockPattern}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
              <View
                key={index}
                style={[
                  styles.peacockFeather,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateX: avatarSize / 2 - 10 },
                      { translateY: 0 }
                    ],
                  }
                ]}
              />
            ))}
          </View>
          
          {/* Core avatar */}
          <View style={styles.avatarCore}>
            <Text style={[styles.avatarIcon, { fontSize: iconSize }]}>
              {currentFormData.icon}
            </Text>
            
            {/* Emotional state indicator */}
            {avatarState && (
              <View style={styles.stateIndicator}>
                <Text style={styles.stateText}>
                  {avatarState.emotional_state}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Energy ring */}
        <View style={[
          styles.energyRing,
          {
            width: avatarSize + 16,
            height: avatarSize + 16,
            borderRadius: (avatarSize + 16) / 2,
            margin: -8,
          }
        ]} />
        
        {/* Interactive controls overlay */}
        {interactive && (
          <TouchableOpacity
            style={styles.interactiveOverlay}
            onPress={toggleCustomization}
            activeOpacity={0.8}
          >
            <View style={styles.controlsPanel}>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="camera-alt" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="palette" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="settings" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Status indicators */}
        {avatarState && (
          <View style={styles.statusIndicators}>
            <View style={[styles.statusDot, { backgroundColor: '#6BCF7F' }]} />
            <View style={[styles.statusDot, { backgroundColor: '#4169E1' }]} />
            <View style={[styles.statusDot, { backgroundColor: '#9370DB' }]} />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderCustomizationModal = () => {
    return (
      <Modal
        visible={isCustomizing}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCustomizing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customizationPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Sallie</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsCustomizing(false)}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formsContainer}>
              <Text style={styles.sectionTitle}>Choose Form</Text>
              {avatarForms.map((form) => (
                <TouchableOpacity
                  key={form.id}
                  style={[
                    styles.formOption,
                    currentForm === form.id && styles.selectedFormOption
                  ]}
                  onPress={() => handleFormChange(form.id)}
                >
                  <View style={styles.formOptionLeft}>
                    <Text style={styles.formIcon}>{form.icon}</Text>
                    <View>
                      <Text style={styles.formName}>{form.name}</Text>
                      <Text style={styles.formDescription}>
                        {form.name} form with unique abilities
                      </Text>
                    </View>
                  </View>
                  {currentForm === form.id && (
                    <Icon name="check-circle" size={24} color="#9370DB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.colorsSection}>
              <Text style={styles.sectionTitle}>Colors</Text>
              <View style={styles.colorsContainer}>
                {getCurrentForm().colors.map((color, index) => (
                  <View
                    key={index}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color }
                    ]}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.randomizeButton}
                onPress={() => handleFormChange(avatarForms[Math.floor(Math.random() * avatarForms.length)].id)}
              >
                <Icon name="shuffle" size={20} color="#FFFFFF" />
                <Text style={styles.randomizeButtonText}>Randomize</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setIsCustomizing(false)}
              >
                <Text style={styles.applyButtonText}>Apply Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View>
      {renderAvatar()}
      {renderCustomizationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarBackground: {
    position: 'absolute',
    backgroundColor: '#9370DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peacockPattern: {
    position: 'absolute',
    opacity: 0.3,
  },
  peacockFeather: {
    position: 'absolute',
    width: 20,
    height: 40,
    backgroundColor: '#00FF7F',
    borderRadius: 10,
    opacity: 0.6,
  },
  avatarCore: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarIcon: {
    textAlign: 'center',
  },
  stateIndicator: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9370DB',
  },
  energyRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#9370DB',
    borderStyle: 'solid',
  },
  interactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  controlsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusIndicators: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customizationPanel: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    width: width - 40,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formsContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#9370DB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213E',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedFormOption: {
    backgroundColor: '#2D2D44',
    borderWidth: 2,
    borderColor: '#9370DB',
  },
  formOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  formIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  formName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formDescription: {
    color: '#9370DB',
    fontSize: 12,
    marginTop: 2,
  },
  colorsSection: {
    marginBottom: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  randomizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  randomizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
