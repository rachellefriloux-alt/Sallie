import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SallieBrain from './core/SallieBrain';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import LauncherScreen from './screens/LauncherScreen';

const Stack = createStackNavigator();

const App = () => {
  const [sallieBrain, setSallieBrain] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeSallie();
  }, []);

  const initializeSallie = async () => {
    try {
      const brain = new SallieBrain();
      await brain.initialize();
      setSallieBrain(brain);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Sallie:', error);
      Alert.alert('Initialization Error', 'Failed to initialize Sallie AI');
    }
  };

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Initializing Sallie Sovereign...</Text>
          <Text style={styles.loadingSubtext}>AI Launcher Hybrid</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{title: 'Sallie Sovereign'}}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{title: 'AI Chat'}}
        />
        <Stack.Screen 
          name="Launcher" 
          component={LauncherScreen}
          options={{title: 'App Launcher'}}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#888',
  },
});

export default App;