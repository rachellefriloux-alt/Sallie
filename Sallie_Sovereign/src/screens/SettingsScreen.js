import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEnabled: true,
    hapticFeedback: true,
    autoLaunch: false,
    privacyMode: false,
    dataCollection: true,
    locationServices: false,
  });

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: 'user@example.com',
    avatar: null,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: () => console.log('Logout')},
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reset', style: 'destructive', onPress: () => {
          setSettings({
            darkMode: true,
            notifications: true,
            soundEnabled: true,
            hapticFeedback: true,
            autoLaunch: false,
            privacyMode: false,
            dataCollection: true,
            locationServices: false,
          });
        }},
      ]
    );
  };

  const SettingItem = ({icon, title, subtitle, value, onPress, type = 'switch'}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#4CAF50" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{false: '#767577', true: '#4CAF50'}}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Icon name="chevron-right" size={24} color="#888" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({title}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Icon name="person" size={40} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Icon name="edit" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={styles.section}>
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={settings.darkMode}
            onPress={() => updateSetting('darkMode', !settings.darkMode)}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive notifications from Sallie"
            value={settings.notifications}
            onPress={() => updateSetting('notifications', !settings.notifications)}
          />
          <SettingItem
            icon="volume-up"
            title="Sound"
            subtitle="Play sounds for notifications"
            value={settings.soundEnabled}
            onPress={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          />
          <SettingItem
            icon="vibration"
            title="Haptic Feedback"
            subtitle="Vibrate on interactions"
            value={settings.hapticFeedback}
            onPress={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
          />
        </View>

        {/* Launcher Settings */}
        <SectionHeader title="Launcher" />
        <View style={styles.section}>
          <SettingItem
            icon="launch"
            title="Auto Launch"
            subtitle="Launch Sallie on device startup"
            value={settings.autoLaunch}
            onPress={() => updateSetting('autoLaunch', !settings.autoLaunch)}
          />
        </View>

        {/* Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <View style={styles.section}>
          <SettingItem
            icon="security"
            title="Privacy Mode"
            subtitle="Hide sensitive information"
            value={settings.privacyMode}
            onPress={() => updateSetting('privacyMode', !settings.privacyMode)}
          />
          <SettingItem
            icon="location-on"
            title="Location Services"
            subtitle="Allow location access"
            value={settings.locationServices}
            onPress={() => updateSetting('locationServices', !settings.locationServices)}
          />
          <SettingItem
            icon="data-usage"
            title="Data Collection"
            subtitle="Help improve Sallie with usage data"
            value={settings.dataCollection}
            onPress={() => updateSetting('dataCollection', !settings.dataCollection)}
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingItem
            icon="info"
            title="Version"
            subtitle="Sallie Sovereign 2.0.0"
            type="info"
            onPress={() => {}}
          />
          <SettingItem
            icon="description"
            title="Terms of Service"
            type="navigate"
            onPress={() => console.log('Terms of Service')}
          />
          <SettingItem
            icon="privacy-tip"
            title="Privacy Policy"
            type="navigate"
            onPress={() => console.log('Privacy Policy')}
          />
        </View>

        {/* Actions */}
        <SectionHeader title="Actions" />
        <View style={styles.section}>
          <SettingItem
            icon="restore"
            title="Reset Settings"
            subtitle="Reset all settings to default"
            type="navigate"
            onPress={handleResetSettings}
          />
          <SettingItem
            icon="logout"
            title="Logout"
            subtitle="Sign out of your account"
            type="navigate"
            onPress={handleLogout}
          />
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
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#16213e',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#16213e',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#888',
  },
});

export default SettingsScreen;