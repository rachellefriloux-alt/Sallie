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
    public sealed partial class SallieAvatar : UserControl
    {
        private readonly HttpClient _httpClient = new();
        private AvatarState? _currentAvatarState;
        private string _currentForm = "peacock";
        private bool _isCustomizing = false;
        private bool _isAnimating = false;
        
        public static readonly DependencyProperty SizeProperty = 
            DependencyProperty.Register(nameof(Size), typeof(AvatarSize), typeof(SallieAvatar), new PropertyMetadata(AvatarSize.Medium));
        
        public static readonly DependencyProperty InteractiveProperty = 
            DependencyProperty.Register(nameof(Interactive), typeof(bool), typeof(SallieAvatar), new PropertyMetadata(true));

        public AvatarSize Size
        {
            get => (AvatarSize)GetValue(SizeProperty);
            set => SetValue(SizeProperty, value);
        }

        public bool Interactive
        {
            get => (bool)GetValue(InteractiveProperty);
            set => SetValue(InteractiveProperty, value);
        }

        public SallieAvatar()
        {
            this.InitializeComponent();
            
            InitializeAvatar();
            if (Interactive)
            {
                StartPeriodicUpdates();
            }
        }

        private void InitializeAvatar()
        {
            var mainGrid = new Grid();
            mainGrid.Width = GetSizeValue();
            mainGrid.Height = GetSizeValue();
            
            // Create avatar container
            var avatarContainer = new Border
            {
                Background = new LinearGradientBrush
                {
                    StartPoint = new Point(0, 0),
                    EndPoint = new Point(1, 1),
                    GradientStops = new GradientStopCollection
                    {
                        new GradientStop { Color = Color.FromArgb(255, 138, 43, 226), Offset = 0 }, // Violet
                        new GradientStop { Color = Color.FromArgb(255, 147, 112, 219), Offset = 0.5 }, // Medium Purple
                        new GradientStop { Color = Color.FromArgb(255, 255, 20, 147), Offset = 1 } // Deep Pink
                    }
                },
                CornerRadius = new CornerRadius(GetSizeValue() / 2),
                BorderBrush = new SolidColorBrush(Color.FromArgb(255, 255, 255, 255)),
                BorderThickness = new Thickness(2)
            };
            
            // Create peacock pattern overlay
            var patternGrid = new Grid();
            patternGrid.Opacity = 0.3;
            
            // Add peacock feather patterns
            for (int i = 0; i < 8; i++)
            {
                var angle = (i * 45) * Math.PI / 180;
                var feather = CreatePeacockFeather(angle);
                patternGrid.Children.Add(feather);
            }
            
            // Create core avatar
            var coreGrid = new Grid();
            coreGrid.HorizontalAlignment = HorizontalAlignment.Center;
            coreGrid.VerticalAlignment = VerticalAlignment.Center;
            
            var avatarIcon = new TextBlock
            {
                Text = GetAvatarIcon(),
                FontSize = GetIconSize(),
                Foreground = new SolidColorBrush(Colors.White),
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                TextAlignment = TextAlignment.Center
            };
            
            // Add emotional state indicator
            var stateIndicator = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 255, 255, 255)),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(8, 4),
                Margin = new Thickness(0, GetSizeValue() - 30, 0, 0),
                HorizontalAlignment = HorizontalAlignment.Center
            };
            
            var stateText = new TextBlock
            {
                Text = _currentAvatarState?.EmotionalState ?? "Happy",
                FontSize = 10,
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                FontWeight = FontWeights.Bold
            };
            
            stateIndicator.Child = stateText;
            
            // Create energy ring
            var energyRing = new Ellipse
            {
                Stroke = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                StrokeThickness = 2,
                Width = GetSizeValue() + 16,
                Height = GetSizeValue() + 16,
                Margin = new Thickness(-8),
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            
            // Add interactive controls
            var controlsPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                Opacity = 0,
                Margin = new Thickness(0, 0, 0, 40)
            };
            
            var cameraButton = CreateControlButton("📷");
            var paletteButton = CreateControlButton("🎨");
            var settingsButton = CreateControlButton("⚙️");
            
            controlsPanel.Children.Add(cameraButton);
            controlsPanel.Children.Add(paletteButton);
            controlsPanel.Children.Add(settingsButton);
            
            // Create hover effect
            var hoverOverlay = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(128, 0, 0, 0)),
                CornerRadius = new CornerRadius(GetSizeValue() / 2),
                Opacity = 0,
                Child = controlsPanel
            };
            
            // Assemble the avatar
            coreGrid.Children.Add(avatarIcon);
            coreGrid.Children.Add(stateIndicator);
            
            avatarContainer.Child = new Grid
            {
                Children = { patternGrid, coreGrid }
            };
            
            mainGrid.Children.Add(energyRing);
            mainGrid.Children.Add(avatarContainer);
            mainGrid.Children.Add(hoverOverlay);
            
            // Add hover interactions
            avatarContainer.PointerEntered += (s, e) => ShowControls();
            avatarContainer.PointerExited += (s, e) => HideControls();
            
            // Add click interactions
            avatarContainer.Tapped += (s, e) => ToggleCustomization();
            
            // Add animations
            StartAvatarAnimations(avatarContainer, energyRing);
            
            Content = mainGrid;
        }

        private Ellipse CreatePeacockFeather(double angle)
        {
            var feather = new Ellipse
            {
                Width = 20,
                Height = 40,
                Fill = new SolidColorBrush(Color.FromArgb(255, 0, 255, 127)), // Spring Green
                RenderTransform = new CompositeTransform
                {
                    TranslateX = Math.Cos(angle) * (GetSizeValue() / 2 - 10),
                    TranslateY = Math.Sin(angle) * (GetSizeValue() / 2 - 10),
                    Rotation = angle * 180 / Math.PI + 90
                },
                Opacity = 0.6
            };
            
            return feather;
        }

        private Button CreateControlButton(string icon)
        {
            var button = new Button
            {
                Content = icon,
                Background = new SolidColorBrush(Color.FromArgb(255, 255, 255, 255)),
                Foreground = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                Width = 30,
                Height = 30,
                Margin = new Thickness(2),
                FontSize = 16
            };
            
            return button;
        }

        private void ShowControls()
        {
            if (!Interactive) return;
            
            var hoverOverlay = FindChild<Border>(this);
            if (hoverOverlay != null)
            {
                hoverOverlay.Opacity = 1;
            }
        }

        private void HideControls()
        {
            if (!Interactive) return;
            
            var hoverOverlay = FindChild<Border>(this);
            if (hoverOverlay != null)
            {
                hoverOverlay.Opacity = 0;
            }
        }

        private void ToggleCustomization()
        {
            if (!Interactive) return;
            
            _isCustomizing = !_isCustomizing;
            if (_isCustomizing)
            {
                ShowCustomizationPanel();
            }
            else
            {
                HideCustomizationPanel();
            }
        }

        private void ShowCustomizationPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(255, 25, 25, 112)),
                BorderBrush = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                BorderThickness = new Thickness(2),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(20),
                Margin = new Thickness(0, -200, 0, 0),
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Top
            };
            
            var stackPanel = new StackPanel();
            
            var title = new TextBlock
            {
                Text = "Customize Sallie",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            
            stackPanel.Children.Add(title);
            
            // Add form options
            var forms = new[] { "🦚 Peacock", "🔥 Phoenix", "🐉 Dragon", "🦄 Unicorn", "💎 Crystal", "🌌 Cosmic" };
            
            foreach (var form in forms)
            {
                var button = new Button
                {
                    Content = form,
                    Background = new SolidColorBrush(Color.FromArgb(255, 138, 43, 226)),
                    Foreground = new SolidColorBrush(Colors.White),
                    Margin = new Thickness(0, 2),
                    Padding = new Thickness(15, 8)
                };
                
                button.Click += (s, e) => ChangeForm(form.Split(' ')[1]);
                stackPanel.Children.Add(button);
            }
            
            panel.Child = stackPanel;
            
            // Add to parent
            var parent = this.Parent as Panel;
            if (parent != null)
            {
                parent.Children.Add(panel);
            }
        }

        private void HideCustomizationPanel()
        {
            // Find and remove customization panel
            var parent = this.Parent as Panel;
            if (parent != null)
            {
                for (int i = parent.Children.Count - 1; i >= 0; i--)
                {
                    if (parent.Children[i] is Border border && border.Margin.Top < 0)
                    {
                        parent.Children.RemoveAt(i);
                        break;
                    }
                }
            }
        }

        private async void ChangeForm(string newForm)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("http://192.168.1.47:8742/avatar/change-form", new { form_id = newForm.ToLower() });
                
                if (response.IsSuccessStatusCode)
                {
                    _currentForm = newForm.ToLower();
                    RefreshAvatar();
                    HideCustomizationPanel();
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
        }

        private void RefreshAvatar()
        {
            // Reinitialize avatar with new form
            InitializeAvatar();
        }

        private void StartAvatarAnimations(Border avatarContainer, Ellipse energyRing)
        {
            // Pulse animation for energy ring
            var pulseAnimation = new Microsoft.UI.Xaml.Media.Animation.Storyboard();
            
            var pulseAnimation1 = new Microsoft.UI.Xaml.Media.Animation.DoubleAnimation
            {
                From = 1.0,
                To = 1.2,
                Duration = TimeSpan.FromSeconds(2),
                AutoReverse = true,
                RepeatBehavior = new Microsoft.UI.Xaml.Media.Animation.RepeatBehavior(TimeSpan.FromSeconds(4))
            };
            
            Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTarget(pulseAnimation1, energyRing);
            Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(pulseAnimation1, "Width");
            
            var pulseAnimation2 = new Microsoft.UI.Xaml.Media.Animation.DoubleAnimation
            {
                From = 1.0,
                To = 1.2,
                Duration = TimeSpan.FromSeconds(2),
                AutoReverse = true,
                RepeatBehavior = new Microsoft.UI.Xaml.Media.Animation.RepeatBehavior(TimeSpan.FromSeconds(4))
            };
            
            Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTarget(pulseAnimation2, energyRing);
            Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(pulseAnimation2, "Height");
            
            pulseAnimation.Children.Add(pulseAnimation1);
            pulseAnimation.Children.Add(pulseAnimation2);
            
            pulseAnimation.Begin();
        }

        private async void StartPeriodicUpdates()
        {
            var timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(10)
            };
            
            timer.Tick += async (s, e) => await RefreshAvatarState();
            timer.Start();
        }

        private async Task RefreshAvatarState()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://192.168.1.47:8742/avatar/state");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    _currentAvatarState = System.Text.Json.JsonSerializer.Deserialize<AvatarState>(json);
                    
                    // Update UI with new state
                    UpdateStateIndicator();
                }
            }
            catch (Exception ex)
            {
                // Handle error
            }
        }

        private void UpdateStateIndicator()
        {
            // Find and update state indicator
            var stateIndicator = FindChild<Border>(this);
            if (stateIndicator?.Child is TextBlock textBlock)
            {
                textBlock.Text = _currentAvatarState?.EmotionalState ?? "Happy";
            }
        }

        private double GetSizeValue()
        {
            return Size switch
            {
                AvatarSize.Small => 64,
                AvatarSize.Medium => 128,
                AvatarSize.Large => 256,
                _ => 128
            };
        }

        private double GetIconSize()
        {
            return Size switch
            {
                AvatarSize.Small => 24,
                AvatarSize.Medium => 48,
                AvatarSize.Large => 96,
                _ => 48
            };
        }

        private string GetAvatarIcon()
        {
            return _currentForm switch
            {
                "peacock" => "🦚",
                "phoenix" => "🔥",
                "dragon" => "🐉",
                "unicorn" => "🦄",
                "crystal" => "💎",
                "cosmic" => "🌌",
                _ => "🦚"
            };
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

    public enum AvatarSize
    {
        Small,
        Medium,
        Large
    }

    public class AvatarState
    {
        public string CurrentForm { get; set; } = string.Empty;
        public string EmotionalState { get; set; } = string.Empty;
        public int EnergyLevel { get; set; }
        public int EvolutionStage { get; set; }
        public List<string> CustomizationOptions { get; set; } = new();
        public DateTime LastChange { get; set; }
    }
}
