/**
 * Main navigation for React Native app - Complete 12-Dimensional System
 */

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { LimbicScreen } from '../screens/LimbicScreen';
import { HeritageScreen } from '../screens/HeritageScreen';
import { ThoughtsScreen } from '../screens/ThoughtsScreen';
import { HypothesesScreen } from '../screens/HypothesesScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { ConvergenceScreen } from '../screens/ConvergenceScreen';
import { ControlScreen } from '../screens/ControlScreen';
import { AvatarScreen } from '../screens/AvatarScreen';
import { ConsciousnessScreen } from '../screens/ConsciousnessScreen';
import { UserThoughtPage } from '../screens/UserThoughtPage';
import { SallieThoughtPage } from '../screens/SallieThoughtPage';
import { AlignmentPage } from '../screens/AlignmentPage';
import { ResourceAccessPage } from '../screens/ResourceAccessPage';
import { ServiceConnectionsPage } from '../screens/ServiceConnectionsPage';
import { HumanLevelExpansionScreen } from '../screens/HumanLevelExpansionScreen';

// Import 12 Dimension Screens
import { LifeSanctuaryScreen } from '../screens/LifeSanctuaryScreen';
import { CommandMatrixScreen } from '../screens/CommandMatrixScreen';
import { GrowthGardenScreen } from '../screens/GrowthGardenScreen';
import { QuantumMessengerScreen } from '../screens/QuantumMessengerScreen';
import { CreativeAtelierScreen } from '../screens/CreativeAtelierScreen';
import { HealingSanctuaryScreen } from '../screens/HealingSanctuaryScreen';
import { TranscendenceScreen } from '../screens/TranscendenceScreen';
import { ResearchUniverseScreen } from '../screens/ResearchUniverseScreen';
import { SocialMasteryScreen } from '../screens/SocialMasteryScreen';
import { TimeEnergyScreen } from '../screens/TimeEnergyScreen';
import { LegacyImpactScreen } from '../screens/LegacyImpactScreen';
import { QuantumCoreScreen } from '../screens/QuantumCoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Peacock/Leopard Theme - Consistent with Web App
const SallieTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#1e3a8a', // Peacock Blue
    background: '#1e1b4b', // Deep Indigo
    card: '#1e293b', // Dark Blue-Gray
    text: '#f8fafc', // Slate 50
    border: '#312e81', // Peacock Border
    notification: '#f472b6', // Pink Accent
  },
};

function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: SallieTheme.colors.card,
        },
        headerTintColor: SallieTheme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ChatMain" 
        component={ChatScreen}
        options={{ title: 'Sallie' }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  
  // Tablet: Use Drawer navigation for better space utilization
  // Mobile: Use Tab navigation for quick access
  if (isTablet) {
    return (
      <NavigationContainer theme={SallieTheme}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: true,
            drawerType: 'permanent', // Always visible on tablets
            drawerStyle: {
              width: 280,
              backgroundColor: SallieTheme.colors.card,
            },
            headerStyle: {
              backgroundColor: SallieTheme.colors.card,
            },
            headerTintColor: SallieTheme.colors.text,
            drawerActiveTintColor: SallieTheme.colors.primary,
            drawerInactiveTintColor: '#94a3b8',
          }}
        >
          {/* 12 Dimensions - Complete System */}
          <Drawer.Screen 
            name="LifeSanctuary" 
            component={LifeSanctuaryScreen}
            options={{ title: '🏠 Life Sanctuary' }}
          />
          <Drawer.Screen 
            name="CommandMatrix" 
            component={CommandMatrixScreen}
            options={{ title: '💼 Command Matrix' }}
          />
          <Drawer.Screen 
            name="GrowthGarden" 
            component={GrowthGardenScreen}
            options={{ title: '🌱 Growth Garden' }}
          />
          <Drawer.Screen 
            name="QuantumMessenger" 
            component={QuantumMessengerScreen}
            options={{ title: '💬 Quantum Messenger' }}
          />
          <Drawer.Screen 
            name="CreativeAtelier" 
            component={CreativeAtelierScreen}
            options={{ title: '🎨 Creative Atelier' }}
          />
          <Drawer.Screen 
            name="HealingSanctuary" 
            component={HealingSanctuaryScreen}
            options={{ title: '🧘 Healing Sanctuary' }}
          />
          <Drawer.Screen 
            name="Transcendence" 
            component={TranscendenceScreen}
            options={{ title: '✨ Transcendence' }}
          />
          <Drawer.Screen 
            name="ResearchUniverse" 
            component={ResearchUniverseScreen}
            options={{ title: '🔬 Research Universe' }}
          />
          <Drawer.Screen 
            name="SocialMastery" 
            component={SocialMasteryScreen}
            options={{ title: '👥 Social Mastery' }}
          />
          <Drawer.Screen 
            name="TimeEnergy" 
            component={TimeEnergyScreen}
            options={{ title: '⏰ Time & Energy' }}
          />
          <Drawer.Screen 
            name="LegacyImpact" 
            component={LegacyImpactScreen}
            options={{ title: '🚀 Legacy & Impact' }}
          />
          <Drawer.Screen 
            name="QuantumCore" 
            component={QuantumCoreScreen}
            options={{ title: '⚛️ Quantum Core' }}
          />
          
          {/* Additional Features */}
          <Drawer.Screen 
            name="Chat" 
            component={ChatStack}
            options={{ title: '💜 Chat with Sallie' }}
          />
          <Drawer.Screen 
            name="Limbic" 
            component={LimbicScreen}
            options={{ title: '🧠 Emotional State' }}
          />
          <Drawer.Screen 
            name="HumanLevel" 
            component={HumanLevelExpansionScreen}
            options={{ title: '🌟 Human-Level Expansion' }}
          />
          <Drawer.Screen 
            name="Heritage" 
            component={HeritageScreen}
            options={{ title: '🏛️ Heritage' }}
          />
          <Drawer.Screen 
            name="Thoughts" 
            component={ThoughtsScreen}
            options={{ title: '💭 Thoughts Log' }}
          />
          <Drawer.Screen 
            name="Hypotheses" 
            component={HypothesesScreen}
            options={{ title: '🔍 Hypotheses' }}
          />
          <Drawer.Screen 
            name="Projects" 
            component={ProjectsScreen}
            options={{ title: '📂 Projects & Building' }}
          />
          <Drawer.Screen 
            name="Convergence" 
            component={ConvergenceScreen}
            options={{ title: '🌊 Convergence' }}
          />
          <Drawer.Screen 
            name="Control" 
            component={ControlScreen}
            options={{ title: '🎛️ Control Panel' }}
          />
          <Drawer.Screen 
            name="Sync" 
            component={SyncScreen}
            options={{ title: '☁️ Sync Status' }}
          />
          <Drawer.Screen 
            name="Avatar" 
            component={AvatarScreen}
            options={{ title: '👤 Avatar Workshop' }}
          />
          <Drawer.Screen 
            name="Consciousness" 
            component={ConsciousnessScreen}
            options={{ title: '🌌 Consciousness' }}
          />
          <Drawer.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: '⚙️ Settings' }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }
  
  // Mobile: Tab navigation with 12 Dimensions
  return (
    <NavigationContainer theme={SallieTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: SallieTheme.colors.primary,
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: SallieTheme.colors.card,
            borderTopColor: SallieTheme.colors.border,
          },
        }}
      >
        {/* Core 12 Dimensions - Mobile Optimized */}
        <Tab.Screen 
          name="LifeSanctuary" 
          component={LifeSanctuaryScreen}
          options={{ title: '🏠' }}
        />
        <Tab.Screen 
          name="CommandMatrix" 
          component={CommandMatrixScreen}
          options={{ title: '💼' }}
        />
        <Tab.Screen 
          name="GrowthGarden" 
          component={GrowthGardenScreen}
          options={{ title: '🌱' }}
        />
        <Tab.Screen 
          name="QuantumMessenger" 
          component={QuantumMessengerScreen}
          options={{ title: '💬' }}
        />
        <Tab.Screen 
          name="CreativeAtelier" 
          component={CreativeAtelierScreen}
          options={{ title: '🎨' }}
        />
        <Tab.Screen 
          name="HealingSanctuary" 
          component={HealingSanctuaryScreen}
          options={{ title: '🧘' }}
        />
        <Tab.Screen 
          name="Transcendence" 
          component={TranscendenceScreen}
          options={{ title: '✨' }}
        />
        <Tab.Screen 
          name="ResearchUniverse" 
          component={ResearchUniverseScreen}
          options={{ title: '🔬' }}
        />
        <Tab.Screen 
          name="SocialMastery" 
          component={SocialMasteryScreen}
          options={{ title: '👥' }}
        />
        <Tab.Screen 
          name="TimeEnergy" 
          component={TimeEnergyScreen}
          options={{ title: '⏰' }}
        />
        <Tab.Screen 
          name="LegacyImpact" 
          component={LegacyImpactScreen}
          options={{ title: '🚀' }}
        />
        <Tab.Screen 
          name="QuantumCore" 
          component={QuantumCoreScreen}
          options={{ title: '⚛️' }}
        />
        
        {/* Additional Features */}
        <Tab.Screen 
          name="Chat" 
          component={ChatStack}
          options={{ title: '💜' }}
        />
        <Tab.Screen 
          name="Limbic" 
          component={LimbicScreen}
          options={{ title: '🧠' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: '⚙️' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

