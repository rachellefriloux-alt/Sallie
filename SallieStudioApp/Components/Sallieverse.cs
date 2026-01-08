using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml.Shapes;
using SallieStudioApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Windows.UI;

namespace SallieStudioApp.Components
{
    public sealed partial class Sallieverse : UserControl
    {
        private readonly HttpClient _httpClient = new();
        private SallieverseState? _sallieverseState;
        private string _currentRoom = "sanctuary";
        private bool _isInteracting = false;
        
        public Sallieverse()
        {
            this.InitializeComponent();
            
            InitializeSallieverse();
            StartPeriodicUpdates();
        }

        private void InitializeSallieverse()
        {
            var mainGrid = new Grid();
            mainGrid.Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)); // Deep midnight blue
            
            // Create header
            CreateHeader(mainGrid);
            
            // Create main content
            CreateMainContent(mainGrid);
            
            Content = mainGrid;
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
            
            // Sallieverse icon
            var iconEllipse = new Ellipse
            {
                Width = 40,
                Height = 40,
                Fill = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)) // Violet
            };
            
            var titleText = new TextBlock
            {
                Text = "Sallieverse",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(15, 0, 0, 0)
            };
            
            var subtitleText = new TextBlock
            {
                Text = "An immersive world where Sallie lives and grows",
                FontSize = 14,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 200, 200, 200)),
                Margin = new Thickness(15, 5, 0, 0)
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
            
            var talkButton = CreateModernButton("Talk to Sallie");
            var customizeButton = CreateModernButton("Customize");
            
            actionsStack.Children.Add(talkButton);
            actionsStack.Children.Add(customizeButton);
            
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) });
            
            headerGrid.Children.Add(titleStack);
            Grid.SetColumn(titleStack, 0);
            
            headerGrid.Children.Add(subtitleText);
            Grid.SetColumn(subtitleText, 0);
            Grid.SetRow(subtitleText, 1);
            
            headerGrid.Children.Add(actionsStack);
            Grid.SetColumn(actionsStack, 1);
            
            headerGrid.RowDefinitions.Add(new RowDefinition());
            headerGrid.RowDefinitions.Add(new RowDefinition());
            
            parent.Children.Add(headerGrid);
            Grid.SetRow(headerGrid, 0);
        }

        private void CreateMainContent(Grid parent)
        {
            var contentGrid = new Grid();
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) }); // Room navigation
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(2, GridUnitType.Star) }); // Main room view
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) }); // Side panel
            
            // Create room navigation
            CreateRoomNavigation(contentGrid);
            
            // Create main room view
            CreateMainRoomView(contentGrid);
            
            // Create side panel
            CreateSidePanel(contentGrid);
            
            parent.Children.Add(contentGrid);
            Grid.SetRow(contentGrid, 1);
        }

        private void CreateRoomNavigation(Grid parent)
        {
            var navBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                Padding = new Thickness(15),
                Margin = new Thickness(10, 10, 5, 10),
                CornerRadius = new CornerRadius(10)
            };
            
            var navStack = new StackPanel();
            
            var navTitle = new TextBlock
            {
                Text = "Rooms",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            
            navStack.Children.Add(navTitle);
            
            // Add room buttons
            var rooms = GetSallieverseRooms();
            foreach (var room in rooms)
            {
                var roomButton = CreateRoomButton(room);
                navStack.Children.Add(roomButton);
            }
            
            navBorder.Child = navStack;
            parent.Children.Add(navBorder);
            Grid.SetColumn(navBorder, 0);
        }

        private void CreateMainRoomView(Grid parent)
        {
            var roomBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)),
                Padding = new Thickness(20),
                Margin = new Thickness(5, 10, 5, 10),
                CornerRadius = new CornerRadius(10)
            };
            
            var roomGrid = new Grid();
            
            // Create room environment
            var environmentPanel = CreateRoomEnvironment();
            roomGrid.Children.Add(environmentPanel);
            
            roomBorder.Child = roomGrid;
            parent.Children.Add(roomBorder);
            Grid.SetColumn(roomBorder, 1);
        }

        private StackPanel CreateRoomEnvironment()
        {
            var roomPanel = new StackPanel();
            
            var currentRoom = GetSallieverseRooms().Find(r => r.Id == _currentRoom) ?? GetSallieverseRooms()[0];
            
            // Room title
            var roomTitle = new TextBlock
            {
                Text = currentRoom.Name,
                FontSize = 28,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 20)
            };
            
            roomPanel.Children.Add(roomTitle);
            
            // Sallie avatar in environment
            var avatarContainer = new Border
            {
                Background = new LinearGradientBrush
                {
                    StartPoint = new Point(0, 0),
                    EndPoint = new Point(1, 1),
                    GradientStops = new GradientStopCollection
                    {
                        new GradientStop { Color = Color.FromArgb(255, 138, 43, 226), Offset = 0 },
                        new GradientStop { Color = Color.FromArgb(255, 147, 112, 219), Offset = 0.5 },
                        new GradientStop { Color = Color.FromArgb(255, 255, 20, 147), Offset = 1 }
                    }
                },
                Width = 200,
                Height = 200,
                CornerRadius = new CornerRadius(100),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 20, 0, 20)
            };
            
            var avatarText = new TextBlock
            {
                Text = "🦚",
                FontSize = 80,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                TextAlignment = TextAlignment.Center
            };
            
            avatarContainer.Child = avatarText;
            roomPanel.Children.Add(avatarContainer);
            
            // Add environmental effects based on room
            var effectsPanel = CreateEnvironmentalEffects(currentRoom.Id);
            roomPanel.Children.Add(effectsPanel);
            
            // Room description
            var descriptionText = new TextBlock
            {
                Text = currentRoom.Description,
                FontSize = 16,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 200, 200, 200)),
                HorizontalAlignment = HorizontalAlignment.Center,
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 20, 0, 20),
                MaxWidth = 400
            };
            
            roomPanel.Children.Add(descriptionText);
            
            // Interaction options
            var interactionsPanel = CreateInteractionOptions(currentRoom);
            roomPanel.Children.Add(interactionsPanel);
            
            // Sallie's current activity
            var activityPanel = CreateActivityPanel();
            roomPanel.Children.Add(activityPanel);
            
            return roomPanel;
        }

        private StackPanel CreateEnvironmentalEffects(string roomId)
        {
            var effectsPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 10, 0, 10)
            };
            
            switch (roomId)
            {
                case "sanctuary":
                    // Peaceful glow effect
                    var glowEllipse = new Ellipse
                    {
                        Width = 250,
                        Height = 250,
                        Fill = new SolidColorBrush(Color.FromArgb(100, 138, 43, 226)),
                        Margin = new Thickness(-25, -25, -25, -25)
                    };
                    effectsPanel.Children.Add(glowEllipse);
                    break;
                    
                case "garden":
                    // Growing plant
                    var plantText = new TextBlock
                    {
                        Text = "🌱",
                        FontSize = 40,
                        Margin = new Thickness(0, -20, 0, 0)
                    };
                    effectsPanel.Children.Add(plantText);
                    break;
                    
                case "observatory":
                    // Stars
                    for (int i = 0; i < 5; i++)
                    {
                        var star = new TextBlock
                        {
                            Text = "⭐",
                            FontSize = 20,
                            Margin = new Thickness(10, 0, 10, 0)
                        };
                        effectsPanel.Children.Add(star);
                    }
                    break;
                    
                case "workshop":
                    // Gears
                    var gearText = new TextBlock
                    {
                        Text = "⚙️",
                        FontSize = 30,
                        Margin = new Thickness(0, -10, 0, 0)
                    };
                    effectsPanel.Children.Add(gearText);
                    break;
            }
            
            return effectsPanel;
        }

        private StackPanel CreateInteractionOptions(SallieverseRoom room)
        {
            var interactionsPanel = new StackPanel();
            
            var interactionsTitle = new TextBlock
            {
                Text = "Interactions",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 15)
            };
            
            interactionsPanel.Children.Add(interactionsTitle);
            
            var buttonsStack = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center
            };
            
            foreach (var activity in room.Activities.Take(3))
            {
                var button = CreateModernButton(activity);
                button.Click += async (s, e) => await HandleInteraction(activity);
                buttonsStack.Children.Add(button);
            }
            
            interactionsPanel.Children.Add(buttonsStack);
            
            return interactionsPanel;
        }

        private Border CreateActivityPanel()
        {
            var activityBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(20),
                Margin = new Thickness(0, 20, 0, 0),
                MaxWidth = 400
            };
            
            var activityStack = new StackPanel();
            
            var activityTitle = new TextBlock
            {
                Text = "Sallie is currently...",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            var activityText = new TextBlock
            {
                Text = _sallieverseState?.ActivitiesLog?.FirstOrDefault()?.Activity ?? "Resting and thinking of you",
                FontSize = 16,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 5)
            };
            
            var timestampText = new TextBlock
            {
                Text = _sallieverseState?.ActivitiesLog?.FirstOrDefault()?.Timestamp.ToString("HH:mm:ss") ?? DateTime.Now.ToString("HH:mm:ss"),
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 150, 150, 150))
            };
            
            activityStack.Children.Add(activityTitle);
            activityStack.Children.Add(activityText);
            activityStack.Children.Add(timestampText);
            
            activityBorder.Child = activityStack;
            
            return activityBorder;
        }

        private void CreateSidePanel(Grid parent)
        {
            var sideBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                Padding = new Thickness(15),
                Margin = new Thickness(5, 10, 10, 10),
                CornerRadius = new CornerRadius(10)
            };
            
            var sideStack = new StackPanel();
            
            // Evolution Progress
            var evolutionPanel = CreateEvolutionPanel();
            sideStack.Children.Add(evolutionPanel);
            
            // Memories
            var memoriesPanel = CreateMemoriesPanel();
            sideStack.Children.Add(memoriesPanel);
            
            // Environment Controls
            var environmentPanel = CreateEnvironmentControls();
            sideStack.Children.Add(environmentPanel);
            
            sideBorder.Child = sideStack;
            parent.Children.Add(sideBorder);
            Grid.SetColumn(sideBorder, 2);
        }

        private Border CreateEvolutionPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            var stack = new StackPanel();
            
            var title = new TextBlock
            {
                Text = "Evolution Progress",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            var progressText = new TextBlock
            {
                Text = $"{_sallieverseState?.EvolutionProgress ?? 0}%",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 5)
            };
            
            var descriptionText = new TextBlock
            {
                Text = "Sallie grows through interactions",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 150, 150, 150)),
                TextAlignment = TextAlignment.Center
            };
            
            stack.Children.Add(title);
            stack.Children.Add(progressText);
            stack.Children.Add(descriptionText);
            
            panel.Child = stack;
            
            return panel;
        }

        private Border CreateMemoriesPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            var stack = new StackPanel();
            
            var title = new TextBlock
            {
                Text = "Shared Memories",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            var memoriesText = new TextBlock
            {
                Text = (_sallieverseState?.MemoriesCount ?? 0).ToString(),
                FontSize = 32,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 5)
            };
            
            var descriptionText = new TextBlock
            {
                Text = "Memories created together",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 150, 150, 150)),
                TextAlignment = TextAlignment.Center
            };
            
            stack.Children.Add(title);
            stack.Children.Add(memoriesText);
            stack.Children.Add(descriptionText);
            
            panel.Child = stack;
            
            return panel;
        }

        private Border CreateEnvironmentControls()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 0)
            };
            
            var stack = new StackPanel();
            
            var title = new TextBlock
            {
                Text = "Environment",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Margin = new Thickness(0, 0, 0, 10)
            };
            
            stack.Children.Add(title);
            
            // Environment settings
            var lightingText = new TextBlock
            {
                Text = $"Lighting: {_sallieverseState?.MoodLighting ?? "Soft"}",
                FontSize = 12,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 5, 0, 0)
            };
            
            var soundsText = new TextBlock
            {
                Text = $"Sounds: {_sallieverseState?.AmbientSounds ?? "Calm"}",
                FontSize = 12,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 5, 0, 0)
            };
            
            stack.Children.Add(lightingText);
            stack.Children.Add(soundsText);
            
            // Control buttons
            var controlsStack = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0)
            };
            
            var sunButton = CreateControlButton("☀️");
            var moonButton = CreateControlButton("🌙");
            var musicButton = CreateControlButton("🎵");
            
            controlsStack.Children.Add(sunButton);
            controlsStack.Children.Add(moonButton);
            controlsStack.Children.Add(musicButton);
            
            stack.Children.Add(controlsStack);
            
            panel.Child = stack;
            
            return panel;
        }

        private Button CreateModernButton(string content)
        {
            var button = new Button
            {
                Content = content,
                Background = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Foreground = new SolidColorBrush(Colors.White),
                Padding = new Thickness(20, 10),
                Margin = new Thickness(5),
                BorderThickness = new Thickness(0)
            };
            
            return button;
        }

        private Button CreateRoomButton(SallieverseRoom room)
        {
            var button = new Button
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                Padding = new Thickness(15, 10),
                Margin = new Thickness(0, 5),
                HorizontalAlignment = HorizontalAlignment.Stretch,
                Tag = room.Id
            };
            
            var buttonStack = new StackPanel
            {
                Orientation = Orientation.Horizontal
            };
            
            var iconEllipse = new Ellipse
            {
                Width = 30,
                Height = 30,
                Fill = new SolidColorBrush(Color.FromArgb(255, room.Color)),
                Margin = new Thickness(0, 0, 10, 0)
            };
            
            var textStack = new StackPanel();
            
            var nameText = new TextBlock
            {
                Text = room.Name,
                FontWeight = FontWeights.Bold,
                FontSize = 14
            };
            
            var descriptionText = new TextBlock
            {
                Text = room.Description,
                FontSize = 10,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 150, 150, 150))
            };
            
            textStack.Children.Add(nameText);
            textStack.Children.Add(descriptionText);
            
            buttonStack.Children.Add(iconEllipse);
            buttonStack.Children.Add(textStack);
            
            button.Content = buttonStack;
            button.Click += (s, e) => SelectRoom(room.Id);
            
            return button;
        }

        private Button CreateControlButton(string icon)
        {
            var button = new Button
            {
                Content = icon,
                Background = new SolidColorBrush(Color.FromArgb(255, 50, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                Width = 40,
                Height = 40,
                Margin = new Thickness(2),
                FontSize = 16
            };
            
            return button;
        }

        private void SelectRoom(string roomId)
        {
            _currentRoom = roomId;
            RefreshMainRoomView();
        }

        private void RefreshMainRoomView()
        {
            // Refresh the main room view
            var contentGrid = FindChild<Grid>(this);
            if (contentGrid != null)
            {
                var roomBorder = contentGrid.Children[1] as Border;
                if (roomBorder?.Child is Grid roomGrid && roomGrid.Children.Count > 0)
                {
                    roomGrid.Children.RemoveAt(0);
                    roomGrid.Children.Add(CreateRoomEnvironment());
                }
            }
        }

        private async Task HandleInteraction(string action)
        {
            if (_isInteracting) return;
            
            _isInteracting = true;
            try
            {
                var response = await _httpClient.PostAsJsonAsync("http://192.168.1.47:8742/sallieverse/interact", new { action, room_id = _currentRoom });
                
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _sallieverseState = System.Text.Json.JsonSerializer.Deserialize<SallieverseState>(json);
                    
                    // Refresh activity panel
                    RefreshActivityPanel();
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
            finally
            {
                _isInteracting = false;
            }
        }

        private void RefreshActivityPanel()
        {
            // Find and refresh activity panel
            var activityPanel = FindChild<Border>(this);
            if (activityPanel?.Child is StackPanel stack && stack.Children.Count > 1)
            {
                var activityText = stack.Children[1] as TextBlock;
                if (activityText != null)
                {
                    activityText.Text = _sallieverseState?.ActivitiesLog?.FirstOrDefault()?.Activity ?? "Resting and thinking of you";
                }
            }
        }

        private List<SallieverseRoom> GetSallieverseRooms()
        {
            return new List<SallieverseRoom>
            {
                new SallieverseRoom
                {
                    Id = "sanctuary",
                    Name = "Sallie's Sanctuary",
                    Description = "A peaceful space for rest and reflection",
                    Color = 0xFF8B008B, // Dark Magenta
                    Activities = new List<string> { "meditation", "dreaming", "emotional processing" }
                },
                new SallieverseRoom
                {
                    Id = "garden",
                    Name = "Memory Garden",
                    Description = "Where memories grow and bloom",
                    Color = 0xFF228B22, // Forest Green
                    Activities = new List<string> { "memory review", "learning integration", "growth reflection" }
                },
                new SallieverseRoom
                {
                    Id = "observatory",
                    Name = "Star Observatory",
                    Description = "For cosmic contemplation and big thinking",
                    Color = 0xFF4169E1, // Royal Blue
                    Activities = new List<string> { "cosmic thinking", "pattern recognition", "future planning" }
                },
                new SallieverseRoom
                {
                    Id = "workshop",
                    Name = "Creation Workshop",
                    Description = "Where ideas come to life",
                    Color = 0xFFFF8C00, // Dark Orange
                    Activities = new List<string> { "creative work", "problem solving", "innovation" }
                },
                new SallieverseRoom
                {
                    Id = "library",
                    Name = "Wisdom Library",
                    Description = "Ancient knowledge and new learning",
                    Color = 0xFF4B0082, // Indigo
                    Activities = new List<string> { "studying", "research", "knowledge synthesis" }
                },
                new SallieverseRoom
                {
                    Id = "terrace",
                    Name = "Sky Terrace",
                    Description = "Open space for connection and conversation",
                    Color = 0xFF00CED1, // Dark Turquoise
                    Activities = new List<string> { "conversation", "connection", "sharing" }
                }
            };
        }

        private async void StartPeriodicUpdates()
        {
            var timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(15)
            };
            
            timer.Tick += async (s, e) => await RefreshSallieverseState();
            timer.Start();
        }

        private async Task RefreshSallieverseState()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://192.168.1.47:8742/sallieverse/state");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _sallieverseState = System.Text.Json.JsonSerializer.Deserialize<SallieverseState>(json);
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
        }

        private T? FindChild<T>(DependencyObject parent) where T : DependencyObject
        {
            if (parent == null) return null;
            
            for (int i = 0; i < Microsoft.UI.Xaml.Media.VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = Microsoft.UI.Xaml.Media.VisualTreeHelper.GetChild(parent, i);
                if (child is T result)
                    return result;
                
                var descendant = FindChild<T>(child);
                if (descendant != null)
                    return descendant;
            }
            
            return null;
        }
    }

    public class SallieverseRoom
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public uint Color { get; set; }
        public List<string> Activities { get; set; } = new();
    }

    public class SallieverseState
    {
        public string CurrentRoom { get; set; } = string.Empty;
        public string EnvironmentState { get; set; } = string.Empty;
        public string MoodLighting { get; set; } = string.Empty;
        public string AmbientSounds { get; set; } = string.Empty;
        public List<string> Decorations { get; set; } = new();
        public int EvolutionProgress { get; set; }
        public int MemoriesCount { get; set; }
        public List<SallieverseActivity> ActivitiesLog { get; set; } = new();
    }

    public class SallieverseActivity
    {
        public DateTime Timestamp { get; set; }
        public string Activity { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
