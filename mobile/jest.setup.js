import 'react-native-gesture-handler/jestSetup'
import '@testing-library/jest-native/extend-expect'

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    name: 'MockScreen',
    path: 'mock-screen',
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  createNavigationContainerRef: jest.fn(),
}))

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  addEventListener: jest.fn(),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {
      isConnectionExpensive: false,
    },
  })),
}))

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve('mockResult')),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

// Mock Permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  openSettings: jest.fn(() => Promise.resolve()),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}))

// Mock Biometrics
jest.mock('react-native-biometrics', () => ({
  isSensorAvailable: jest.fn(() => Promise.resolve({ available: true, biometryType: 'TouchID' })),
  createKeys: jest.fn(() => Promise.resolve({ publicKey: 'mockPublicKey' })),
  createSignature: jest.fn(() => Promise.resolve({ success: true, signature: 'mockSignature' })),
  deleteKeys: jest.fn(() => Promise.resolve({ keysDeleted: true })),
}))

// Mock Camera
jest.mock('react-native-camera', () => 'Camera')

// Mock Image Picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn((options, callback) => {
    callback({
      assets: [{ uri: 'mock-image-uri', fileName: 'mock-image.jpg' }],
    })
  }),
  launchImageLibrary: jest.fn((options, callback) => {
    callback({
      assets: [{ uri: 'mock-image-uri', fileName: 'mock-image.jpg' }],
    })
  }),
}))

// Mock Geolocation
jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}))

// Mock Device Info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getBundleId: jest.fn(() => 'com.sallie.mobile'),
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '15.0'),
  getModel: jest.fn(() => 'iPhone'),
  getDeviceId: jest.fn(() => 'iPhone12,1'),
  isEmulator: jest.fn(() => false),
  isTablet: jest.fn(() => false),
  hasNotch: jest.fn(() => true),
  getUniqueId: jest.fn(() => 'unique-device-id'),
}))

// Mock Push Notifications
jest.mock('@react-native-firebase/messaging', () => ({
  requestPermission: jest.fn(() => Promise.resolve(1)),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: jest.fn(() => jest.fn()),
  setBackgroundMessageHandler: jest.fn(),
  deleteToken: jest.fn(() => Promise.resolve()),
}))

// Mock Push Notification iOS
jest.mock('@react-native-community/push-notification-ios', () => ({
  requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  getApplicationIconBadgeNumber: jest.fn(() => Promise.resolve(0)),
  setApplicationIconBadgeNumber: jest.fn(),
}))

// Mock WebView
jest.mock('react-native-webview', () => 'WebView')

// Mock File System
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  readFile: jest.fn(() => Promise.resolve('mock file content')),
  writeFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
  stat: jest.fn(() => Promise.resolve({ size: 1024, isFile: () => true, isDirectory: () => false })),
}))

// Mock Slider
jest.mock('react-native-slider', () => 'Slider')

// Mock Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')
jest.mock('react-native-vector-icons/Feather', () => 'Icon')
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon')

// Mock Paper components
jest.mock('react-native-paper', () => ({
  Button: 'Button',
  TextInput: 'TextInput',
  Card: 'Card',
  Title: 'Title',
  Paragraph: 'Paragraph',
  Provider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View')
  return {
    SwipeableRow: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  }
})

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

// Global test utilities
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock timers
jest.useFakeTimers()
