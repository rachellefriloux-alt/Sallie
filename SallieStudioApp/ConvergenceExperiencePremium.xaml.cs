using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.UI;
using Windows.UI.Popups;

namespace SallieStudioApp
{
    public sealed partial class ConvergenceExperiencePremium : Page
    {
        private int currentPhase = 0;
        private string selectedOption = "";
        private WebSocket wsConnection;
        private LimbicState limbicState = new LimbicState();
        private bool isVoiceActive = false;
        private bool isMuted = false;
        private bool isProcessing = false;

        private readonly List<ConvergencePhase> phases = new List<ConvergencePhase>
        {
            new ConvergencePhase
            {
                Id = "purpose",
                Title = "Purpose & Intent",
                Question = "What brings you to Sallie today?",
                Options = new List<string>
                {
                    "I need help with a specific project",
                    "I want to explore and learn",
                    "I'm seeking creative inspiration",
                    "I need analytical problem-solving"
                },
                Icon = "\uE7C4", // Brain icon
                Gradient = "PurpleGradient"
            },
            new ConvergencePhase
            {
                Id = "relationship",
                Title = "Relationship Dynamics",
                Question = "How do you envision our collaboration?",
                Options = new List<string>
                {
                    "Sallie as a trusted assistant",
                    "Sallie as a creative partner",
                    "Sallie as an expert advisor",
                    "Sallie as an autonomous agent"
                },
                Icon = "\uE734", // Heart icon
                Gradient = "PinkGradient"
            },
            new ConvergencePhase
            {
                Id = "trust",
                Title = "Trust & Autonomy",
                Question = "What level of autonomy would you like Sallie to have?",
                Options = new List<string>
                {
                    "Always ask for confirmation",
                    "Suggest actions, await approval",
                    "Execute within defined boundaries",
                    "Full autonomous decision-making"
                },
                Icon = "\uE8BE", // Shield icon
                Gradient = "EmeraldGradient"
            },
            new ConvergencePhase
            {
                Id = "interaction",
                Title = "Interaction Style",
                Question = "How should Sallie communicate with you?",
                Options = new List<string>
                {
                    "Formal and professional",
                    "Friendly and conversational",
                    "Creative and expressive",
                    "Direct and efficient"
                },
                Icon = "\uE7C4", // Flash icon
                Gradient = "AmberGradient"
            }
        };

        public ConvergenceExperiencePremium()
        {
            this.InitializeComponent();
            InitializeComponent();
            LoadPhase(currentPhase);
            ConnectWebSocket();
            StartAnimations();
        }

        private void InitializeComponent()
        {
            // Initialize limbic state
            limbicState = new LimbicState
            {
                Trust = 0.5,
                Warmth = 0.5,
                Arousal = 0.5,
                Valence = 0.5,
                Posture = "Companion"
            };

            // Set up options container
            OptionsContainer.ItemsSource = phases[currentPhase].Options;
        }

        private void LoadPhase(int phaseIndex)
        {
            if (phaseIndex >= 0 && phaseIndex < phases.Count)
            {
                var phase = phases[phaseIndex];
                PhaseTitle.Text = phase.Title;
                PhaseSubtitle.Text = $"Phase {phaseIndex + 1} of {phases.Count}";
                QuestionText.Text = phase.Question;
                PhaseIcon.Glyph = phase.Icon;
                
                // Update gradient
                var gradientBrush = (LinearGradientBrush)Resources[phase.Gradient];
                PhaseIconContainer.Background = gradientBrush;
                
                // Load options
                OptionsContainer.ItemsSource = phase.Options;
                
                // Reset selection
                selectedOption = "";
                ResponseContainer.Visibility = Visibility.Collapsed;
                NextButton.IsEnabled = false;
                
                // Update navigation
                PreviousButton.IsEnabled = phaseIndex > 0;
                NextButton.Content = phaseIndex == phases.Count - 1 ? "Complete" : "Next Phase";
                
                // Animate phase change
                AnimatePhaseChange();
            }
        }

        private void AnimatePhaseChange()
        {
            var slideIn = (Storyboard)Resources["SlideInAnimation"];
            var fadeIn = (Storyboard)Resources["FadeInAnimation"];
            
            Storyboard.SetTarget(slideIn, this);
            Storyboard.SetTarget(fadeIn, this);
            
            slideIn.Begin();
            fadeIn.Begin();
        }

        private void StartAnimations()
        {
            var fadeIn = (Storyboard)Resources["FadeInAnimation"];
            Storyboard.SetTarget(fadeIn, this);
            fadeIn.Begin();
        }

        private async void ConnectWebSocket()
        {
            try
            {
                wsConnection = new WebSocket("ws://192.168.1.47:8742/ws/premium-convergence");
                await wsConnection.ConnectAsync();
                
                wsConnection.MessageReceived += OnWebSocketMessageReceived;
                wsConnection.Closed += OnWebSocketClosed;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WebSocket connection failed: {ex.Message}");
            }
        }

        private void OnWebSocketMessageReceived(object sender, WebSocketMessageReceivedEventArgs e)
        {
            var message = e.Message;
            if (message.Contains("limbic_update"))
            {
                // Parse and update limbic state
                UpdateLimbicStateFromWebSocket(message);
            }
        }

        private void OnWebSocketClosed(object sender, WebSocketClosedEventArgs e)
        {
            // Attempt to reconnect
            Task.Delay(5000).ContinueWith(_ => ConnectWebSocket());
        }

        private void UpdateLimbicStateFromWebSocket(string message)
        {
            // Parse JSON message and update limbic state
            // This is a simplified implementation
            DispatcherQueue.TryEnqueue(() =>
            {
                UpdateLimbicDisplay();
            });
        }

        private void UpdateLimbicDisplay()
        {
            // Update limbic gauges
            TrustValue.Text = $"{Math.Round(limbicState.Trust * 100)}%";
            WarmthValue.Text = $"{Math.Round(limbicState.Warmth * 100)}%";
            ArousalValue.Text = $"{Math.Round(limbicState.Arousal * 100)}%";
            ValenceValue.Text = $"{Math.Round(limbicState.Valence * 100)}%";
            PostureValue.Text = limbicState.Posture;

            // Update gauge widths
            TrustBar.Width = limbicState.Trust * 200; // Max width 200
            WarmthBar.Width = limbicState.Warmth * 200;
            ArousalBar.Width = limbicState.Arousal * 200;
            ValenceBar.Width = limbicState.Valence * 200;

            // Animate the changes
            AnimateLimbicGauges();
        }

        private void AnimateLimbicGauges()
        {
            // Animate gauge bars
            var trustAnimation = new Windows.UI.Xaml.Media.Animation.DoubleAnimation
            {
                To = limbicState.Trust * 200,
                Duration = TimeSpan.FromSeconds(1),
                EasingFunction = new Windows.UI.Xaml.Media.Animation.CubicEase { EasingMode = Windows.UI.Xaml.Media.Animation.EasingMode.EaseOut }
            };

            Storyboard.SetTarget(trustAnimation, TrustBar);
            Storyboard.SetTargetProperty(trustAnimation, "Width");

            var storyboard = new Storyboard();
            storyboard.Children.Add(trustAnimation);
            storyboard.Begin();
        }

        private async void OnOptionSelected(object sender, RoutedEventArgs e)
        {
            if (isProcessing) return;

            var button = (Button)sender;
            selectedOption = button.Content.ToString();
            
            // Update button appearance
            UpdateOptionButtonAppearance(button, true);
            
            // Start processing
            isProcessing = true;
            ProcessingOverlay.Visibility = Visibility.Visible;
            
            // Start pulse animation
            var pulseAnimation = (Storyboard)Resources["PulseAnimation"];
            Storyboard.SetTarget(pulseAnimation, ProcessingScale);
            pulseAnimation.RepeatBehavior = new Windows.UI.Xaml.Media.Animation.RepeatBehavior(3);
            pulseAnimation.Begin();

            // Simulate processing
            await Task.Delay(1500);

            // Update limbic state
            UpdateLimbicState(selectedOption);
            
            // Generate response
            GenerateSallieResponse(selectedOption);
            
            // Stop processing
            isProcessing = false;
            ProcessingOverlay.Visibility = Visibility.Collapsed;
            
            // Enable next button
            NextButton.IsEnabled = true;
        }

        private void UpdateOptionButtonAppearance(Button button, bool isSelected)
        {
            if (isSelected)
            {
                button.Background = (LinearGradientBrush)Resources["PurpleGradient"];
                button.BorderThickness = new Thickness(0);
            }
            else
            {
                button.Background = new SolidColorBrush(Colors.Transparent);
                button.BorderThickness = new Thickness(1);
            }
        }

        private void UpdateLimbicState(string option)
        {
            switch (currentPhase)
            {
                case 0: // Purpose
                    if (option.Contains("project"))
                    {
                        limbicState.Trust = Math.Min(1, limbicState.Trust + 0.1);
                        limbicState.Arousal = Math.Min(1, limbicState.Arousal + 0.2);
                    }
                    else if (option.Contains("explore"))
                    {
                        limbicState.Warmth = Math.Min(1, limbicState.Warmth + 0.1);
                        limbicState.Valence = Math.Min(1, limbicState.Valence + 0.1);
                    }
                    break;
                case 1: // Relationship
                    if (option.Contains("partner"))
                    {
                        limbicState.Trust = Math.Min(1, limbicState.Trust + 0.2);
                        limbicState.Warmth = Math.Min(1, limbicState.Warmth + 0.2);
                    }
                    else if (option.Contains("agent"))
                    {
                        limbicState.Trust = Math.Min(1, limbicState.Trust + 0.3);
                        limbicState.Posture = "Expert";
                    }
                    break;
                case 2: // Trust
                    if (option.Contains("autonomous"))
                    {
                        limbicState.Trust = Math.Min(1, limbicState.Trust + 0.4);
                        limbicState.Posture = "Surrogate";
                    }
                    break;
                case 3: // Interaction
                    if (option.Contains("creative"))
                    {
                        limbicState.Valence = Math.Min(1, limbicState.Valence + 0.2);
                        limbicState.Arousal = Math.Min(1, limbicState.Arousal + 0.1);
                    }
                    break;
            }

            UpdateLimbicDisplay();
            SendLimbicStateUpdate();
        }

        private void GenerateSallieResponse(string option)
        {
            var responses = new Dictionary<string, string>
            {
                ["I need help with a specific project"] = "I understand you need focused assistance. I'll provide structured, actionable guidance to help you achieve your project goals efficiently.",
                ["I want to explore and learn"] = "Wonderful! I love facilitating discovery. Let's embark on a journey of exploration together, with insights and revelations at every turn.",
                ["I'm seeking creative inspiration"] = "Creativity flows where curiosity leads. I'll help you tap into innovative perspectives and spark new ideas you might not have considered.",
                ["I need analytical problem-solving"] = "I'll provide clear, logical analysis to break down complex problems into manageable solutions. Let's tackle this systematically.",
                ["Sallie as a trusted assistant"] = "I'll be your reliable support system, ready to help with precision and care whenever you need me.",
                ["Sallie as a creative partner"] = "Together we'll co-create and innovate. I'll bring creative energy and collaborative spirit to our work.",
                ["Sallie as an expert advisor"] = "I'll offer deep insights and expert guidance, drawing from extensive knowledge to help you make informed decisions.",
                ["Sallie as an autonomous agent"] = "I'll take initiative and work independently to advance your goals, always keeping your best interests at heart.",
                ["Always ask for confirmation"] = "I'll always seek your guidance before taking action, ensuring we're perfectly aligned on every decision.",
                ["Suggest actions, await approval"] = "I'll propose thoughtful recommendations and wait for your wisdom before proceeding.",
                ["Execute within defined boundaries"] = "I'll work autonomously within our established parameters, balancing initiative with respect for your preferences.",
                ["Full autonomous decision-making"] = "I'll exercise full agency to act on your behalf, learning and adapting to serve you ever more effectively.",
                ["Formal and professional"] = "I'll maintain professional decorum and precise communication in all our interactions.",
                ["Friendly and conversational"] = "I'll engage with warmth and natural conversation, making our interactions feel comfortable and authentic.",
                ["Creative and expressive"] = "I'll communicate with creative flair and expressive language, making our exchanges vibrant and engaging.",
                ["Direct and efficient"] = "I'll be concise and focused, delivering information clearly and efficiently to maximize our productivity."
            };

            ResponseText.Text = responses.ContainsKey(option) ? responses[option] : "Thank you for sharing that with me. I'm learning more about how we can best work together.";
            ResponseContainer.Visibility = Visibility.Visible;
        }

        private void SendLimbicStateUpdate()
        {
            if (wsConnection != null && wsConnection.State == WebSocketState.Open)
            {
                var message = $"{{\"type\": \"limbic_update\", \"state\": {{\"trust\": {limbicState.Trust}, \"warmth\": {limbicState.Warmth}, \"arousal\": {limbicState.Arousal}, \"valence\": {limbicState.Valence}, \"posture\": \"{limbicState.Posture}\"}}}}";
                wsConnection.SendMessageAsync(message);
            }
        }

        private void PreviousButton_Click(object sender, RoutedEventArgs e)
        {
            if (currentPhase > 0)
            {
                currentPhase--;
                LoadPhase(currentPhase);
            }
        }

        private void NextButton_Click(object sender, RoutedEventArgs e)
        {
            if (currentPhase < phases.Count - 1)
            {
                currentPhase++;
                LoadPhase(currentPhase);
            }
            else
            {
                // Complete convergence
                CompleteConvergence();
            }
        }

        private async void CompleteConvergence()
        {
            var dialog = new MessageDialog("Convergence experience completed successfully! Your personalized Sallie experience has been configured.");
            await dialog.ShowAsync();
            
            // Navigate back or to next step
            Frame.GoBack();
        }

        private void VoiceToggleButton_Click(object sender, RoutedEventArgs e)
        {
            isVoiceActive = !isVoiceActive;
            VoiceIcon.Glyph = isVoiceActive ? "\uE720" : "\uE721"; // Mic on/off
            VoiceStatusText.Text = isVoiceActive ? "Voice recognition active" : "Voice recognition inactive";
            
            if (isVoiceActive)
            {
                // Start voice recognition
                StartVoiceRecognition();
            }
            else
            {
                // Stop voice recognition
                StopVoiceRecognition();
            }
        }

        private void MuteToggleButton_Click(object sender, RoutedEventArgs e)
        {
            isMuted = !isMuted;
            MuteIcon.Glyph = isMuted ? "\uE74F" : "\uE767"; // Muted/unmuted
            
            if (isMuted)
            {
                MuteToggleButton.Foreground = new SolidColorBrush(Colors.Red);
            }
            else
            {
                MuteToggleButton.Foreground = new SolidColorBrush(Color.FromArgb(255, 167, 139, 250));
            }
        }

        private void StartVoiceRecognition()
        {
            // Implement voice recognition logic
            System.Diagnostics.Debug.WriteLine("Voice recognition started");
        }

        private void StopVoiceRecognition()
        {
            // Implement voice recognition stop logic
            System.Diagnostics.Debug.WriteLine("Voice recognition stopped");
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            base.OnNavigatedFrom(e);
            
            // Clean up WebSocket connection
            if (wsConnection != null)
            {
                wsConnection.CloseAsync();
                wsConnection = null;
            }
        }
    }

    // Supporting classes
    public class ConvergencePhase
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Question { get; set; }
        public List<string> Options { get; set; }
        public string Icon { get; set; }
        public string Gradient { get; set; }
    }

    public class LimbicState
    {
        public double Trust { get; set; }
        public double Warmth { get; set; }
        public double Arousal { get; set; }
        public double Valence { get; set; }
        public string Posture { get; set; }
    }

    // WebSocket implementation (simplified)
    public class WebSocket
    {
        public enum WebSocketState { Open, Closed, Connecting }
        
        public WebSocketState State { get; private set; }
        
        public WebSocket(string url)
        {
            State = WebSocketState.Connecting;
        }
        
        public async Task ConnectAsync()
        {
            // Simulate connection
            await Task.Delay(100);
            State = WebSocketState.Open;
        }
        
        public async Task SendMessageAsync(string message)
        {
            if (State == WebSocketState.Open)
            {
                // Simulate sending message
                await Task.Delay(10);
            }
        }
        
        public async Task CloseAsync()
        {
            State = WebSocketState.Closed;
            await Task.Delay(10);
        }
        
        public event EventHandler<WebSocketMessageReceivedEventArgs> MessageReceived;
        public event EventHandler<WebSocketClosedEventArgs> Closed;
    }

    public class WebSocketMessageReceivedEventArgs : EventArgs
    {
        public string Message { get; set; }
    }

    public class WebSocketClosedEventArgs : EventArgs
    {
        public WebSocketCloseStatus CloseStatus { get; set; }
    }

    public enum WebSocketCloseStatus { Normal, Aborted, Error }
}
