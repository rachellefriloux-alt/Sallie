using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
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

        public MainWindow()
        {
            this.InitializeComponent();
            
            // Navigate all frames to their respective pages
            ChatFrame.Navigate(typeof(ChatPage));
            LimbicFrame.Navigate(typeof(LimbicPage));
            HeritageFrame.Navigate(typeof(HeritagePage));
            ThoughtsFrame.Navigate(typeof(ThoughtsPage));
            HypothesesFrame.Navigate(typeof(HypothesesPage));
            ConvergenceFrame.Navigate(typeof(ConvergencePage));
            ControlFrame.Navigate(typeof(ControlPage));
            SyncFrame.Navigate(typeof(SyncPage));
            ProjectsFrame.Navigate(typeof(ProjectsPage));
            SettingsFrame.Navigate(typeof(SettingsPage));
            
            LoadConfig();
            LoadPlugins();
            StartCloudSyncLoop();
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
                    Foreground = brush
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
                Margin = new Thickness(0, 4, 0, 4)
            };
            button.Click += PluginCard_Click;

            var toggle = new ToggleSwitch
            {
                Tag = plugin,
                IsOn = plugin.Enabled,
                OffContent = "Disabled",
                OnContent = "Enabled",
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
            if (plugin == null)
            {
                return;
            }

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
            if (sender is not ToggleSwitch toggle)
            {
                return;
            }

            var plugin = toggle.Tag as PluginManifest;
            if (plugin == null)
            {
                return;
            }

            PluginLoader.SetPluginEnabled(plugin, toggle.IsOn);
            AppendLog($"[{plugin.Name}] {(toggle.IsOn ? "Enabled" : "Disabled")}");
        }

        private void AppendLog(string message)
        {
            var line = $"{DateTime.Now:HH:mm:ss} {message}";
            LogBox.Text = string.IsNullOrEmpty(LogBox.Text) ? line : $"{LogBox.Text}\n{line}";
            LogScroll.ChangeView(null, LogScroll.ScrollableHeight, null);
        }

        private async void StartCloudSyncLoop()
        {
            while (true)
            {
                try
                {
                    if (_configRoot.Cloud.Enabled && !string.IsNullOrWhiteSpace(_configRoot.Cloud.EncryptionKey))
                    {
                        var manager = new CloudSyncManager(_configRoot.Cloud);
                        await manager.SyncAllAsync().ConfigureAwait(false);
                    }
                }
                catch
                {
                    // Keep loop alive; optionally log later.
                }

                var delayMinutes = _configRoot.Cloud.SyncIntervalMinutes > 0 ? _configRoot.Cloud.SyncIntervalMinutes : 30;
                await Task.Delay(TimeSpan.FromMinutes(delayMinutes)).ConfigureAwait(false);
            }
        }
    }
}
