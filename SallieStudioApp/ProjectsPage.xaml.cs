using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class ProjectsPage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private string _currentTab = "projects";
        private List<dynamic> _currentItems = new();

        public ProjectsPage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = LoadProjects();
        }

        private async Task LoadProjects()
        {
            try
            {
                // In a real implementation, this would fetch from API
                // For now, we'll show placeholder data
                _currentItems = new List<dynamic>();
                UpdateItemsList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load: {ex.Message}");
            }
        }

        private async Task LoadExtensions()
        {
            try
            {
                var response = await _httpClient.GetAsync("/extensions");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    // Parse and display extensions
                }
                
                UpdateItemsList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load extensions: {ex.Message}");
            }
        }

        private async Task LoadSkills()
        {
            try
            {
                var response = await _httpClient.GetAsync("/learning/summary");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    // Parse and display skills
                }
                
                UpdateItemsList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load skills: {ex.Message}");
            }
        }

        private void UpdateItemsList()
        {
            ItemsList.Children.Clear();

            if (_currentItems.Count == 0)
            {
                ItemsList.Children.Add(new TextBlock
                {
                    Text = _currentTab switch
                    {
                        "projects" => "No projects yet. Create one to get started!",
                        "extensions" => "No extensions yet. Sallie can create new capabilities!",
                        "skills" => "No skills tracked yet. Start learning together!",
                        _ => "No items"
                    },
                    Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 107, 114, 128)),
                    FontStyle = Windows.UI.Text.FontStyle.Italic,
                    Margin = new Thickness(0, 20, 0, 0)
                });
                return;
            }

            // Add items to list
            foreach (var item in _currentItems)
            {
                var card = CreateItemCard(item);
                ItemsList.Children.Add(card);
            }
        }

        private Border CreateItemCard(dynamic item)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 34, 34, 34)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 55, 65, 81)),
                BorderThickness = new Thickness(1)
            };

            var stack = new StackPanel { Spacing = 4 };

            stack.Children.Add(new TextBlock
            {
                Text = item.Name ?? "Untitled",
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White)
            });

            stack.Children.Add(new TextBlock
            {
                Text = item.Description ?? "",
                FontSize = 12,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 156, 163, 175)),
                TextWrapping = TextWrapping.Wrap
            });

            card.Child = stack;

            // Add click handler
            card.PointerPressed += (s, e) => ShowDetails(item);

            return card;
        }

        private void ShowDetails(dynamic item)
        {
            DetailsPanel.Children.Clear();

            DetailsPanel.Children.Add(new TextBlock
            {
                Text = item.Name ?? "Details",
                FontSize = 18,
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
                Foreground = new SolidColorBrush(Microsoft.UI.Colors.White)
            });

            DetailsPanel.Children.Add(new TextBlock
            {
                Text = item.Description ?? "",
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 156, 163, 175)),
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(0, 8, 0, 0)
            });
        }

        private void Tab_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string tab)
            {
                _currentTab = tab;
                
                switch (tab)
                {
                    case "projects":
                        _ = LoadProjects();
                        break;
                    case "extensions":
                        _ = LoadExtensions();
                        break;
                    case "skills":
                        _ = LoadSkills();
                        break;
                }
            }
        }

        private void Search_Changed(object sender, TextChangedEventArgs e)
        {
            // Filter current items based on search
            UpdateItemsList();
        }

        private async void NewProject_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new ContentDialog
            {
                Title = "Create New Project",
                PrimaryButtonText = "Create",
                CloseButtonText = "Cancel",
                XamlRoot = this.XamlRoot
            };

            var panel = new StackPanel { Spacing = 12 };

            var nameBox = new TextBox { PlaceholderText = "Project name..." };
            panel.Children.Add(nameBox);

            var descBox = new TextBox
            {
                PlaceholderText = "Description...",
                TextWrapping = TextWrapping.Wrap,
                AcceptsReturn = true,
                Height = 100
            };
            panel.Children.Add(descBox);

            var typeCombo = new ComboBox { PlaceholderText = "Project type" };
            typeCombo.Items.Add("Experiment");
            typeCombo.Items.Add("Tool");
            typeCombo.Items.Add("Creative");
            typeCombo.Items.Add("Learning");
            typeCombo.SelectedIndex = 0;
            panel.Children.Add(typeCombo);

            dialog.Content = panel;

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(nameBox.Text))
            {
                await CreateProject(nameBox.Text, descBox.Text, typeCombo.SelectedItem?.ToString() ?? "experiment");
            }
        }

        private async Task CreateProject(string name, string description, string type)
        {
            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(new
                    {
                        project_description = description,
                        project_type = type
                    }),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/learning/create", content);
                if (response.IsSuccessStatusCode)
                {
                    await LoadProjects();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to create project: {ex.Message}");
            }
        }

        private async void NewExtension_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new ContentDialog
            {
                Title = "Propose New Extension",
                PrimaryButtonText = "Propose",
                CloseButtonText = "Cancel",
                XamlRoot = this.XamlRoot
            };

            var panel = new StackPanel { Spacing = 12 };

            panel.Children.Add(new TextBlock
            {
                Text = "Sallie can create new capabilities for herself. Describe what you'd like her to be able to do.",
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 156, 163, 175)),
                TextWrapping = TextWrapping.Wrap
            });

            var nameBox = new TextBox { PlaceholderText = "Extension name..." };
            panel.Children.Add(nameBox);

            var descBox = new TextBox
            {
                PlaceholderText = "What should this extension do?",
                TextWrapping = TextWrapping.Wrap,
                AcceptsReturn = true,
                Height = 100
            };
            panel.Children.Add(descBox);

            var categoryCombo = new ComboBox { PlaceholderText = "Category" };
            categoryCombo.Items.Add("Tool");
            categoryCombo.Items.Add("Integration");
            categoryCombo.Items.Add("Workflow");
            categoryCombo.Items.Add("Creative");
            categoryCombo.Items.Add("Learning");
            categoryCombo.SelectedIndex = 0;
            panel.Children.Add(categoryCombo);

            dialog.Content = panel;

            var result = await dialog.ShowAsync();
            if (result == ContentDialogResult.Primary && !string.IsNullOrWhiteSpace(nameBox.Text))
            {
                await ProposeExtension(nameBox.Text, descBox.Text, categoryCombo.SelectedItem?.ToString()?.ToLower() ?? "tool");
            }
        }

        private async Task ProposeExtension(string name, string description, string category)
        {
            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(new
                    {
                        name = name,
                        description = description,
                        category = category
                    }),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/extensions/propose", content);
                if (response.IsSuccessStatusCode)
                {
                    await LoadExtensions();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to propose extension: {ex.Message}");
            }
        }
    }
}
