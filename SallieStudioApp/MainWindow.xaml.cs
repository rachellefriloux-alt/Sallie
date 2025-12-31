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
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class MainWindow : Window
    {
        private readonly List<PluginManifest> _plugins = new();
        private StudioConfigRoot _configRoot = new();
        private NativeBridge? _bridge;
        private bool _isPluginsPanelVisible = false;
        private const string WEB_APP_URL = "http://localhost:3000";

        public MainWindow()
        {
            this.InitializeComponent();

            LoadConfig();
            LoadPlugins();
            InitializeWebViewAsync();
            StartCloudSyncLoop();
            UpdateVersionText();
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

        private void CoreWebView2_WebMessageReceived(CoreWebView2 sender, CoreWebView2WebMessageReceivedEventArgs args)
        {
            var message = args.WebMessageAsJson;
            _bridge?.HandleWebMessage(message);
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
            return Windows.UI.Color.FromArgb(
                255,
                Convert.ToByte(hex.Substring(0, 2), 16),
                Convert.ToByte(hex.Substring(2, 2), 16),
                Convert.ToByte(hex.Substring(4, 2), 16));
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
            while (true)
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
                catch
                {
                    UpdateSyncStatus("Error");
                }

                var delayMinutes = _configRoot.Cloud.SyncIntervalMinutes > 0 ? _configRoot.Cloud.SyncIntervalMinutes : 30;
                await Task.Delay(TimeSpan.FromMinutes(delayMinutes)).ConfigureAwait(false);
            }
        }

        #endregion
    }
}
