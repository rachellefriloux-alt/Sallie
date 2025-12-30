using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using SallieStudioApp.Cloud;
using SallieStudioApp.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class SetupWizard : Page
    {
        private int _step;
        private readonly string _configPath;
        private TextBox? _repoBox;
        private ComboBox? _profileBox;
        private TextBlock? _dockerStatus;
        private TextBlock? _backendStatus;

        public SetupWizard()
        {
            this.InitializeComponent();
            var baseDir = AppContext.BaseDirectory;
            _configPath = Path.Combine(baseDir, "config", "studio.json");
            LoadStep();
        }

        private void LoadStep()
        {
            WizardContent.Children.Clear();

            switch (_step)
            {
                case 0:
                    StepWelcome();
                    break;
                case 1:
                    StepDetectRepo();
                    break;
                case 2:
                    StepDetectBackend();
                    break;
                case 3:
                    StepDetectDocker();
                    break;
                case 4:
                    StepScanPorts();
                    break;
                case 5:
                    StepCreateProfile();
                    break;
                case 6:
                    StepSummary();
                    break;
            }

            BackButton.Visibility = _step == 0 ? Visibility.Collapsed : Visibility.Visible;
            NextButton.Content = _step == 6 ? "Finish" : "Next";
        }

        private void StepWelcome()
        {
            WizardTitle.Text = "Welcome to Sallie Studio";

            WizardContent.Children.Add(new TextBlock
            {
                Text = "Let's get your environment set up. This will only take a moment.",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16,
                TextWrapping = TextWrapping.Wrap
            });
        }

        private void StepDetectRepo()
        {
            WizardTitle.Text = "Detecting Repository";

            WizardContent.Children.Add(new TextBlock
            {
                Text = "We will try to locate your Sallie repository. Adjust if needed.",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16,
                TextWrapping = TextWrapping.Wrap
            });

            _repoBox = new TextBox
            {
                Text = GuessRepoRoot(),
                Width = 520
            };
            WizardContent.Children.Add(_repoBox);

            var detectButton = new Button
            {
                Content = "Detect Again",
                HorizontalAlignment = HorizontalAlignment.Left
            };
            detectButton.Click += (_, _) =>
            {
                if (_repoBox != null)
                {
                    _repoBox.Text = GuessRepoRoot();
                }
            };
            WizardContent.Children.Add(detectButton);
        }

        private void StepDetectBackend()
        {
            WizardTitle.Text = "Detecting Backend";

            _backendStatus = new TextBlock
            {
                Text = "Checking for progeny_root...",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16,
                TextWrapping = TextWrapping.Wrap
            };
            WizardContent.Children.Add(_backendStatus);

            var repo = GetRepoFromUI();
            var backend = Path.Combine(repo, "progeny_root");

            if (Directory.Exists(backend))
            {
                _backendStatus.Text = $"Found backend at: {backend}";
                _backendStatus.Foreground = ResolvePrimaryBrush();
            }
            else
            {
                _backendStatus.Text = "Backend not found. Update your repo path or create progeny_root.";
            }
        }

        private void StepDetectDocker()
        {
            WizardTitle.Text = "Checking Docker";

            _dockerStatus = new TextBlock
            {
                Text = "Checking Docker Desktop...",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16
            };
            WizardContent.Children.Add(_dockerStatus);

            _ = Task.Run(async () =>
            {
                var running = await IsDockerRunningAsync();
                DispatcherQueue.TryEnqueue(() =>
                {
                    if (_dockerStatus == null) return;
                    _dockerStatus.Text = running
                        ? "Docker is running."
                        : "Docker is not running. Please start Docker Desktop.";
                    _dockerStatus.Foreground = running ? ResolvePrimaryBrush() : ResolveSecondaryBrush();
                });
            });
        }

        private void StepScanPorts()
        {
            WizardTitle.Text = "Scanning Ports";

            var ports = new[] { 8000, 8010, 8200, 8210, 8500, 8510 };
            foreach (var port in ports)
            {
                var free = IsPortFree(port);
                WizardContent.Children.Add(new TextBlock
                {
                    Text = $"{port}: {(free ? "Available" : "In Use")}",
                    Foreground = free ? ResolvePrimaryBrush() : new SolidColorBrush(Microsoft.UI.Colors.IndianRed)
                });
            }
        }

        private void StepCreateProfile()
        {
            WizardTitle.Text = "Create Profile";

            WizardContent.Children.Add(new TextBlock
            {
                Text = "Choose your default environment profile.",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16,
                TextWrapping = TextWrapping.Wrap
            });

            _profileBox = new ComboBox
            {
                Width = 220
            };
            _profileBox.Items.Add("Dev");
            _profileBox.Items.Add("QA");
            _profileBox.Items.Add("Demo");
            _profileBox.SelectedIndex = 0;

            WizardContent.Children.Add(_profileBox);
        }

        private void StepSummary()
        {
            WizardTitle.Text = "Setup Complete";

            WizardContent.Children.Add(new TextBlock
            {
                Text = "Your environment is ready. Click Finish to save config and restart Sallie Studio.",
                Foreground = ResolveSecondaryBrush(),
                FontSize = 16,
                TextWrapping = TextWrapping.Wrap
            });
        }

        private string GuessRepoRoot()
        {
            var user = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            var guesses = new[]
            {
                Path.Combine(user, "Sallie"),
                Path.Combine(user, "Documents", "Sallie"),
                "C:\\Sallie",
                "D:\\Sallie"
            };

            return guesses.FirstOrDefault(Directory.Exists) ?? guesses.First();
        }

        private string GetRepoFromUI()
        {
            return _repoBox?.Text ?? GuessRepoRoot();
        }

        private static bool IsPortFree(int port)
        {
            try
            {
                using var listener = new TcpListener(System.Net.IPAddress.Loopback, port);
                listener.Start();
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static Task<bool> IsDockerRunningAsync()
        {
            return Task.Run(() =>
            {
                try
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = "docker",
                        Arguments = "info",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };

                    using var process = Process.Start(psi);
                    if (process == null)
                    {
                        return false;
                    }

                    var output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();
                    return output.Contains("Server Version", StringComparison.OrdinalIgnoreCase);
                }
                catch
                {
                    return false;
                }
            });
        }

        private void SaveConfig()
        {
            var repo = GetRepoFromUI();
            var profile = _profileBox?.SelectedItem?.ToString() ?? "Dev";

            Directory.CreateDirectory(Path.GetDirectoryName(_configPath)!);

            var root = new StudioConfigRoot
            {
                ActiveProfile = profile,
                Cloud = new CloudConfig(),
                Profiles =
                {
                    ["Dev"] = new StudioConfig
                    {
                        Name = "Dev",
                        RepoRoot = repo,
                        ProgenyRootRelative = "progeny_root",
                        PreferredPort = 8000,
                        FallbackPort = 8010
                    },
                    ["QA"] = new StudioConfig
                    {
                        Name = "QA",
                        RepoRoot = repo,
                        ProgenyRootRelative = "progeny_root",
                        PreferredPort = 8200,
                        FallbackPort = 8210
                    },
                    ["Demo"] = new StudioConfig
                    {
                        Name = "Demo",
                        RepoRoot = repo,
                        ProgenyRootRelative = "progeny_root",
                        PreferredPort = 8500,
                        FallbackPort = 8510,
                        ReadOnly = true
                    }
                },
                UpdateChannel = "stable"
            };

            var json = JsonSerializer.Serialize(root, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_configPath, json);
        }

        private async void Next_Click(object sender, RoutedEventArgs e)
        {
            if (_step == 6)
            {
                SaveConfig();
                await RestartAppAsync();
                return;
            }

            _step = Math.Min(6, _step + 1);
            LoadStep();
        }

        private void Back_Click(object sender, RoutedEventArgs e)
        {
            if (_step > 0)
            {
                _step--;
                LoadStep();
            }
        }

        private async Task RestartAppAsync()
        {
            try
            {
                var current = Process.GetCurrentProcess().MainModule?.FileName;
                if (!string.IsNullOrWhiteSpace(current) && File.Exists(current))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = current,
                        UseShellExecute = true
                    });
                }
            }
            catch
            {
                // ignore restart errors; fall back to closing
            }

            DispatcherQueue.TryEnqueue(() => Application.Current.Exit());
        }

        private Brush ResolvePrimaryBrush()
        {
            return Application.Current.Resources.TryGetValue("TextPrimary", out var brush) && brush is Brush b
                ? b
                : new SolidColorBrush(Microsoft.UI.Colors.White);
        }

        private Brush ResolveSecondaryBrush()
        {
            return Application.Current.Resources.TryGetValue("TextSecondary", out var brush) && brush is Brush b
                ? b
                : new SolidColorBrush(Microsoft.UI.Colors.LightGray);
        }
    }
}
