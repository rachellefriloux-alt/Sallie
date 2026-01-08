import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Emoji categories with their emojis
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    ],
  },
  {
    id: 'people',
    name: 'People',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎',
      '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
      '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠',
      '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
      '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
      '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
      '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞',
      '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
      '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '🤾',
      '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵',
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
      '🚁', '🛩️', '✈️', '🪂', '🚀', '🛸', '🚢', '⛵', '🪝', '⚓',
      '🪝', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🗺️', '🗿',
      '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '📼',
      '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️',
      '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡',
      '🔋', '🔌', '💡', '🕯️', '🪔', '🔦', '🏮', '🪔', '📔', '📕',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❤️‍🔥', '❤️‍🩹',
      '🧡‍🔥', '💛‍🔥', '💚‍🔥', '💙‍🔥', '💜‍🔥', '🤍‍🔥', '🖤‍🔥', '💔‍🔥', '❤️‍💔', '🧡‍💔',
      '💛‍💔', '💚‍💔', '💙‍💔', '💜‍💔', '🤍‍💔', '🖤‍💔', '💯', '💢', '💥', '💫',
      '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    emojis: [
      '🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🪧', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇺🇸',
      '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷',
      '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾',
      '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴',
      '🇻🇬', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇨🇻', '🇰🇾',
    ],
  },
];

// Recent emojis storage key
const RECENT_EMOJIS_KEY = 'sallie_recent_emojis';

interface EmojiPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onSelect,
  onClose,
  theme = 'dark',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Load recent emojis on mount
  useEffect(() => {
    loadRecentEmojis();
  }, []);

  // Load recent emojis from storage
  const loadRecentEmojis = async () => {
    try {
      // In a real app, you'd use AsyncStorage here
      // For now, we'll use a default set
      setRecentEmojis(['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🎯']);
    } catch (error) {
      console.error('Failed to load recent emojis:', error);
    }
  };

  // Save emoji to recent
  const saveToRecent = useCallback(async (emoji: string) => {
    try {
      const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
      setRecentEmojis(updated);
      // In a real app, you'd save to AsyncStorage here
    } catch (error) {
      console.error('Failed to save recent emoji:', error);
    }
  }, [recentEmojis]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveToRecent(emoji);
    onSelect(emoji);
    onClose();
  }, [onSelect, onClose, saveToRecent]);

  // Filter emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery) return [];
    
    const allEmojis = EMOJI_CATEGORIES.flatMap(cat => cat.emojis);
    return allEmojis.filter(emoji => 
      emoji.includes(searchQuery) || 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get current category emojis
  const currentEmojis = useMemo(() => {
    if (searchQuery) return filteredEmojis;
    
    const category = EMOJI_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category ? category.emojis : [];
  }, [selectedCategory, searchQuery, filteredEmojis]);

  // Animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Render emoji item
  const renderEmojiItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.emojiItem}
      onPress={() => handleEmojiSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.emojiText}>{item}</Text>
    </TouchableOpacity>
  );

  // Render category tab
  const renderCategoryTab = (category: typeof EMOJI_CATEGORIES[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.categoryTabActive,
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        setSelectedCategory(category.id);
        setSearchQuery('');
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category.id && styles.categoryTabTextActive,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Picker Container */}
      <Animated.View
        style={[
          styles.pickerContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeButtonText, { color: theme === 'dark' ? '#ffffff' : '#000000' }]}>
              ✕
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme === 'dark' ? '#ffffff' : '#000000' }]}>
            Emoji Picker
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { borderColor: theme === 'dark' ? '#333333' : '#e0e0e0' }]}>
          <Text style={[styles.searchIcon, { color: theme === 'dark' ? '#666666' : '#999999' }]}>
            🔍
          </Text>
          <Text
            style={[
              styles.searchInput,
              { color: theme === 'dark' ? '#ffffff' : '#000000' },
            ]}
            placeholder="Search emojis..."
            placeholderTextColor={theme === 'dark' ? '#666666' : '#999999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Recent Emojis */}
        {recentEmojis.length > 0 && !searchQuery && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#ffffff' : '#000000' }]}>
              Recently Used
            </Text>
            <FlatList
              data={recentEmojis}
              renderItem={renderEmojiItem}
              keyExtractor={(item, index) => `recent-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentEmojisContainer}
            />
          </View>
        )}

        {/* Category Tabs */}
        {!searchQuery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsContainer}
            style={styles.categoryTabsScroll}
          >
            {EMOJI_CATEGORIES.map(renderCategoryTab)}
          </ScrollView>
        )}

        {/* Emojis Grid */}
        <FlatList
          data={currentEmojis}
          renderItem={renderEmojiItem}
          keyExtractor={(item, index) => `emoji-${index}`}
          numColumns={8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emojisGrid}
          style={styles.emojisContainer}
        />

        {/* Footer */}
        <LinearGradient
          colors={theme === 'dark' ? ['#1a1a1a', '#2a2a2a'] : ['#ffffff', '#f5f5f5']}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: theme === 'dark' ? '#666666' : '#999999' }]}>
            {currentEmojis.length} emojis
          </Text>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  recentSection: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentEmojisContainer: {
    paddingRight: 15,
  },
  categoryTabsScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  categoryTabsContainer: {
    paddingHorizontal: 15,
  },
  categoryTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabActive: {
    backgroundColor: '#6366f1',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  emojisContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emojisGrid: {
    paddingBottom: 20,
  },
  emojiItem: {
    width: SCREEN_WIDTH / 8 - 5,
    height: SCREEN_WIDTH / 8 - 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2.5,
    marginVertical: 2.5,
  },
  emojiText: {
    fontSize: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default EmojiPicker;
