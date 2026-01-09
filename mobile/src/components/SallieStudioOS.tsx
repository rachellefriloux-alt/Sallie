import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LimbicEngine, LimbicEngineUtils } from '../../../shared/services/limbicEngine';

const { width } = Dimensions.get('window');

const API_BASE = 'http://192.168.1.47:8742';
const LIMBIC_ENGINE_URL = 'http://192.168.1.47:8750';

interface LifeRole {
  id: string;
  name: string;
  icon: string;
  tasks: number;
  priority: 'high' | 'medium' | 'low';
  energy: number;
  color: string;
}

interface SallieState {
  limbic_variables: Record<string, number>;
  cognitive_state: string;
  trust_tier: string;
  dynamic_posture: string;
  emotional_state: string;
}

export const SallieStudioOS: React.FC = () => {
  const [activeRole, setActiveRole] = useState<string>('mom');
  const [sallieState, setSallieState] = useState<SallieState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const lifeRoles: LifeRole[] = [
    { id: 'mom', name: 'Mom', icon: 'favorite', tasks: 12, priority: 'high', energy: 85, color: '#FF69B4' },
    { id: 'spouse', name: 'Spouse', icon: 'favorite', tasks: 8, priority: 'high', energy: 75, color: '#FF1493' },
    { id: 'entrepreneur', name: 'Entrepreneur', icon: 'business', tasks: 15, priority: 'high', energy: 60, color: '#9370DB' },
    { id: 'creator', name: 'Creator', icon: 'create', tasks: 6, priority: 'medium', energy: 90, color: '#6A5ACD' },
    { id: 'friend', name: 'Friend', icon: 'people', tasks: 4, priority: 'medium', energy: 70, color: '#4169E1' },
    { id: 'daughter', name: 'Daughter', icon: 'person', tasks: 3, priority: 'low', energy: 80, color: '#32CD32' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/limbic`);
        if (response.ok) {
          const data = await response.json();
          setSallieState(data);
        }
      } catch (error) {
        console.error('Failed to fetch Sallie state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#6BCF7F';
      default: return '#95A5A6';
    }
  };

  const getLimbicColor = (value: number) => {
    if (value >= 80) return '#6BCF7F';
    if (value >= 60) return '#FFD93D';
    if (value >= 40) return '#FFA500';
    return '#FF6B6B';
  };

  const handleRolePress = (roleId: string) => {
    setActiveRole(roleId);
  };

  const handleTaskAutomation = async (role: LifeRole) => {
    try {
      const response = await fetch(`${API_BASE}/automate/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id })
      });
      
      if (response.ok) {
        Alert.alert('Automation Started', `Sallie is now handling ${role.name} tasks automatically!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start automation');
    }
  };

  const renderRoleCard = (role: LifeRole) => {
    const isActive = activeRole === role.id;
    return (
      <TouchableOpacity
        key={role.id}
        style={[
          styles.roleCard,
          isActive ? styles.activeRoleCard : styles.inactiveRoleCard,
          { borderLeftColor: role.color }
        ]}
        onPress={() => handleRolePress(role.id)}
      >
        <View style={styles.roleHeader}>
          <View style={[styles.roleIcon, { backgroundColor: role.color }]}>
            <Icon name={role.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>{role.name}</Text>
            <Text style={styles.roleDescription}>
              {role.tasks} tasks • {role.energy}% energy
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(role.priority) }]}>
            <Text style={styles.priorityText}>{role.priority.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.roleStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tasks</Text>
            <Text style={styles.statValue}>{role.tasks}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Energy</Text>
            <View style={styles.energyBar}>
              <View style={[
                styles.energyFill,
                { width: `${role.energy}%`, backgroundColor: getLimbicColor(role.energy) }
              ]} />
            </View>
            <Text style={styles.statValue}>{role.energy}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSallieState = () => {
    if (!sallieState) return null;

    return (
      <Card style={styles.stateCard}>
        <View style={styles.stateHeader}>
          <Icon name="psychology" size={24} color="#9370DB" />
          <Text style={styles.stateTitle}>Sallie's Current State</Text>
        </View>
        
        <View style={styles.stateInfo}>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Posture:</Text>
            <Text style={styles.stateValue}>{sallieState.dynamic_posture}</Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Emotional:</Text>
            <Text style={styles.stateValue}>{sallieState.emotional_state}</Text>
          </View>
          <View style={styles.stateItem}>
            <Text style={styles.stateLabel}>Trust:</Text>
            <Text style={styles.stateValue}>{sallieState.trust_tier}</Text>
          </View>
        </View>
        
        <View style={styles.limbicVariables}>
          <Text style={styles.limbicTitle}>Limbic Variables</Text>
          {Object.entries(sallieState.limbic_variables).slice(0, 3).map(([key, value]) => (
            <View key={key} style={styles.limbicItem}>
              <Text style={styles.limbicLabel}>{key}:</Text>
              <View style={styles.limbicBar}>
                <View style={[
                  styles.limbicFill,
                  { width: `${value}%`, backgroundColor: getLimbicColor(value) }
                ]} />
              </View>
              <Text style={styles.limbicValue}>{value}%</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderDashboard = () => {
    const currentRole = lifeRoles.find(r => r.id === activeRole);
    
    return (
      <ScrollView style={styles.dashboardContent}>
        {renderSallieState()}
        
        {currentRole && (
          <Card style={styles.activeRoleCard}>
            <Text style={styles.activeRoleTitle}>{currentRole.name} Workspace</Text>
            
            <View style={styles.roleStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Active Tasks</Text>
                <Text style={styles.statValueLarge}>{currentRole.tasks}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Energy Level</Text>
                <View style={styles.energyBarLarge}>
                  <View style={[
                    styles.energyFill,
                    { width: `${currentRole.energy}%`, backgroundColor: getLimbicColor(currentRole.energy) }
                  ]} />
                </View>
                <Text style={styles.statValueLarge}>{currentRole.energy}%</Text>
              </View>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(currentRole.priority), alignSelf: 'flex-start' }]}>
              <Text style={styles.priorityText}>{currentRole.priority.toUpperCase()}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.automationButton}
              onPress={() => handleTaskAutomation(currentRole)}
            >
              <Icon name="auto-awesome" size={20} color="#FFFFFF" />
              <Text style={styles.automationButtonText}>Let Sallie Handle It</Text>
            </TouchableOpacity>
          </Card>
        )}
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="event" size={24} color="#9370DB" />
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="analytics" size={24} color="#9370DB" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="lightbulb" size={24} color="#9370DB" />
            <Text style={styles.quickActionText}>Ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="menu-book" size={24} color="#9370DB" />
            <Text style={styles.quickActionText}>Learning</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderSallieverse = () => (
    <View style={styles.sallieverseContent}>
      <Card style={styles.sallieverseCard}>
        <View style={styles.sallieverseHeader}>
          <Icon name="public" size={32} color="#9370DB" />
          <Text style={styles.sallieverseTitle}>Welcome to Sallie's World</Text>
        </View>
        
        <Text style={styles.sallieverseDescription}>
          An immersive 3D environment where Sallie lives and grows
        </Text>
        
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>🦚</Text>
          </View>
          <Text style={styles.avatarState}>Happy</Text>
        </View>
        
        <TouchableOpacity style={styles.enterButton}>
          <Icon name="login" size={20} color="#FFFFFF" />
          <Text style={styles.enterButtonText}>Enter Sallieverse</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderMessenger = () => (
    <View style={styles.messengerContent}>
      <Card style={styles.messengerCard}>
        <View style={styles.messengerHeader}>
          <Icon name="chat" size={24} color="#9370DB" />
          <Text style={styles.messengerTitle}>Messenger Mirror</Text>
        </View>
        
        <Text style={styles.messengerDescription}>
          Your private channel with Sallie - text, voice, and video
        </Text>
        
        <View style={styles.communicationOptions}>
          <TouchableOpacity style={styles.commButton}>
            <Icon name="message" size={20} color="#FFFFFF" />
            <Text style={styles.commButtonText}>Start Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commButton}>
            <Icon name="call" size={20} color="#FFFFFF" />
            <Text style={styles.commButtonText}>Voice Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commButton}>
            <Icon name="videocam" size={20} color="#FFFFFF" />
            <Text style={styles.commButtonText}>Video Call</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderDuality = () => (
    <View style={styles.dualityContent}>
      <Card style={styles.dualityCard}>
        <View style={styles.dualityHeader}>
          <Icon name="psychology" size={24} color="#9370DB" />
          <Text style={styles.dualityTitle}>Duality Engine</Text>
        </View>
        
        <Text style={styles.dualityDescription}>
          Adaptive interface for your neurodivergent mind
        </Text>
        
        <View style={styles.modesGrid}>
          {[
            { mode: 'INFJ', icon: 'favorite', color: '#FF69B4' },
            { mode: 'Gemini', icon: 'auto-awesome', color: '#FFD93D' },
            { mode: 'ADHD', icon: 'bolt', color: '#FFA500' },
            { mode: 'OCD', icon: 'target', color: '#4169E1' },
            { mode: 'PTSD', icon: 'shield', color: '#9370DB' },
          ].map(({ mode, icon, color }) => (
            <View key={mode} style={styles.modeItem}>
              <View style={[styles.modeIcon, { backgroundColor: color }]}>
                <Icon name={icon} size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.modeText}>{mode}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.activateButton}>
          <Icon name="settings" size={20} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>Activate Mode Switching</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderLifeOS = () => (
    <View style={styles.lifeOSContent}>
      <Card style={styles.lifeOSCard}>
        <View style={styles.lifeOSHeader}>
          <Icon name="apps" size={24} color="#9370DB" />
          <Text style={styles.lifeOSTitle}>LifeOS Integration</Text>
        </View>
        
        <View style={styles.modulesGrid}>
          {[
            { title: 'Calendar', icon: 'event', count: 24 },
            { title: 'Tasks', icon: 'checklist', count: 47 },
            { title: 'Projects', icon: 'business', count: 8 },
            { title: 'Notes', icon: 'note', count: 156 },
            { title: 'Automations', icon: 'auto-awesome', count: 12 },
            { title: 'Memories', icon: 'favorite', count: 89 },
          ].map(({ title, icon, count }) => (
            <View key={title} style={styles.moduleItem}>
              <Icon name={icon} size={24} color="#9370DB" />
              <Text style={styles.moduleCount}>{count}</Text>
              <Text style={styles.moduleTitle}>{title}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.openButton}>
          <Icon name="open-in-new" size={20} color="#FFFFFF" />
          <Text style={styles.openButtonText}>Open LifeOS</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'sallieverse': return renderSallieverse();
      case 'messenger': return renderMessenger();
      case 'duality': return renderDuality();
      case 'lifeos': return renderLifeOS();
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9370DB" />
        <Text style={styles.loadingText}>Initializing Sallie Studio OS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name="psychology" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Sallie Studio OS</Text>
            <Text style={styles.headerSubtitle}>Complete Life Management</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="chat" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'sallieverse', label: 'Sallieverse', icon: 'public' },
          { id: 'messenger', label: 'Messenger', icon: 'chat' },
          { id: 'duality', label: 'Duality', icon: 'psychology' },
          { id: 'lifeos', label: 'LifeOS', icon: 'apps' },
        ].map(({ id, label, icon }) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.tabButton,
              activeTab === id ? styles.activeTabButton : styles.inactiveTabButton
            ]}
            onPress={() => setActiveTab(id)}
          >
            <Icon
              name={icon}
              size={20}
              color={activeTab === id ? '#FFFFFF' : '#9370DB'}
            />
            <Text style={[
              styles.tabText,
              activeTab === id ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesScroll}>
          {lifeRoles.map(renderRoleCard)}
        </ScrollView>
        
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#16213E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9370DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9370DB',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9370DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213E',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#9370DB',
  },
  inactiveTabButton: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#9370DB',
  },
  content: {
    flex: 1,
  },
  rolesScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  roleCard: {
    width: 200,
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  activeRoleCard: {
    backgroundColor: '#2D2D44',
  },
  inactiveRoleCard: {
    backgroundColor: '#16213E',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleDescription: {
    color: '#9370DB',
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roleStats: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9370DB',
    fontSize: 12,
    width: 60,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statValueLarge: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  energyBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2D2D44',
    borderRadius: 3,
    marginLeft: 8,
    marginRight: 8,
  },
  energyBarLarge: {
    flex: 1,
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
  },
  energyFill: {
    height: '100%',
    borderRadius: 3,
  },
  dashboardContent: {
    padding: 16,
  },
  stateCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#16213E',
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  stateInfo: {
    marginBottom: 12,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stateLabel: {
    color: '#9370DB',
    fontSize: 14,
  },
  stateValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  limbicVariables: {
    marginTop: 8,
  },
  limbicTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  limbicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  limbicLabel: {
    color: '#9370DB',
    fontSize: 12,
    width: 80,
  },
  limbicBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  limbicFill: {
    height: '100%',
    borderRadius: 2,
  },
  limbicValue: {
    color: '#FFFFFF',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  activeRoleCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#16213E',
  },
  activeRoleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  automationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  automationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 48) / 2 - 8,
    backgroundColor: '#16213E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  sallieverseContent: {
    padding: 16,
  },
  sallieverseCard: {
    padding: 20,
    backgroundColor: '#16213E',
    alignItems: 'center',
  },
  sallieverseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sallieverseTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sallieverseDescription: {
    color: '#9370DB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#9370DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarIcon: {
    fontSize: 60,
  },
  avatarState: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messengerContent: {
    padding: 16,
  },
  messengerCard: {
    padding: 20,
    backgroundColor: '#16213E',
    alignItems: 'center',
  },
  messengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  messengerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messengerDescription: {
    color: '#9370DB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  communicationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  commButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  commButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dualityContent: {
    padding: 16,
  },
  dualityCard: {
    padding: 20,
    backgroundColor: '#16213E',
    alignItems: 'center',
  },
  dualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dualityTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dualityDescription: {
    color: '#9370DB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  modeItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  lifeOSContent: {
    padding: 16,
  },
  lifeOSCard: {
    padding: 20,
    backgroundColor: '#16213E',
    alignItems: 'center',
  },
  lifeOSHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lifeOSTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  moduleItem: {
    alignItems: 'center',
    marginBottom: 16,
    width: 60,
  },
  moduleCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  moduleTitle: {
    color: '#9370DB',
    fontSize: 10,
    textAlign: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
