/**
 * Main navigation for React Native app.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { LimbicScreen } from '../screens/LimbicScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function ChatStack() {
  return (
    <Stack.Navigator>
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
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: true,
            drawerType: 'permanent', // Always visible on tablets
            drawerStyle: {
              width: 280,
            },
            headerStyle: {
              backgroundColor: '#2a2a2a',
            },
            headerTintColor: '#fff',
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
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#2a2a2a',
            borderTopColor: '#333',
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

