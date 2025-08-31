import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  const [greeting, setGreeting] = useState('Hello');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    updateGreeting();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  };

  const menuItems = [
    {
      title: 'AI Chat',
      icon: 'chat',
      color: '#4CAF50',
      screen: 'Chat',
      description: 'Talk to Sallie AI'
    },
    {
      title: 'App Launcher',
      icon: 'apps',
      color: '#2196F3',
      screen: 'Launcher',
      description: 'Launch your apps'
    },
    {
      title: 'Settings',
      icon: 'settings',
      color: '#FF9800',
      screen: 'Settings',
      description: 'Configure Sallie'
    }
  ];

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickActionCard, {backgroundColor: item.color}]}
            onPress={() => navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={32} color="#fff" />
            <Text style={styles.quickActionTitle}>{item.title}</Text>
            <Text style={styles.quickActionDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const RecentActivity = () => (
    <View style={styles.recentActivityContainer}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityItem}>
        <Icon name="access-time" size={20} color="#888" />
        <Text style={styles.activityText}>Last chat: 2 hours ago</Text>
      </View>
      <View style={styles.activityItem}>
        <Icon name="apps" size={20} color="#888" />
        <Text style={styles.activityText}>WhatsApp launched 1 hour ago</Text>
      </View>
      <View style={styles.activityItem}>
        <Icon name="settings" size={20} color="#888" />
        <Text style={styles.activityText}>Settings updated yesterday</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.time}>
              {currentTime.toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}>
            <Icon name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity />

        {/* AI Status */}
        <View style={styles.aiStatusContainer}>
          <Text style={styles.sectionTitle}>Sallie AI Status</Text>
          <View style={styles.aiStatusCard}>
            <Icon name="psychology" size={24} color="#4CAF50" />
            <View style={styles.aiStatusText}>
              <Text style={styles.aiStatusTitle}>Online & Ready</Text>
              <Text style={styles.aiStatusDescription}>
                Sallie is ready to help you with tasks and conversations
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  time: {
    fontSize: 16,
    color: '#888',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.8,
  },
  recentActivityContainer: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
  },
  aiStatusContainer: {
    marginBottom: 30,
  },
  aiStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 15,
  },
  aiStatusText: {
    marginLeft: 15,
    flex: 1,
  },
  aiStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  aiStatusDescription: {
    fontSize: 14,
    color: '#888',
  },
});

export default HomeScreen;