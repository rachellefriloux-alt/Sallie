using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using SallieStudioApp.Cloud;
using SallieStudioApp.Models;
using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class SettingsPage : Page
    {
        private readonly string _configPath;
        private StudioConfigRoot _root = new();
        private StudioConfig _profile = StudioConfig.Default();

        public SettingsPage()
        {
            this.InitializeComponent();
            string baseDir = AppContext.BaseDirectory;
            _configPath = Path.Combine(baseDir, "config", "studio.json");

            LoadConfig();
            PopulateFields();
        }

        private void LoadConfig()
        {
            if (!File.Exists(_configPath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(_configPath)!);
                _root = new StudioConfigRoot();
                _root.Profiles["Dev"] = StudioConfig.Default();
                SaveConfig();
            }

            var json = File.ReadAllText(_configPath);
            _root = JsonSerializer.Deserialize<StudioConfigRoot>(json) ?? new StudioConfigRoot();

            _root.Cloud ??= new CloudConfig();

            if (string.IsNullOrWhiteSpace(_root.ActiveProfile) || !_root.Profiles.ContainsKey(_root.ActiveProfile))
            {
                if (_root.Profiles.Count > 0)
                    _root.ActiveProfile = _root.Profiles.Keys.First();
                else
                {
                    _root.ActiveProfile = "Dev";
                    _root.Profiles["Dev"] = StudioConfig.Default();
                }
            }

            _profile = _root.Profiles[_root.ActiveProfile];
            _profile.Name = _root.ActiveProfile;
        }

        private void SaveConfig()
        {
            _root.Profiles[_profile.Name] = _profile;
            var json = JsonSerializer.Serialize(_root, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_configPath, json);
        }

        private void PopulateFields()
        {
            // Profile dropdown
            foreach (ComboBoxItem item in ProfileSelector.Items)
            {
                if (item.Content?.ToString() == _profile.Name)
                {
                    ProfileSelector.SelectedItem = item;
                    break;
                }
            }

            // Theme dropdown (placeholder until theme switching is implemented)
            ThemeSelector.SelectedIndex = 0; // Dark by default

            RepoRootBox.Text = _profile.RepoRoot;
            ProgenyRootBox.Text = _profile.ProgenyRootRelative;
            PreferredPortBox.Text = _profile.PreferredPort.ToString();
            FallbackPortBox.Text = _profile.FallbackPort.ToString();
            DockerComposeBox.Text = _profile.DockerCompose;

            EnableLoggingBox.IsChecked = true;
            EnableWatcherBox.IsChecked = true;
            ReadOnlyBox.IsChecked = _profile.ReadOnly;
            SilentModeBox.IsChecked = _profile.SilentMode;

            CloudEnabledBox.IsChecked = _root.Cloud.Enabled;
            CloudEndpointBox.Text = _root.Cloud.Endpoint;
            CloudKeyBox.Password = _root.Cloud.EncryptionKey;
            CloudIntervalBox.Text = _root.Cloud.SyncIntervalMinutes.ToString();
            CloudStatusText.Text = _root.Cloud.Enabled ? "Cloud sync enabled" : "Cloud sync disabled";
        }

        private void ProfileSelector_Changed(object sender, SelectionChangedEventArgs e)
        {
            var selected = (ProfileSelector.SelectedItem as ComboBoxItem)?.Content?.ToString();
            if (string.IsNullOrWhiteSpace(selected)) return;

            _root.ActiveProfile = selected;
            if (_root.Profiles.ContainsKey(selected))
            {
                _profile = _root.Profiles[selected];
                _profile.Name = selected;
                PopulateFields();
            }
            SaveConfig();
        }

        private void ThemeSelector_Changed(object sender, SelectionChangedEventArgs e)
        {
            // Theme switching will be implemented in Module 3
        }

        private void RepoRootBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _profile.RepoRoot = RepoRootBox.Text;
            SaveConfig();
        }

        private void ProgenyRootBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _profile.ProgenyRootRelative = ProgenyRootBox.Text;
            SaveConfig();
        }

        private void PreferredPortBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (int.TryParse(PreferredPortBox.Text, out int port))
            {
                _profile.PreferredPort = port;
                SaveConfig();
            }
        }

        private void FallbackPortBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (int.TryParse(FallbackPortBox.Text, out int port))
            {
                _profile.FallbackPort = port;
                SaveConfig();
            }
        }

        private void DockerComposeBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _profile.DockerCompose = DockerComposeBox.Text;
            SaveConfig();
        }

        private void EnableLoggingBox_Changed(object sender, RoutedEventArgs e)
        {
            // Placeholder for logging toggle wiring
        }

        private void EnableWatcherBox_Changed(object sender, RoutedEventArgs e)
        {
            // Placeholder for watcher toggle wiring
        }

        private void ReadOnlyBox_Changed(object sender, RoutedEventArgs e)
        {
            _profile.ReadOnly = ReadOnlyBox.IsChecked == true;
            SaveConfig();
        }

        private void SilentModeBox_Changed(object sender, RoutedEventArgs e)
        {
            _profile.SilentMode = SilentModeBox.IsChecked == true;
            SaveConfig();
        }

        private void CloudEnabledBox_Changed(object sender, RoutedEventArgs e)
        {
            _root.Cloud.Enabled = CloudEnabledBox.IsChecked == true;
            SaveConfig();
            CloudStatusText.Text = _root.Cloud.Enabled ? "Cloud sync enabled" : "Cloud sync disabled";
        }

        private void CloudEndpointBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _root.Cloud.Endpoint = CloudEndpointBox.Text;
            SaveConfig();
        }

        private void CloudKeyBox_Changed(object sender, RoutedEventArgs e)
        {
            _root.Cloud.EncryptionKey = CloudKeyBox.Password;
            SaveConfig();
        }

        private void CloudIntervalBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (int.TryParse(CloudIntervalBox.Text, out var minutes) && minutes > 0)
            {
                _root.Cloud.SyncIntervalMinutes = minutes;
                SaveConfig();
            }
        }

        private async void SyncNow_Click(object sender, RoutedEventArgs e)
        {
            if (!_root.Cloud.Enabled)
            {
                CloudStatusText.Text = "Cloud sync is disabled.";
                return;
            }

            if (string.IsNullOrWhiteSpace(_root.Cloud.EncryptionKey))
            {
                CloudStatusText.Text = "Add an encryption key (Base64).";
                return;
            }

            CloudStatusText.Text = "Syncing...";
            var manager = new CloudSyncManager(_root.Cloud);
            await manager.SyncAllAsync();
            CloudStatusText.Text = "Sync complete.";
        }
    }
}
