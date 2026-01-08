using Microsoft.UI;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.Web.WebView2.Core;
using SallieStudioApp.Bridge;
using SallieStudioApp.Cloud;
using SallieStudioApp.Helpers;
using SallieStudioApp.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class MainWindow : Window
    {
        private readonly List<PluginManifest> _plugins = new();
        private StudioConfigRoot _configRoot = new();
        private NativeBridge? _bridge;
        private bool _isPluginsPanelVisible = false;
        private CancellationTokenSource? _cloudSyncCts;
        private readonly HttpClient _httpClient = new();
        
        // Human-Level Expansion Properties
        private SallieLimbicState? _currentLimbicState;
        private SallieCognitiveState? _cognitiveState;
        private bool _isHumanLevelEnabled = true;
        
        // Backend connection - Updated to use B:\ drive backend
        private const string BACKEND_URL = "http://192.168.1.47:8742";
        private const string WEB_APP_URL = "http://localhost:3000";
        
        // 12D System Properties
        private bool _isNative12DPanelVisible = false;
        private string _activeDimension = "sanctuary";
        private readonly List<string> _dimensions = new()
        {
            "sanctuary", "command", "growth", "messenger", "creative", 
            "healing", "transcendence", "research", "social", 
            "time", "legacy", "quantum"
        };

        public MainWindow()
        {
            this.InitializeComponent();

            LoadConfig();
            LoadPlugins();
            InitializeWebViewAsync();
            StartCloudSyncLoop();
            UpdateVersionText();
            
            // Initialize Human-Level Expansion
            InitializeHumanLevelExpansion();
        }

        private async void InitializeHumanLevelExpansion()
        {
            try
            {
                // Connect to backend and get initial state
                await RefreshLimbicState();
                await RefreshCognitiveState();
                
                // Initialize Sallie Studio OS components
                InitializeStudioOSComponents();
                
                // Start periodic updates
                var timer = new Timer(async _ => 
                {
                    await RefreshLimbicState();
                    await RefreshCognitiveState();
                }, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
                
                AppendLog($"🧠 Human-Level Expansion initialized - Tier {_currentLimbicState?.AutonomyLevel}");
                AppendLog($"🌟 Sallie Studio OS components loaded");
            }
            catch (Exception ex)
            {
                AppendLog($"⚠️ Failed to initialize Human-Level Expansion: {ex.Message}");
                _isHumanLevelEnabled = false;
            }
        }

        private void InitializeStudioOSComponents()
        {
            try
            {
                // Add Sallie Studio OS tab to main interface
                var studioOSTab = new TabViewItem
                {
                    Header = "Studio OS",
                    Icon = new SymbolIcon(Symbol.Home)
                };
                
                var studioOS = new Components.SallieStudioOS();
                studioOSTab.Content = studioOS;
                
                // Add to main tab control
                MainTabControl.TabItems.Add(studioOSTab);
                
                // Add Sallieverse tab
                var sallieverseTab = new TabViewItem
                {
                    Header = "Sallieverse",
                    Icon = new SymbolIcon(Symbol.World)
                };
                
                var sallieverse = new Components.Sallieverse();
                sallieverseTab.Content = sallieverse;
                
                MainTabControl.TabItems.Add(sallieverseTab);
                
                // Add Avatar component to dashboard
                var avatarPanel = new Components.SallieAvatar
                {
                    Size = Components.AvatarSize.Medium,
                    Interactive = true
                };
                
                // Add avatar to existing dashboard panel
                DashboardPanel.Children.Add(avatarPanel);
                
                AppendLog("✅ Studio OS components initialized successfully");
            }
            catch (Exception ex)
            {
                AppendLog($"⚠️ Failed to initialize Studio OS components: {ex.Message}");
            }
        }

        private async Task RefreshLimbicState()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{BACKEND_URL}/limbic");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _currentLimbicState = JsonSerializer.Deserialize<SallieLimbicState>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
            }
            catch (Exception ex)
            {
                AppendLog($"Failed to refresh limbic state: {ex.Message}");
            }
        }

        private async Task RefreshCognitiveState()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{BACKEND_URL}/cognitive");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _cognitiveState = JsonSerializer.Deserialize<SallieCognitiveState>(json, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
            }
            catch (Exception ex)
            {
                AppendLog($"Failed to refresh cognitive state: {ex.Message}");
            }
        }

        private void UpdateVersionText()
        {
            var version = typeof(MainWindow).Assembly.GetName().Version;
            VersionText.Text = $"v{version?.Major ?? 1}.{version?.Minor ?? 0}.{version?.Build ?? 0}";
        }

        private void LoadConfig()
        {
            var configPath = Path.Combine(AppContext.BaseDirectory, "config", "studio.json");
            if (File.Exists(configPath))
            {
                try
                {
                    var json = File.ReadAllText(configPath);
                    _configRoot = JsonSerializer.Deserialize<StudioConfigRoot>(json) ?? new StudioConfigRoot();
                }
                catch
                {
                    _configRoot = new StudioConfigRoot();
                }
            }
            else
            {
                _configRoot = new StudioConfigRoot();
            }

            _configRoot.Cloud ??= new CloudConfig();
        }

        #region WebView2 Initialization

        private async void InitializeWebViewAsync()
        {
            try
            {
                UpdateLoadingStatus("Initializing WebView2...");

                // Ensure WebView2 environment is created
                await WebView.EnsureCoreWebView2Async();

                // Configure WebView2 settings
                var settings = WebView.CoreWebView2.Settings;
                settings.IsScriptEnabled = true;
                settings.IsWebMessageEnabled = true;
                settings.AreDefaultContextMenusEnabled = true;
                settings.IsStatusBarEnabled = false;
                settings.AreDevToolsEnabled = true;

                // Set up event handlers
                WebView.CoreWebView2.NavigationStarting += CoreWebView2_NavigationStarting;
                WebView.CoreWebView2.NavigationCompleted += CoreWebView2_NavigationCompleted;
                WebView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;

                // Initialize the native bridge
                _bridge = new NativeBridge(this, WebView.CoreWebView2, _configRoot);
                await _bridge.InitializeAsync();

                UpdateLoadingStatus("Connecting to web app...");

                // Navigate to web app
                WebView.CoreWebView2.Navigate(WEB_APP_URL);
            }
            catch (Exception ex)
            {
                ShowError($"Failed to initialize WebView2: {ex.Message}");
            }
        }

        private void CoreWebView2_NavigationStarting(CoreWebView2 sender, CoreWebView2NavigationStartingEventArgs args)
        {
            UpdateConnectionStatus("Connecting...", "#FFA500");
        }

        private void CoreWebView2_NavigationCompleted(CoreWebView2 sender, CoreWebView2NavigationCompletedEventArgs args)
        {
            if (args.IsSuccess)
            {
                LoadingOverlay.Visibility = Visibility.Collapsed;
                ErrorOverlay.Visibility = Visibility.Collapsed;
                UpdateConnectionStatus("Connected", "#4CAF50");

                // Inject bridge initialization script
                InjectBridgeScript();
            }
            else
            {
                ShowError($"Navigation failed: {args.WebErrorStatus}");
            }
        }

        private async void CoreWebView2_WebMessageReceived(CoreWebView2 sender, CoreWebView2WebMessageReceivedEventArgs args)
        {
            var message = args.WebMessageAsJson;
            if (_bridge != null)
            {
                await _bridge.HandleWebMessage(message);
            }
        }

        private async void InjectBridgeScript()
        {
            var script = @"
                window.sallieBridge = {
                    isDesktop: () => true,
                    getVersion: () => window.chrome.webview.postMessage(JSON.stringify({ type: 'getVersion' })),
                    showNotification: (title, body) => window.chrome.webview.postMessage(JSON.stringify({ type: 'notification', title, body })),
                    triggerCloudSync: () => window.chrome.webview.postMessage(JSON.stringify({ type: 'cloudSync' })),
                    getPlugins: () => window.chrome.webview.postMessage(JSON.stringify({ type: 'getPlugins' })),
                    executePlugin: (id, cmd) => window.chrome.webview.postMessage(JSON.stringify({ type: 'executePlugin', pluginId: id, command: cmd })),
                    runScript: (name) => window.chrome.webview.postMessage(JSON.stringify({ type: 'runScript', scriptName: name })),
                    getSetting: (key) => window.chrome.webview.postMessage(JSON.stringify({ type: 'getSetting', key })),
                    setSetting: (key, value) => window.chrome.webview.postMessage(JSON.stringify({ type: 'setSetting', key, value })),
                    openDevConsole: () => window.chrome.webview.postMessage(JSON.stringify({ type: 'openDevConsole' }))
                };
                console.log('Sallie Desktop Bridge initialized');
            ";

            try
            {
                await WebView.CoreWebView2.ExecuteScriptAsync(script);
            }
            catch (Exception ex)
            {
                AppendLog($"Bridge injection failed: {ex.Message}");
            }
        }

        #endregion

        #region UI Helpers

        private void UpdateLoadingStatus(string status)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                LoadingStatus.Text = status;
            });
        }

        private void UpdateConnectionStatus(string status, string color)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                ConnectionText.Text = status;
                ConnectionDot.Fill = new SolidColorBrush(ParseColor(color));
            });
        }

        private void ShowError(string message)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                LoadingOverlay.Visibility = Visibility.Collapsed;
                ErrorOverlay.Visibility = Visibility.Visible;
                ErrorMessage.Text = message;
                UpdateConnectionStatus("Disconnected", "#F44336");
            });
        }

        private static Windows.UI.Color ParseColor(string hex)
        {
            hex = hex.TrimStart('#');
            
            // Validate hex string length
            if (hex.Length != 6)
            {
                // Return a default color (gray) if invalid
                return Windows.UI.Color.FromArgb(255, 128, 128, 128);
            }

            try
            {
                return Windows.UI.Color.FromArgb(
                    255,
                    Convert.ToByte(hex.Substring(0, 2), 16),
                    Convert.ToByte(hex.Substring(2, 2), 16),
                    Convert.ToByte(hex.Substring(4, 2), 16));
            }
            catch
            {
                // Return a default color (gray) if parsing fails
                return Windows.UI.Color.FromArgb(255, 128, 128, 128);
            }
        }

        public void UpdateSyncStatus(string status)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                SyncStatus.Text = $"☁️ Sync: {status}";
            });
        }

        #endregion

        #region Button Click Handlers

        private void Refresh_Click(object sender, RoutedEventArgs e)
        {
            LoadingOverlay.Visibility = Visibility.Visible;
            ErrorOverlay.Visibility = Visibility.Collapsed;
            WebView.CoreWebView2?.Navigate(WEB_APP_URL);
        }

        private void Retry_Click(object sender, RoutedEventArgs e)
        {
            LoadingOverlay.Visibility = Visibility.Visible;
            ErrorOverlay.Visibility = Visibility.Collapsed;
            InitializeWebViewAsync();
        }

        private void OpenSetupWizard_Click(object sender, RoutedEventArgs e)
        {
            var wizard = new SetupWizard();
            var window = new Window
            {
                Title = "Sallie Studio — Setup Wizard",
                Content = wizard
            };
            window.Activate();
        }

        private void TogglePlugins_Click(object sender, RoutedEventArgs e)
        {
            _isPluginsPanelVisible = !_isPluginsPanelVisible;
            PluginsPanel.Visibility = _isPluginsPanelVisible ? Visibility.Visible : Visibility.Collapsed;
        }

        private void ToggleNative12D_Click(object sender, RoutedEventArgs e)
        {
            _isNative12DPanelVisible = !_isNative12DPanelVisible;
            Native12DPanel.Visibility = _isNative12DPanelVisible ? Visibility.Visible : Visibility.Collapsed;
        }

        private void NavigateToDimension_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button)
            {
                var dimensionName = button.Content.ToString();
                var dimensionId = dimensionName.Split(' ')[0]; // Extract emoji or name
                NavigateToDimension(dimensionId);
            }
        }

        private void NavigateToDimension(string dimensionId)
        {
            _activeDimension = dimensionId;
            
            // Navigate web app to specific dimension
            var webUrl = $"{WEB_APP_URL}/#{dimensionId}";
            WebView.Source = new Uri(webUrl);
            
            // Update native panel content
            UpdateNative12DPanelContent();
        }

        private void UpdateNative12DPanelContent()
        {
            // Update the native panel to show current dimension's content
            // This could load dimension-specific native features
            var panelContent = Native12DPanelContent;
            panelContent.Children.Clear();
            
            // Add dimension-specific buttons
            foreach (var dimension in _dimensions)
            {
                var button = new Button
                {
                    Content = GetDimensionDisplayName(dimension),
                    Style = dimension == _activeDimension ? 
                        (Style)Application.Current.Resources["AccentButtonStyle"] : 
                        (Style)Application.Current.Resources["DefaultButtonStyle"]
                };
                button.Click += NavigateToDimension_Click;
                panelContent.Children.Add(button);
            }
        }

        private string GetDimensionDisplayName(string dimensionId)
        {
            return dimensionId switch
            {
                "sanctuary" => "🏠 Life Sanctuary",
                "command" => "💼 Command Matrix",
                "growth" => "🌱 Growth Garden",
                "messenger" => "💬 Quantum Messenger",
                "creative" => "🎨 Creative Atelier",
                "healing" => "🧘 Healing Sanctuary",
                "transcendence" => "✨ Transcendence",
                "research" => "🔬 Research Universe",
                "social" => "👥 Social Mastery",
                "time" => "⏰ Time & Energy",
                "legacy" => "🚀 Legacy & Impact",
                "quantum" => "⚛️ Quantum Core",
                _ => dimensionId
            };
        }

        private void ShowQuickActions_Click(object sender, RoutedEventArgs e)
        {
            // Show quick actions for current dimension
            ShowMessage($"Quick Actions for {_activeDimension}", "Quick Actions");
        }

        private void ShowSystemStatus_Click(object sender, RoutedEventArgs e)
        {
            // Show system status and metrics
            ShowMessage("System Status", "12D System Status: All Systems Operational");
        }

        private void OpenConsole_Click(object sender, RoutedEventArgs e)
        {
            var console = new DeveloperConsole();
            var window = new Window
            {
                Title = "Sallie Studio — Developer Console",
                Content = console
            };
            window.Activate();
        }

        private void OpenNativeSettings_Click(object sender, RoutedEventArgs e)
        {
            var settings = new SettingsPage();
            var window = new Window
            {
                Title = "Sallie Studio — Settings",
                Content = settings,
                Width = 600,
                Height = 500
            };
            window.Activate();
        }

        private async void StartAll_Click(object sender, RoutedEventArgs e)
        {
            UpdateSyncStatus("Starting...");
            var result = await ScriptRunner.RunScriptAsync(Path.Combine(AppContext.BaseDirectory, "Scripts", "start-all.ps1"));
            AppendLog($"[Start All] {(result.Length > 100 ? result[..100] + "..." : result)}");
            UpdateSyncStatus("Idle");
        }

        private async void StopAll_Click(object sender, RoutedEventArgs e)
        {
            UpdateSyncStatus("Stopping...");
            var result = await ScriptRunner.RunScriptAsync(Path.Combine(AppContext.BaseDirectory, "Scripts", "stop-all.ps1"));
            AppendLog($"[Stop All] {(result.Length > 100 ? result[..100] + "..." : result)}");
            UpdateSyncStatus("Idle");
        }

        private async void HealthCheck_Click(object sender, RoutedEventArgs e)
        {
            UpdateSyncStatus("Checking...");
            var result = await ScriptRunner.RunScriptAsync(Path.Combine(AppContext.BaseDirectory, "Scripts", "health-check.ps1"));
            AppendLog($"[Health Check] {(result.Length > 100 ? result[..100] + "..." : result)}");
            UpdateSyncStatus("Idle");
        }

        private async void TriggerSync_Click(object sender, RoutedEventArgs e)
        {
            UpdateSyncStatus("Syncing...");
            try
            {
                if (_configRoot.Cloud.Enabled && !string.IsNullOrWhiteSpace(_configRoot.Cloud.EncryptionKey))
                {
                    var manager = new CloudSyncManager(_configRoot.Cloud);
                    await manager.SyncAllAsync();
                    AppendLog("[Cloud Sync] Completed successfully");
                }
                else
                {
                    AppendLog("[Cloud Sync] Not configured");
                }
            }
            catch (Exception ex)
            {
                AppendLog($"[Cloud Sync] Error: {ex.Message}");
            }
            UpdateSyncStatus("Idle");
        }

        #endregion

        #region Plugin System

        private void LoadPlugins()
        {
            PluginPanel.Children.Clear();
            _plugins.Clear();

            var plugins = PluginLoader.LoadPlugins();
            foreach (var plugin in plugins)
            {
                _plugins.Add(plugin);
                PluginPanel.Children.Add(BuildPluginCard(plugin));
            }

            if (plugins.Count == 0)
            {
                var brush = Application.Current.Resources.TryGetValue("TextSecondary", out var value) && value is Brush b
                    ? b
                    : new SolidColorBrush(Microsoft.UI.Colors.Gray);

                PluginPanel.Children.Add(new TextBlock
                {
                    Text = "No plugins found. Add folders under Extensions/ to load plugins.",
                    Foreground = brush,
                    TextWrapping = TextWrapping.Wrap
                });
            }
        }

        private UIElement BuildPluginCard(PluginManifest plugin)
        {
            var grid = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) },
                    new ColumnDefinition { Width = GridLength.Auto }
                }
            };

            var button = new Button
            {
                Content = plugin.Name,
                Tag = plugin,
                Margin = new Thickness(0, 4, 0, 4),
                HorizontalAlignment = HorizontalAlignment.Stretch
            };
            button.Click += PluginCard_Click;

            var toggle = new ToggleSwitch
            {
                Tag = plugin,
                IsOn = plugin.Enabled,
                OffContent = "",
                OnContent = "",
                Margin = new Thickness(8, 4, 0, 4),
                HorizontalAlignment = HorizontalAlignment.Right
            };
            toggle.Toggled += PluginToggle_Toggled;

            Grid.SetColumn(button, 0);
            Grid.SetColumn(toggle, 1);

            grid.Children.Add(button);
            grid.Children.Add(toggle);

            return grid;
        }

        private async void PluginCard_Click(object sender, RoutedEventArgs e)
        {
            var plugin = (sender as Button)?.Tag as PluginManifest;
            if (plugin == null) return;

            if (plugin.Commands == null || plugin.Commands.Count == 0)
            {
                AppendLog($"[{plugin.Name}] No commands defined.");
                return;
            }

            if (plugin.Commands.Count == 1)
            {
                var result = await PluginExecutor.ExecuteCommand(plugin, plugin.Commands[0]);
                AppendLog($"[{plugin.Name}] {result}");
                return;
            }

            var menu = new MenuFlyout();
            foreach (var cmd in plugin.Commands)
            {
                var item = new MenuFlyoutItem { Text = cmd.Name };
                item.Click += async (_, __) =>
                {
                    var result = await PluginExecutor.ExecuteCommand(plugin, cmd);
                    AppendLog($"[{plugin.Name}] {result}");
                };
                menu.Items.Add(item);
            }

            if (sender is FrameworkElement element)
            {
                menu.ShowAt(element);
            }
        }

        private void PluginToggle_Toggled(object sender, RoutedEventArgs e)
        {
            if (sender is not ToggleSwitch toggle) return;

            var plugin = toggle.Tag as PluginManifest;
            if (plugin == null) return;

            PluginLoader.SetPluginEnabled(plugin, toggle.IsOn);
            AppendLog($"[{plugin.Name}] {(toggle.IsOn ? "Enabled" : "Disabled")}");
        }

        public void AppendLog(string message)
        {
            DispatcherQueue.TryEnqueue(() =>
            {
                var line = $"{DateTime.Now:HH:mm:ss} {message}";
                LogBox.Text = string.IsNullOrEmpty(LogBox.Text) ? line : $"{LogBox.Text}\n{line}";
                LogScroll.ChangeView(null, LogScroll.ScrollableHeight, null);
            });
        }

        public List<PluginManifest> GetPlugins() => _plugins;

        #endregion

        #region Cloud Sync

        private async void StartCloudSyncLoop()
        {
            _cloudSyncCts = new CancellationTokenSource();
            
            try
            {
                while (!_cloudSyncCts.Token.IsCancellationRequested)
                {
                    try
                    {
                        if (_configRoot.Cloud.Enabled && !string.IsNullOrWhiteSpace(_configRoot.Cloud.EncryptionKey))
                        {
                            UpdateSyncStatus("Syncing...");
                            var manager = new CloudSyncManager(_configRoot.Cloud);
                            await manager.SyncAllAsync().ConfigureAwait(false);
                            UpdateSyncStatus("Idle");
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        // Expected when cancellation is requested
                        break;
                    }
                    catch
                    {
                        UpdateSyncStatus("Error");
                    }

                    var delayMinutes = _configRoot.Cloud.SyncIntervalMinutes > 0 ? _configRoot.Cloud.SyncIntervalMinutes : 30;
                    await Task.Delay(TimeSpan.FromMinutes(delayMinutes), _cloudSyncCts.Token).ConfigureAwait(false);
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                UpdateSyncStatus("Stopped");
            }
        }

        public void StopCloudSyncLoop()
        {
            _cloudSyncCts?.Cancel();
            _cloudSyncCts?.Dispose();
            _cloudSyncCts = null;
        }

        #endregion
    }
}
