/**
 * Main navigation for React Native app.
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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Gemini/INFJ Theme
const SallieTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#a78bfa', // Light Violet
    background: '#2e1065', // Deep Indigo
    card: '#1e1b4b', // Darker Indigo (Tabs/Header)
    text: '#f8fafc', // Slate 50
    border: '#4c1d95', // Lighter Indigo
    notification: '#f472b6', // Pink
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
          <Drawer.Screen 
            name="Chat" 
            component={ChatStack}
            options={{ title: 'Chat with Sallie' }}
          />
          <Drawer.Screen 
            name="Limbic" 
            component={LimbicScreen}
            options={{ title: 'Emotional State' }}
          />
          <Drawer.Screen 
            name="Heritage" 
            component={HeritageScreen}
            options={{ title: 'Heritage' }}
          />
          <Drawer.Screen 
            name="Thoughts" 
            component={ThoughtsScreen}
            options={{ title: 'Thoughts Log' }}
          />
          <Drawer.Screen 
            name="Hypotheses" 
            component={HypothesesScreen}
            options={{ title: 'Hypotheses' }}
          />
          <Drawer.Screen 
            name="Projects" 
            component={ProjectsScreen}
            options={{ title: 'Projects & Building' }}
          />
          <Drawer.Screen 
            name="Convergence" 
            component={ConvergenceScreen}
            options={{ title: 'Convergence' }}
          />
          <Drawer.Screen 
            name="Control" 
            component={ControlScreen}
            options={{ title: 'Control Panel' }}
          />
          <Drawer.Screen 
            name="Sync" 
            component={SyncScreen}
            options={{ title: 'Sync Status' }}
          />
          <Drawer.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }
  
  // Mobile: Tab navigation
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
        <Tab.Screen 
          name="Chat" 
          component={ChatStack}
          options={{ title: 'Chat' }}
        />
        <Tab.Screen 
          name="Limbic" 
          component={LimbicScreen}
          options={{ title: 'State' }}
        />
        <Tab.Screen 
          name="Heritage" 
          component={HeritageScreen}
          options={{ title: 'Heritage' }}
        />
        <Tab.Screen 
          name="Thoughts" 
          component={ThoughtsScreen}
          options={{ title: 'Thoughts' }}
        />
        <Tab.Screen 
          name="Hypotheses" 
          component={HypothesesScreen}
          options={{ title: 'Hypotheses' }}
        />
        <Tab.Screen 
          name="Projects" 
          component={ProjectsScreen}
          options={{ title: 'Projects' }}
        />
        <Tab.Screen 
          name="Sync" 
          component={SyncScreen}
          options={{ title: 'Sync' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

