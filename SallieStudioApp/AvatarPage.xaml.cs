using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SallieStudioApp
{
    public sealed partial class AvatarPage : Page
    {
        private HttpClient httpClient;
        private List<ThoughtForm> availableForms;
        private List<AvatarManifestation> manifestationHistory;

        public AvatarPage()
        {
            this.InitializeComponent();
            httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri("http://localhost:8000");
            
            availableForms = new List<ThoughtForm>();
            manifestationHistory = new List<AvatarManifestation>();
            
            LoadData();
        }

        private async void LoadData()
        {
            await LoadThoughtForms();
            await LoadManifestationHistory();
        }

        private async Task LoadThoughtForms()
        {
            try
            {
                var response = await httpClient.GetAsync("/avatar/infinite/forms");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var data = JsonConvert.DeserializeObject<ThoughtFormsResponse>(json);
                    availableForms = data.Forms;
                    
                    // Update UI
                    UpdateThoughtFormsUI();
                }
            }
            catch (Exception ex)
            {
                // Handle error
                System.Diagnostics.Debug.WriteLine($"Error loading thought forms: {ex.Message}");
            }
        }

        private async Task LoadManifestationHistory()
        {
            try
            {
                var response = await httpClient.GetAsync("/avatar/infinite/current");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var data = JsonConvert.DeserializeObject<CurrentAvatarResponse>(json);
                    
                    if (data.Avatar != null)
                    {
                        manifestationHistory.Insert(0, data.Avatar);
                    }
                    
                    UpdateManifestationHistoryUI();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading manifestation history: {ex.Message}");
            }
        }

        private void UpdateThoughtFormsUI()
        {
            // Update the GridView with thought forms
            // This would be implemented with proper data binding
        }

        private void UpdateManifestationHistoryUI()
        {
            // Update the ListView with manifestation history
            // This would be implemented with proper data binding
        }

        private async void OnManifestThought(object sender, RoutedEventArgs e)
        {
            // Get thought input and emotion
            var thought = ""; // Get from TextBox
            var emotion = "neutral"; // Get from selected RadioButton
            var context = ""; // Get from context TextBox

            try
            {
                var requestData = new
                {
                    thought = thought,
                    emotion = emotion,
                    context = context
                };

                var json = JsonConvert.SerializeObject(requestData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("/avatar/infinite/manifest", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var manifestation = JsonConvert.DeserializeObject<AvatarManifestation>(responseJson);
                    
                    // Add to history
                    manifestationHistory.Insert(0, manifestation);
                    UpdateManifestationHistoryUI();
                    
                    // Update current avatar display
                    UpdateCurrentAvatar(manifestation);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error manifesting avatar: {ex.Message}");
            }
        }

        private void UpdateCurrentAvatar(AvatarManifestation manifestation)
        {
            // Update the current avatar display
            // This would update the visual representation
        }

        private async void OnEvolveAvatar(object sender, RoutedEventArgs e)
        {
            try
            {
                var requestData = new
                {
                    thought = "I'm evolving my appearance",
                    emotion = "curious"
                };

                var json = JsonConvert.SerializeObject(requestData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("/avatar/infinite/evolve", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var manifestation = JsonConvert.DeserializeObject<AvatarManifestation>(responseJson);
                    
                    UpdateCurrentAvatar(manifestation);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error evolving avatar: {ex.Message}");
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
            LoadData();
        }
    }

    // Data models for API responses
    public class ThoughtFormsResponse
    {
        public List<ThoughtForm> Forms { get; set; }
    }

    public class CurrentAvatarResponse
    {
        public AvatarManifestation Avatar { get; set; }
    }

    public class ThoughtForm
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ThoughtType { get; set; }
        public List<string> ColorPalette { get; set; }
        public string EmotionalTone { get; set; }
        public int ComplexityLevel { get; set; }
    }

    public class AvatarManifestation
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Dictionary<string, object> VisualRepresentation { get; set; }
        public List<string> CurrentEmotions { get; set; }
        public string DimensionalProjection { get; set; }
        public double ManifestationStrength { get; set; }
        public double CreatedAt { get; set; }
        public bool Evolving { get; set; }
    }
}
