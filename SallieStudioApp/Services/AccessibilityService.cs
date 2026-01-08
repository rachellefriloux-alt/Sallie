using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Automation.Peers;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Windows.ApplicationModel.DataTransfer;
using Windows.Storage;
using Windows.System;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace SallieStudioApp.Services
{
    public class AccessibilityService : INotifyPropertyChanged
    {
        #region Singleton
        private static AccessibilityService _instance;
        public static AccessibilityService Instance => _instance ??= new AccessibilityService();
        #endregion

        #region Properties
        private AccessibilitySettings _settings = new();
        public AccessibilitySettings Settings
        {
            get => _settings;
            set
            {
                if (_settings != value)
                {
                    _settings = value;
                    OnPropertyChanged();
                    ApplySettings();
                    SaveSettings();
                }
            }
        }

        private ObservableCollection<AccessibilityAnnouncement> _announcements = new();
        public ObservableCollection<AccessibilityAnnouncement> Announcements
        {
            get => _announcements;
            set
            {
                if (_announcements != value)
                {
                    _announcements = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _isInitialized = false;
        public bool IsInitialized
        {
            get => _isInitialized;
            set
            {
                if (_isInitialized != value)
                {
                    _isInitialized = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Events
        public event EventHandler<string> AnnouncementMade;
        public event EventHandler<AccessibilitySettings> SettingsChanged;
        public event PropertyChangedEventHandler PropertyChanged;
        #endregion

        #region Private Fields
        private DispatcherQueue _dispatcherQueue;
        private UISettings _uiSettings;
        private Timer _announcementCleanupTimer;
        private readonly object _lockObject = new object();
        #endregion

        private AccessibilityService()
        {
            _dispatcherQueue = DispatcherQueue.GetForCurrentThread();
            _uiSettings = new UISettings();
            InitializeAccessibility();
        }

        #region Initialization
        private async void InitializeAccessibility()
        {
            try
            {
                await LoadSettings();
                DetectSystemPreferences();
                SetupEventHandlers();
                SetupAnnouncementCleanup();
                
                IsInitialized = true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing accessibility: {ex.Message}");
            }
        }

        private async Task LoadSettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                if (settings.Values.TryGetValue("AccessibilitySettings", out var settingsValue) && 
                    settingsValue is string settingsJson)
                {
                    Settings = System.Text.Json.JsonSerializer.Deserialize<AccessibilitySettings>(settingsJson);
                }
                else
                {
                    Settings = new AccessibilitySettings();
                    await SaveSettings();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading accessibility settings: {ex.Message}");
                Settings = new AccessibilitySettings();
            }
        }

        private async Task SaveSettings()
        {
            try
            {
                var settings = ApplicationData.Current.LocalSettings;
                var settingsJson = System.Text.Json.JsonSerializer.Serialize(Settings);
                settings.Values["AccessibilitySettings"] = settingsJson;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error saving accessibility settings: {ex.Message}");
            }
        }

        private void DetectSystemPreferences()
        {
            // Detect high contrast
            if (_uiSettings.HighContrastScheme != null)
            {
                Settings.HighContrast = true;
            }

            // Detect system font size
            var systemFontSize = _uiSettings.TextScaleFactor;
            if (systemFontSize > 1.2)
            {
                Settings.FontSize = FontSize.Large;
            }
            else if (systemFontSize > 1.0)
            {
                Settings.FontSize = FontSize.Medium;
            }
            else
            {
                Settings.FontSize = FontSize.Small;
            }

            // Listen for system changes
            _uiSettings.AdvancedEffectsEnabledChanged += OnAdvancedEffectsEnabledChanged;
            _uiSettings.ColorValuesChanged += OnColorValuesChanged;
            _uiSettings.TextScaleFactorChanged += OnTextScaleFactorChanged;
        }

        private void SetupEventHandlers()
        {
            // Setup keyboard navigation
            SetupKeyboardNavigation();

            // Setup screen reader detection
            SetupScreenReaderDetection();

            // Setup voice control
            if (Settings.VoiceControl)
            {
                SetupVoiceControl();
            }
        }

        private void SetupKeyboardNavigation()
        {
            // Handle keyboard navigation events
            Window.Current.CoreWindow.KeyDown += OnKeyDown;
            Window.Current.CoreWindow.PointerPressed += OnPointerPressed;
        }

        private void SetupScreenReaderDetection()
        {
            // Windows has built-in screen reader support (Narrator)
            // We can detect if it's running through system events
        }

        private void SetupVoiceControl()
        {
            // Initialize Windows Speech Platform for voice control
            // This would require additional setup and permissions
        }

        private void SetupAnnouncementCleanup()
        {
            _announcementCleanupTimer = new Timer(async _ =>
            {
                await CleanupAnnouncements();
            }, null, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1));
        }
        #endregion

        #region Settings Application
        private void ApplySettings()
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                ApplyFontSize();
                ApplyHighContrast();
                ApplyReducedMotion();
                ApplyFocusVisible();
                ApplyColorBlindness();
                ApplyReadabilitySettings();
            });

            SettingsChanged?.Invoke(this, Settings);
        }

        private void ApplyFontSize()
        {
            var fontSizes = new Dictionary<FontSize, double>
            {
                { FontSize.Small, 14 },
                { FontSize.Medium, 16 },
                { FontSize.Large, 18 },
                { FontSize.ExtraLarge, 20 },
            };

            var fontSize = fontSizes[Settings.FontSize];
            Application.Current.Resources["AccessibilityFontSize"] = fontSize;
        }

        private void ApplyHighContrast()
        {
            if (Settings.HighContrast)
            {
                Application.Current.Resources["AccessibilityHighContrast"] = true;
                // Apply high contrast theme
                ApplyHighContrastTheme();
            }
            else
            {
                Application.Current.Resources["AccessibilityHighContrast"] = false;
                // Restore normal theme
                RestoreNormalTheme();
            }
        }

        private void ApplyReducedMotion()
        {
            if (Settings.ReducedMotion || Settings.ReducedAnimations)
            {
                Application.Current.Resources["AccessibilityReducedMotion"] = true;
                // Disable animations
                DisableAnimations();
            }
            else
            {
                Application.Current.Resources["AccessibilityReducedMotion"] = false;
                // Enable animations
                EnableAnimations();
            }
        }

        private void ApplyFocusVisible()
        {
            if (Settings.FocusVisible)
            {
                Application.Current.Resources["AccessibilityFocusVisible"] = true;
                // Enable focus indicators
                EnableFocusIndicators();
            }
            else
            {
                Application.Current.Resources["AccessibilityFocusVisible"] = false;
                // Disable focus indicators
                DisableFocusIndicators();
            }
        }

        private void ApplyColorBlindness()
        {
            // Apply color blindness filters
            var filter = GetColorBlindnessFilter(Settings.ColorBlindness);
            Application.Current.Resources["AccessibilityColorFilter"] = filter;
        }

        private void ApplyReadabilitySettings()
        {
            if (Settings.ReadableFonts)
            {
                Application.Current.Resources["AccessibilityReadableFonts"] = true;
                // Apply readable fonts
                ApplyReadableFonts();
            }
            else
            {
                Application.Current.Resources["AccessibilityReadableFonts"] = false;
            }

            if (Settings.SimpleInterface)
            {
                Application.Current.Resources["AccessibilitySimpleInterface"] = true;
                // Apply simple interface
                ApplySimpleInterface();
            }
            else
            {
                Application.Current.Resources["AccessibilitySimpleInterface"] = false;
            }
        }
        #endregion

        #region Public Methods
        public void UpdateSettings(Action<AccessibilitySettings> updateAction)
        {
            var newSettings = Settings.Clone();
            updateAction(newSettings);
            Settings = newSettings;
        }

        public void Announce(string message, AnnouncementPriority priority = AnnouncementPriority.Polite)
        {
            var announcement = new AccessibilityAnnouncement
            {
                Id = Guid.NewGuid().ToString(),
                Message = message,
                Priority = priority,
                Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                ClearAfter = 5000, // Clear after 5 seconds
            };

            _dispatcherQueue.TryEnqueue(() =>
            {
                Announcements.Add(announcement);
                AnnouncementMade?.Invoke(this, message);
            });

            // Announce to screen reader
            AnnounceToScreenReader(message, priority);
        }

        public void AnnounceToScreenReader(string message, AnnouncementPriority priority = AnnouncementPriority.Polite)
        {
            try
            {
                // Use Windows UI Automation to announce to screen readers
                var peer = FrameworkElementAutomationPeer.FromElement(Window.Current.Content);
                if (peer != null)
                {
                    peer.RaiseNotificationEvent(
                        AutomationNotificationKind.Other,
                        AutomationNotificationProcessing.ImportantMostRecent,
                        message,
                        "SallieStudio"
                    );
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error announcing to screen reader: {ex.Message}");
            }
        }

        public void SetFocus(FrameworkElement element)
        {
            _dispatcherQueue.TryEnqueue(() =>
            {
                if (element != null)
                {
                    element.Focus(FocusState.Programmatic);
                    Announce($"Focused on {GetElementDescription(element)}");
                }
            });
        }

        public IDisposable TrapFocus(FrameworkElement container)
        {
            var focusTrap = new FocusTrap(container);
            return focusTrap;
        }

        public double GetContrastRatio(string foreground, string background)
        {
            var foregroundLuminance = GetLuminance(foreground);
            var backgroundLuminance = GetLuminance(background);

            var lighter = Math.Max(foregroundLuminance, backgroundLuminance);
            var darker = Math.Min(foregroundLuminance, backgroundLuminance);

            return (lighter + 0.05) / (darker + 0.05);
        }

        public bool IsColorAccessible(string foreground, string background)
        {
            var ratio = GetContrastRatio(foreground, background);
            return ratio >= 4.5; // WCAG AA standard
        }

        public string GetAccessibleColor(string color)
        {
            var rgb = HexToRgb(color);
            if (rgb == null) return color;

            var brightness = (rgb.Item1 * 299 + rgb.Item2 * 587 + rgb.Item3 * 114) / 1000;

            // Return black or white based on brightness
            return brightness > 128 ? "#000000" : "#FFFFFF";
        }

        public void TriggerHapticFeedback(HapticType type)
        {
            // Windows doesn't have built-in haptic feedback for desktop apps
            // This could be implemented with additional hardware or vibration APIs
        }

        public void HandleVoiceCommand(string command)
        {
            // Handle voice commands
            if (command.Contains("navigate"))
            {
                var page = command.Replace("navigate", "").Trim();
                Announce($"Navigating to {page}");
            }
            else if (command.Contains("click"))
            {
                var element = command.Replace("click", "").Trim();
                Announce($"Clicking {element}");
            }
            else if (command.Contains("scroll"))
            {
                Announce("Scrolling");
            }
        }
        #endregion

        #region Private Methods
        private void OnKeyDown(Windows.UI.Core.CoreWindow sender, Windows.UI.Core.KeyEventArgs args)
        {
            if (args.VirtualKey == Windows.System.VirtualKey.Tab)
            {
                // Handle tab navigation
                Window.Current.Content.AddHandler(UIElement.KeyDownEvent, new KeyEventHandler(OnTabKeyDown), true);
            }
        }

        private void OnPointerPressed(object sender, Windows.UI.Core.PointerEventArgs args)
        {
            // Handle mouse interactions to remove keyboard navigation indicators
            Window.Current.Content.RemoveHandler(UIElement.KeyDownEvent, new KeyEventHandler(OnTabKeyDown));
        }

        private void OnTabKeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Tab)
            {
                // Add keyboard navigation styling
                VisualStateManager.GoToState(Window.Current.Content as Control, "KeyboardNavigation", true);
            }
        }

        private void OnAdvancedEffectsEnabledChanged(UISettings sender, object args)
        {
            Settings.ReducedTransparency = !sender.AdvancedEffectsEnabled;
        }

        private void OnColorValuesChanged(UISettings sender, object args)
        {
            Settings.HighContrast = sender.HighContrastScheme != null;
        }

        private void OnTextScaleFactorChanged(UISettings sender, object args)
        {
            var scaleFactor = sender.TextScaleFactor;
            if (scaleFactor > 1.2)
            {
                Settings.FontSize = FontSize.Large;
            }
            else if (scaleFactor > 1.0)
            {
                Settings.FontSize = FontSize.Medium;
            }
            else
            {
                Settings.FontSize = FontSize.Small;
            }
        }

        private string GetColorBlindnessFilter(ColorBlindnessType type)
        {
            return type switch
            {
                ColorBlindnessType.Protanopia => "url(#protanopia-filter)",
                ColorBlindnessType.Deuteranopia => "url(#deuteranopia-filter)",
                ColorBlindnessType.Tritanopia => "url(#tritanopia-filter)",
                _ => "none",
            };
        }

        private double GetLuminance(string color)
        {
            var rgb = HexToRgb(color);
            if (rgb == null) return 0;

            var (r, g, b) = rgb;
            var rLinear = r / 255.0;
            var gLinear = g / 255.0;
            var bLinear = b / 255.0;

            var rSrgb = rLinear <= 0.03928 ? rLinear / 12.92 : Math.Pow((rLinear + 0.055) / 1.055, 2.4);
            var gSrgb = gLinear <= 0.03928 ? gLinear / 12.92 : Math.Pow((gLinear + 0.055) / 1.055, 2.4);
            var bSrgb = bLinear <= 0.03928 ? bLinear / 12.92 : Math.Pow((bLinear + 0.055) / 1.055, 2.4);

            return 0.2126 * rSrgb + 0.7152 * gSrgb + 0.0722 * bSrgb;
        }

        private (int, int, int) HexToRgb(string hex)
        {
            if (string.IsNullOrWhiteSpace(hex) || !hex.StartsWith("#"))
                return (0, 0, 0);

            hex = hex.Substring(1);
            if (hex.Length != 6)
                return (0, 0, 0);

            try
            {
                var r = Convert.ToInt32(hex.Substring(0, 2), 16);
                var g = Convert.ToInt32(hex.Substring(2, 2), 16);
                var b = Convert.ToInt32(hex.Substring(4, 2), 16);
                return (r, g, b);
            }
            catch
            {
                return (0, 0, 0);
            }
        }

        private string GetElementDescription(FrameworkElement element)
        {
            // Try to get accessibility description
            var automationProperties = AutomationProperties.GetName(element);
            if (!string.IsNullOrEmpty(automationProperties))
                return automationProperties;

            // Try to get text content
            if (element is TextBlock textBlock)
                return textBlock.Text;

            if (element is Button button)
                return button.Content?.ToString() ?? "button";

            if (element is TextBox textBox)
                return textBox.PlaceholderText ?? "text input";

            return "element";
        }

        private async Task CleanupAnnouncements()
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var expiredAnnouncements = new List<AccessibilityAnnouncement>();

            lock (_lockObject)
            {
                foreach (var announcement in Announcements)
                {
                    if (announcement.ClearAfter.HasValue && now - announcement.Timestamp > announcement.ClearAfter.Value)
                    {
                        expiredAnnouncements.Add(announcement);
                    }
                }
            }

            if (expiredAnnouncements.Count > 0)
            {
                _dispatcherQueue.TryEnqueue(() =>
                {
                    foreach (var announcement in expiredAnnouncements)
                    {
                        Announcements.Remove(announcement);
                    }
                });
            }
        }

        private void ApplyHighContrastTheme()
        {
            // Apply high contrast colors
            Application.Current.Resources["SystemControlForegroundBaseHighBrush"] = new SolidColorBrush(Windows.UI.Colors.White);
            Application.Current.Resources["SystemControlBackgroundBaseHighBrush"] = new SolidColorBrush(Windows.UI.Colors.Black);
        }

        private void RestoreNormalTheme()
        {
            // Restore normal colors
            Application.Current.Resources["SystemControlForegroundBaseHighBrush"] = new SolidColorBrush(Windows.UI.Colors.Black);
            Application.Current.Resources["SystemControlBackgroundBaseHighBrush"] = new SolidColorBrush(Windows.UI.Colors.White);
        }

        private void DisableAnimations()
        {
            // Disable animations by setting duration to 0
            Application.Current.Resources["AnimationDuration"] = TimeSpan.FromMilliseconds(0);
        }

        private void EnableAnimations()
        {
            // Enable animations by restoring normal duration
            Application.Current.Resources["AnimationDuration"] = TimeSpan.FromMilliseconds(200);
        }

        private void EnableFocusIndicators()
        {
            // Enable focus indicators
            Application.Current.Resources["FocusStrokeColor"] = new SolidColorBrush(Windows.UI.Colors.Black);
            Application.Current.Resources["FocusStrokeThickness"] = new Thickness(2);
        }

        private void DisableFocusIndicators()
        {
            // Disable focus indicators
            Application.Current.Resources["FocusStrokeColor"] = new SolidColorBrush(Windows.UI.Colors.Transparent);
            Application.Current.Resources["FocusStrokeThickness"] = new Thickness(0);
        }

        private void ApplyReadableFonts()
        {
            // Apply readable fonts
            Application.Current.Resources["ContentControlThemeFontFamily"] = new FontFamily("Segoe UI");
        }

        private void ApplySimpleInterface()
        {
            // Apply simple interface
            Application.Current.Resources["SimpleInterfaceMode"] = true;
        }

        private void SetupVoiceControl()
        {
            // Setup Windows Speech Platform for voice control
            // This would require additional setup and permissions
        }
        #endregion

        #region INotifyPropertyChanged
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        #endregion
    }

    #region Supporting Classes
    public class AccessibilitySettings : INotifyPropertyChanged
    {
        private FontSize _fontSize = FontSize.Medium;
        public FontSize FontSize
        {
            get => _fontSize;
            set
            {
                if (_fontSize != value)
                {
                    _fontSize = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _highContrast = false;
        public bool HighContrast
        {
            get => _highContrast;
            set
            {
                if (_highContrast != value)
                {
                    _highContrast = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _reducedMotion = false;
        public bool ReducedMotion
        {
            get => _reducedMotion;
            set
            {
                if (_reducedMotion != value)
                {
                    _reducedMotion = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _screenReader = false;
        public bool ScreenReader
        {
            get => _screenReader;
            set
            {
                if (_screenReader != value)
                {
                    _screenReader = value;
                    OnPropertyChanged();
                }
            }
        }

        private ColorBlindnessType _colorBlindness = ColorBlindnessType.None;
        public ColorBlindnessType ColorBlindness
        {
            get => _colorBlindness;
            set
            {
                if (_colorBlindness != value)
                {
                    _colorBlindness = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _keyboardNavigation = true;
        public bool KeyboardNavigation
        {
            get => _keyboardNavigation;
            set
            {
                if (_keyboardNavigation != value)
                {
                    _keyboardNavigation = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _focusVisible = true;
        public bool FocusVisible
        {
            get => _focusVisible;
            set
            {
                if (_focusVisible != value)
                {
                    _focusVisible = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _altText = true;
        public bool AltText
        {
            get => _altText;
            set
            {
                if (_altText != value)
                {
                    _altText = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _captions = false;
        public bool Captions
        {
            get => _captions;
            set
            {
                if (_captions != value)
                {
                    _captions = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _readableFonts = false;
        public bool ReadableFonts
        {
            get => _readableFonts;
            set
            {
                if (_readableFonts != value)
                {
                    _readableFonts = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _reducedAnimations = false;
        public bool ReducedAnimations
        {
            get => _reducedAnimations;
            set
            {
                if (_reducedAnimations != value)
                {
                    _reducedAnimations = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _simpleInterface = false;
        public bool SimpleInterface
        {
            get => _simpleInterface;
            set
            {
                if (_simpleInterface != value)
                {
                    _simpleInterface = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _voiceControl = false;
        public bool VoiceControl
        {
            get => _voiceControl;
            set
            {
                if (_voiceControl != value)
                {
                    _voiceControl = value;
                    OnPropertyChanged();
                }
            }
        }

        private bool _reduceTransparency = false;
        public bool ReduceTransparency
        {
            get => _reduceTransparency;
            set
            {
                if (_reduceTransparency != value)
                {
                    _reduceTransparency = value;
                    OnPropertyChanged();
                }
            }
        }

        public AccessibilitySettings Clone()
        {
            return new AccessibilitySettings
            {
                FontSize = this.FontSize,
                HighContrast = this.HighContrast,
                ReducedMotion = this.ReducedMotion,
                ScreenReader = this.ScreenReader,
                ColorBlindness = this.ColorBlindness,
                KeyboardNavigation = this.KeyboardNavigation,
                FocusVisible = this.FocusVisible,
                AltText = this.AltText,
                Captions = this.Captions,
                ReadableFonts = this.ReadableFonts,
                ReducedAnimations = this.ReducedAnimations,
                SimpleInterface = this.SimpleInterface,
                VoiceControl = this.VoiceControl,
                ReduceTransparency = this.ReduceTransparency,
            };
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class AccessibilityAnnouncement
    {
        public string Id { get; set; }
        public string Message { get; set; }
        public AnnouncementPriority Priority { get; set; }
        public long Timestamp { get; set; }
        public long? ClearAfter { get; set; }
    }

    public class FocusTrap : IDisposable
    {
        private readonly FrameworkElement _container;
        private readonly List<FrameworkElement> _focusableElements = new();

        public FocusTrap(FrameworkElement container)
        {
            _container = container;
            SetupFocusTrap();
        }

        private void SetupFocusTrap()
        {
            // Find all focusable elements in the container
            FindFocusableElements(_container);
            
            // Set up keyboard navigation
            _container.KeyDown += OnKeyDown;
        }

        private void FindFocusableElements(DependencyObject parent)
        {
            var childrenCount = VisualTreeHelper.GetChildrenCount(parent);
            for (int i = 0; i < childrenCount; i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is FrameworkElement element && IsFocusable(element))
                {
                    _focusableElements.Add(element);
                }
                FindFocusableElements(child);
            }
        }

        private bool IsFocusable(FrameworkElement element)
        {
            return element.IsTabStop && element.IsEnabled && element.Visibility == Visibility.Visible;
        }

        private void OnKeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Tab && _focusableElements.Count > 0)
            {
                var currentIndex = _focusableElements.IndexOf(FocusManager.GetFocusedElement() as FrameworkElement);
                
                if (e.Key == Windows.System.VirtualKey.Tab)
                {
                    if (!e.ShiftDown)
                    {
                        // Tab forward
                        var nextIndex = (currentIndex + 1) % _focusableElements.Count;
                        _focusableElements[nextIndex].Focus(FocusState.Programmatic);
                    }
                    else
                    {
                        // Shift+Tab backward
                        var prevIndex = currentIndex <= 0 ? _focusableElements.Count - 1 : currentIndex - 1;
                        _focusableElements[prevIndex].Focus(FocusState.Programmatic);
                    }
                    
                    e.Handled = true;
                }
            }
        }

        public void Dispose()
        {
            _container.KeyDown -= OnKeyDown;
        }
    }

    public enum FontSize
    {
        Small,
        Medium,
        Large,
        ExtraLarge
    }

    public enum ColorBlindnessType
    {
        None,
        Protanopia,
        Deuteranopia,
        Tritanopia
    }

    public enum AnnouncementPriority
    {
        Polite,
        Assertive,
        Off
    }

    public enum HapticType
    {
        Light,
        Medium,
        Heavy,
        Success,
        Warning,
        Error
    }
    #endregion
}
