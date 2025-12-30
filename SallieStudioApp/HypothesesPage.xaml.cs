using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public class Hypothesis
    {
        public string Id { get; set; } = "";
        public string Pattern { get; set; } = "";
        public double Weight { get; set; }
        public string Status { get; set; } = "";
        public string Category { get; set; } = "";
        public List<Evidence> Evidence { get; set; } = new();
        public ConditionalBelief? Conditional { get; set; }
    }

    public class Evidence
    {
        public long Timestamp { get; set; }
        public string Observation { get; set; } = "";
    }

    public class ConditionalBelief
    {
        public string BaseBelief { get; set; } = "";
        public string Exception { get; set; } = "";
    }

    public sealed partial class HypothesesPage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private List<Hypothesis> _hypotheses = new();

        public HypothesesPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = LoadHypotheses();
        }

        private async Task LoadHypotheses()
        {
            try
            {
                var response = await _httpClient.GetAsync("/ghost/veto_pending");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);
                    
                    if (data.TryGetProperty("hypotheses", out var hypothesesElement))
                    {
                        _hypotheses = new List<Hypothesis>();
                        foreach (var h in hypothesesElement.EnumerateArray())
                        {
                            _hypotheses.Add(new Hypothesis
                            {
                                Id = h.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "",
                                Pattern = h.TryGetProperty("pattern", out var pattern) ? pattern.GetString() ?? "" : "",
                                Weight = h.TryGetProperty("weight", out var weight) ? weight.GetDouble() : 0,
                                Status = h.TryGetProperty("status", out var status) ? status.GetString() ?? "" : "",
                                Category = h.TryGetProperty("category", out var category) ? category.GetString() ?? "" : ""
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load hypotheses: {ex.Message}");
            }

            UpdateUI();
        }

        private void UpdateUI()
        {
            HypothesesPanel.Children.Clear();

            var pending = _hypotheses.FindAll(h => h.Status == "pending_veto");

            if (pending.Count == 0)
            {
                HypothesesPanel.Children.Add(new TextBlock
                {
                    Text = "No pending hypotheses",
                    Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 107, 114, 128)),
                    FontStyle = Windows.UI.Text.FontStyle.Italic,
                    HorizontalAlignment = HorizontalAlignment.Center,
                    Margin = new Thickness(0, 40, 0, 0)
                });
                return;
            }

            foreach (var hypothesis in pending)
            {
                var card = CreateHypothesisCard(hypothesis);
                HypothesesPanel.Children.Add(card);
            }
        }

        private Border CreateHypothesisCard(Hypothesis hypothesis)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 42, 42)),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(16),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 55, 65, 81)),
                BorderThickness = new Thickness(1)
            };

            var stack = new StackPanel { Spacing = 12 };

            // Header
            var header = new Grid();
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var patternText = new TextBlock
            {
                Text = hypothesis.Pattern,
                FontSize = 16,
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White),
                TextWrapping = TextWrapping.Wrap
            };
            Grid.SetColumn(patternText, 0);
            header.Children.Add(patternText);

            var categoryBadge = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(51, 139, 92, 246)),
                Padding = new Thickness(8, 4, 8, 4),
                CornerRadius = new CornerRadius(4),
                Child = new TextBlock
                {
                    Text = hypothesis.Category,
                    FontSize = 12,
                    Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 167, 139, 250))
                }
            };
            Grid.SetColumn(categoryBadge, 1);
            header.Children.Add(categoryBadge);

            stack.Children.Add(header);

            // Metadata
            var metadata = new TextBlock
            {
                Text = $"Weight: {hypothesis.Weight:F2} | Evidence: {hypothesis.Evidence.Count} observations",
                FontSize = 12,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 107, 114, 128))
            };
            stack.Children.Add(metadata);

            // Actions
            var actions = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Spacing = 8
            };

            var confirmBtn = new Button
            {
                Content = "Confirm",
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 5, 150, 105)),
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White),
                Tag = hypothesis.Id
            };
            confirmBtn.Click += ConfirmBtn_Click;

            var denyBtn = new Button
            {
                Content = "Deny",
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 220, 38, 38)),
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White),
                Tag = hypothesis.Id
            };
            denyBtn.Click += DenyBtn_Click;

            var contextBtn = new Button
            {
                Content = "Add Context",
                Tag = hypothesis.Id
            };
            contextBtn.Click += ContextBtn_Click;

            actions.Children.Add(confirmBtn);
            actions.Children.Add(denyBtn);
            actions.Children.Add(contextBtn);

            stack.Children.Add(actions);

            card.Child = stack;
            return card;
        }

        private async void ConfirmBtn_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string id)
            {
                await HandleAction(id, "confirm");
            }
        }

        private async void DenyBtn_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string id)
            {
                await HandleAction(id, "deny");
            }
        }

        private async void ContextBtn_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string id)
            {
                // Show dialog for context input
                var dialog = new ContentDialog
                {
                    Title = "Add Context",
                    PrimaryButtonText = "Submit",
                    CloseButtonText = "Cancel",
                    XamlRoot = this.XamlRoot
                };

                var textBox = new TextBox
                {
                    PlaceholderText = "Provide additional context...",
                    TextWrapping = TextWrapping.Wrap,
                    AcceptsReturn = true,
                    Height = 100
                };
                dialog.Content = textBox;

                var result = await dialog.ShowAsync();
                if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(textBox.Text))
                {
                    System.Diagnostics.Debug.WriteLine($"Context added for {id}: {textBox.Text}");
                }
            }
        }

        private async Task HandleAction(string hypothesisId, string action)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"Action: {action} on hypothesis {hypothesisId}");
                // In a real implementation, this would call the API
                await LoadHypotheses();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Action failed: {ex.Message}");
            }
        }
    }
}
