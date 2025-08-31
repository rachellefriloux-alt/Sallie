import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LauncherScreen = () => {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [recentApps, setRecentApps] = useState([]);

  const categories = [
    {id: 'all', name: 'All Apps', icon: 'apps'},
    {id: 'social', name: 'Social', icon: 'people'},
    {id: 'productivity', name: 'Productivity', icon: 'work'},
    {id: 'entertainment', name: 'Entertainment', icon: 'movie'},
    {id: 'utilities', name: 'Utilities', icon: 'build'},
    {id: 'games', name: 'Games', icon: 'sports-esports'},
  ];

  useEffect(() => {
    loadApps();
    loadFavorites();
    loadRecentApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchQuery, selectedCategory]);

  const loadApps = () => {
    const mockApps = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        icon: 'chat',
        category: 'social',
        lastUsed: Date.now() - 3600000,
      },
      {
        packageName: 'com.google.android.apps.maps',
        appName: 'Google Maps',
        icon: 'map',
        category: 'utilities',
        lastUsed: Date.now() - 7200000,
      },
      {
        packageName: 'com.netflix.mediaclient',
        appName: 'Netflix',
        icon: 'movie',
        category: 'entertainment',
        lastUsed: Date.now() - 86400000,
      },
      {
        packageName: 'com.google.android.apps.docs',
        appName: 'Google Docs',
        icon: 'description',
        category: 'productivity',
        lastUsed: Date.now() - 172800000,
      },
      {
        packageName: 'com.spotify.music',
        appName: 'Spotify',
        icon: 'music-note',
        category: 'entertainment',
        lastUsed: Date.now() - 43200000,
      },
      {
        packageName: 'com.instagram.android',
        appName: 'Instagram',
        icon: 'camera-alt',
        category: 'social',
        lastUsed: Date.now() - 1800000,
      },
    ];
    setApps(mockApps);
  };

  const loadFavorites = () => {
    setFavorites(['com.whatsapp', 'com.google.android.apps.maps']);
  };

  const loadRecentApps = () => {
    setRecentApps(['com.whatsapp', 'com.instagram.android', 'com.spotify.music']);
  };

  const filterApps = () => {
    let filtered = apps;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(app =>
        app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApps(filtered);
  };

  const launchApp = (packageName) => {
    // In a real implementation, this would use the LauncherManager
    console.log(`Launching app: ${packageName}`);
    // Add to recent apps
    setRecentApps(prev => {
      const filtered = prev.filter(app => app !== packageName);
      return [packageName, ...filtered.slice(0, 9)];
    });
  };

  const toggleFavorite = (packageName) => {
    setFavorites(prev => {
      if (prev.includes(packageName)) {
        return prev.filter(app => app !== packageName);
      } else {
        return [...prev, packageName];
      }
    });
  };

  const renderAppItem = ({item}) => {
    const isFavorite = favorites.includes(item.packageName);
    const isRecent = recentApps.includes(item.packageName);

    return (
      <TouchableOpacity
        style={styles.appItem}
        onPress={() => launchApp(item.packageName)}
        onLongPress={() => toggleFavorite(item.packageName)}>
        <View style={styles.appIcon}>
          <Icon name={item.icon} size={32} color="#fff" />
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.appName}</Text>
          <Text style={styles.appPackage}>{item.packageName}</Text>
        </View>
        <View style={styles.appActions}>
          {isFavorite && <Icon name="star" size={16} color="#FFD700" />}
          {isRecent && <Icon name="access-time" size={16} color="#4CAF50" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.id)}>
      <Icon 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.id ? '#fff' : '#888'} 
      />
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const FavoriteApps = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Favorites</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {favorites.map(packageName => {
          const app = apps.find(a => a.packageName === packageName);
          if (!app) return null;
          return (
            <TouchableOpacity
              key={packageName}
              style={styles.favoriteApp}
              onPress={() => launchApp(packageName)}>
              <View style={styles.favoriteAppIcon}>
                <Icon name={app.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.favoriteAppName}>{app.appName}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search apps..."
          placeholderTextColor="#888"
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />
      </View>

      {/* Favorites */}
      <FavoriteApps />

      {/* Apps List */}
      <View style={styles.appsContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.name}
          {searchQuery && ` - "${searchQuery}"`}
        </Text>
        <FlatList
          data={filteredApps}
          renderItem={renderAppItem}
          keyExtractor={item => item.packageName}
          showsVerticalScrollIndicator={false}
          style={styles.appsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    margin: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: '#16213e',
  },
  categoryItemSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryName: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  categoryNameSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  favoriteApp: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 80,
  },
  favoriteAppIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteAppName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  appsContainer: {
    flex: 1,
  },
  appsList: {
    paddingHorizontal: 15,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  appPackage: {
    fontSize: 12,
    color: '#888',
  },
  appActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LauncherScreen;