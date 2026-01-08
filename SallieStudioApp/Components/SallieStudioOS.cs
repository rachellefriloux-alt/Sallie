using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using SallieStudioApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Windows.UI;

namespace SallieStudioApp.Components
{
    public sealed partial class SallieStudioOS : UserControl
    {
        private readonly HttpClient _httpClient = new();
        private SallieLimbicState? _currentLimbicState;
        private SallieCognitiveState? _cognitiveState;
        private string _activeRole = "mom";
        private readonly Dictionary<string, LifeRole> _lifeRoles = new();

        public SallieStudioOS()
        {
            this.InitializeComponent();
            
            InitializeLifeRoles();
            InitializeUI();
            StartPeriodicUpdates();
        }

        private void InitializeLifeRoles()
        {
            _lifeRoles.Add("mom", new LifeRole 
            { 
                Id = "mom", 
                Name = "Mom", 
                Tasks = 12, 
                Priority = "high", 
                Energy = 85,
                Color = "#FF69B4"
            });
            
            _lifeRoles.Add("spouse", new LifeRole 
            { 
                Id = "spouse", 
                Name = "Spouse", 
                Tasks = 8, 
                Priority = "high", 
                Energy = 75,
                Color = "#FF1493"
            });
            
            _lifeRoles.Add("entrepreneur", new LifeRole 
            { 
                Id = "entrepreneur", 
                Name = "Entrepreneur", 
                Tasks = 15, 
                Priority = "high", 
                Energy = 60,
                Color = "#9370DB"
            });
            
            _lifeRoles.Add("creator", new LifeRole 
            { 
                Id = "creator", 
                Name = "Creator", 
                Tasks = 6, 
                Priority = "medium", 
                Energy = 90,
                Color = "#6A5ACD"
            });
            
            _lifeRoles.Add("friend", new LifeRole 
            { 
                Id = "friend", 
                Name = "Friend", 
                Tasks = 4, 
                Priority = "medium", 
                Energy = 70,
                Color = "#4169E1"
            });
            
            _lifeRoles.Add("daughter", new LifeRole 
            { 
                Id = "daughter", 
                Name = "Daughter", 
                Tasks = 3, 
                Priority = "low", 
                Energy = 80,
                Color = "#32CD32"
            });
        }

        private void InitializeUI()
        {
            // Create main grid layout
            var mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Auto) }); // Header
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) }); // Content
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Auto) }); // Status
            
            Content = mainGrid;
            
            // Create header
            CreateHeader(mainGrid);
            
            // Create main content area
            CreateMainContent(mainGrid);
            
            // Create status bar
            CreateStatusBar(mainGrid);
        }

        private void CreateHeader(Grid parent)
        {
            var headerGrid = new Grid();
            headerGrid.Background = new SolidColorBrush(Color.FromArgb(255, 75, 0, 130)); // Purple
            headerGrid.Padding = new Thickness(20);
            
            var titleStack = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                VerticalAlignment = VerticalAlignment.Center
            };
            
            // Sallie icon
            var iconEllipse = new Ellipse
            {
                Width = 40,
                Height = 40,
                Fill = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)) // Violet
            };
            
            var titleText = new TextBlock
            {
                Text = "Sallie Studio OS",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(15, 0, 0, 0)
            };
            
            titleStack.Children.Add(iconEllipse);
            titleStack.Children.Add(titleText);
            
            // Quick actions
            var actionsStack = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Center
            };
            
            var chatButton = CreateModernButton("Chat", null);
            var settingsButton = CreateModernButton("Settings", null);
            
            actionsStack.Children.Add(chatButton);
            actionsStack.Children.Add(settingsButton);
            
            headerGrid.Children.Add(titleStack);
            Grid.SetColumn(titleStack, 0);
            
            headerGrid.Children.Add(actionsStack);
            Grid.SetColumn(actionsStack, 1);
            
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) });
            
            parent.Children.Add(headerGrid);
            Grid.SetRow(headerGrid, 0);
        }

        private void CreateMainContent(Grid parent)
        {
            var contentGrid = new Grid();
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) }); // Sidebar
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(2, GridUnitType.Star) }); // Main
            
            // Create sidebar
            CreateSidebar(contentGrid);
            
            // Create main area
            CreateMainArea(contentGrid);
            
            parent.Children.Add(contentGrid);
            Grid.SetRow(contentGrid, 1);
        }

        private void CreateSidebar(Grid parent)
        {
            var sidebarBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)), // Midnight Blue
                Padding = new Thickness(15),
                Margin = new Thickness(10, 10, 5, 10),
                CornerRadius = new CornerRadius(10)
            };
            
            var sidebarStack = new StackPanel();
            
            var sidebarTitle = new TextBlock
            {
                Text = "Life Roles",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            
            sidebarStack.Children.Add(sidebarTitle);
            
            // Add life role buttons
            foreach (var role in _lifeRoles.Values)
            {
                var roleButton = CreateRoleButton(role);
                sidebarStack.Children.Add(roleButton);
            }
            
            sidebarBorder.Child = sidebarStack;
            parent.Children.Add(sidebarBorder);
            Grid.SetColumn(sidebarBorder, 0);
        }

        private Button CreateRoleButton(LifeRole role)
        {
            var button = new Button
            {
                Content = role.Name,
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 5),
                Padding = new Thickness(15, 10),
                Tag = role.Id
            };
            
            button.Click += (s, e) => SelectRole(role.Id);
            
            return button;
        }

        private void CreateMainArea(Grid parent)
        {
            var mainBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)), // Midnight Blue
                Padding = new Thickness(20),
                Margin = new Thickness(5, 10, 10, 10),
                CornerRadius = new CornerRadius(10)
            };
            
            var mainScroll = new ScrollViewer();
            var mainStack = new StackPanel();
            
            // Create tab system
            var tabGrid = CreateTabSystem();
            mainStack.Children.Add(tabGrid);
            
            // Create content area based on active tab
            var contentArea = new Grid();
            contentArea.Name = "ContentArea";
            mainStack.Children.Add(contentArea);
            
            mainScroll.Content = mainStack;
            mainBorder.Child = mainScroll;
            
            parent.Children.Add(mainBorder);
            Grid.SetColumn(mainBorder, 1);
        }

        private Grid CreateTabSystem()
        {
            var tabGrid = new Grid();
            tabGrid.Margin = new Thickness(0, 0, 0, 20);
            
            var tabStack = new StackPanel
            {
                Orientation = Orientation.Horizontal
            };
            
            var tabs = new[] { "Dashboard", "Sallieverse", "Messenger", "Duality", "LifeOS" };
            
            foreach (var tab in tabs)
            {
                var tabButton = CreateModernButton(tab, null);
                tabButton.Margin = new Thickness(0, 0, 10, 0);
                tabStack.Children.Add(tabButton);
            }
            
            tabGrid.Children.Add(tabStack);
            
            return tabGrid;
        }

        private void CreateStatusBar(Grid parent)
        {
            var statusBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 75, 0, 130)), // Purple
                Padding = new Thickness(15, 10)
            };
            
            var statusStack = new StackPanel
            {
                Orientation = Orientation.Horizontal
            };
            
            var statusText = new TextBlock
            {
                Text = $"Connected to Sallie • {DateTime.Now:HH:mm:ss}",
                Foreground = new SolidColorBrush(Colors.White),
                VerticalAlignment = VerticalAlignment.Center
            };
            
            statusStack.Children.Add(statusText);
            statusBorder.Child = statusStack;
            
            parent.Children.Add(statusBorder);
            Grid.SetRow(statusBorder, 2);
        }

        private Button CreateModernButton(string text, object? tag)
        {
            var button = new Button
            {
                Content = text,
                Background = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)), // Violet
                Foreground = new SolidColorBrush(Colors.White),
                Padding = new Thickness(20, 10),
                Tag = tag,
                Style = (Style)Application.Current.Resources["ModernButtonStyle"]
            };
            
            return button;
        }

        private void SelectRole(string roleId)
        {
            _activeRole = roleId;
            UpdateMainContent();
        }

        private void UpdateMainContent()
        {
            // Update content based on selected role and active tab
            var contentArea = FindName("ContentArea") as Grid;
            if (contentArea != null)
            {
                contentArea.Children.Clear();
                
                if (_lifeRoles.TryGetValue(_activeRole, out var role))
                {
                    var rolePanel = CreateRolePanel(role);
                    contentArea.Children.Add(rolePanel);
                }
            }
        }

        private StackPanel CreateRolePanel(LifeRole role)
        {
            var panel = new StackPanel();
            
            var titleText = new TextBlock
            {
                Text = $"{role.Name} Workspace",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 20)
            };
            
            panel.Children.Add(titleText);
            
            // Add role-specific content
            var statsGrid = new Grid();
            statsGrid.Margin = new Thickness(0, 0, 0, 20);
            
            var tasksText = new TextBlock
            {
                Text = $"Active Tasks: {role.Tasks}",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 16
            };
            
            var energyText = new TextBlock
            {
                Text = $"Energy Level: {role.Energy}%",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 16
            };
            
            statsGrid.Children.Add(tasksText);
            Grid.SetRow(tasksText, 0);
            
            statsGrid.Children.Add(energyText);
            Grid.SetRow(energyText, 1);
            
            statsGrid.RowDefinitions.Add(new RowDefinition());
            statsGrid.RowDefinitions.Add(new RowDefinition());
            
            panel.Children.Add(statsGrid);
            
            // Add action button
            var actionButton = CreateModernButton("Let Sallie Handle It", null);
            actionButton.Click += async (s, e) => await HandleTaskAutomation(role);
            
            panel.Children.Add(actionButton);
            
            return panel;
        }

        private async Task HandleTaskAutomation(LifeRole role)
        {
            try
            {
                // Call backend to automate tasks for this role
                var response = await _httpClient.PostAsJsonAsync("http://192.168.1.47:8742/automate/role", new { roleId = role.Id });
                
                if (response.IsSuccessStatusCode)
                {
                    // Show success message
                    var dialog = new ContentDialog
                    {
                        Title = "Automation Started",
                        Content = $"Sallie is now handling {role.Name} tasks automatically!",
                        CloseButtonText = "OK",
                        XamlRoot = this.XamlRoot
                    };
                    
                    await dialog.ShowAsync();
                }
            }
            catch (Exception ex)
            {
                // Handle error
                var dialog = new ContentDialog
                {
                    Title = "Error",
                    Content = $"Failed to start automation: {ex.Message}",
                    CloseButtonText = "OK",
                    XamlRoot = this.XamlRoot
                };
                
                await dialog.ShowAsync();
            }
        }

        private async void StartPeriodicUpdates()
        {
            var timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(30)
            };
            
            timer.Tick += async (s, e) => await RefreshStates();
            timer.Start();
        }

        private async Task RefreshStates()
        {
            try
            {
                await RefreshLimbicState();
                await RefreshCognitiveState();
                UpdateStatusBar();
            }
            catch (Exception ex)
            {
                // Handle error silently
            }
        }

        private async Task RefreshLimbicState()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://192.168.1.47:8742/limbic");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _currentLimbicState = System.Text.Json.JsonSerializer.Deserialize<SallieLimbicState>(json);
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
        }

        private async Task RefreshCognitiveState()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://192.168.1.47:8742/cognitive");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _cognitiveState = System.Text.Json.JsonSerializer.Deserialize<SallieCognitiveState>(json);
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
        }

        private void UpdateStatusBar()
        {
            // Update status bar with current state
            var statusText = $"Connected to Sallie • Posture: {_currentLimbicState?.DynamicPosture ?? "Unknown"} • {DateTime.Now:HH:mm:ss}";
            
            // Find and update status text block
            var statusBorder = this.FindDescendant<Border>();
            if (statusBorder?.Child is StackPanel stackPanel && stackPanel.Children.FirstOrDefault() is TextBlock textBlock)
            {
                textBlock.Text = statusText;
            }
        }
    }

    public class LifeRole
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Tasks { get; set; }
        public string Priority { get; set; } = string.Empty;
        public int Energy { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public static class Extensions
    {
        public static T? FindDescendant<T>(this DependencyObject element) where T : DependencyObject
        {
            if (element == null) return null;
            
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
            {
                var child = VisualTreeHelper.GetChild(element, i);
                if (child is T result)
                    return result;
                
                var descendant = FindDescendant<T>(child);
                if (descendant != null)
                    return descendant;
            }
            
            return null;
        }
    }
}
