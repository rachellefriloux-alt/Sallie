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
    public sealed partial class ConsciousnessPage : Page
    {
        private HttpClient httpClient;
        private Timer updateTimer;
        private ConsciousnessState currentState;

        public ConsciousnessPage()
        {
            this.InitializeComponent();
            httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri("http://localhost:8000");
            
            // Start real-time updates
            updateTimer = new Timer(UpdateConsciousness, null, 0, 1000); // Update every second
        }

        private async void UpdateConsciousness(object state)
        {
            try
            {
                var response = await httpClient.GetAsync("/consciousness/current");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    currentState = JsonConvert.DeserializeObject<ConsciousnessState>(json);
                    
                    // Update UI on UI thread
                    DispatcherQueue.TryEnqueue(() => UpdateUI());
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating consciousness: {ex.Message}");
            }
        }

        private void UpdateUI()
        {
            if (currentState != null)
            {
                // Update thought displays
                UpdateThoughtsDisplay();
                
                // Update emotion displays
                UpdateEmotionsDisplay();
                
                // Update cognition displays
                UpdateCognitionDisplay();
                
                // Update system displays
                UpdateSystemsDisplay();
            }
        }

        private void UpdateThoughtsDisplay()
        {
            // Update current thoughts display
            // This would update the thoughts tab with current data
        }

        private void UpdateEmotionsDisplay()
        {
            // Update emotional state displays
            // This would update the emotions tab with current limbic state
        }

        private void UpdateCognitionDisplay()
        {
            // Update cognitive process displays
            // This would update the cognition tab with current processes
        }

        private void UpdateSystemsDisplay()
        {
            // Update system activity displays
            // This would update the systems tab with current system states
        }

        private async void OnExportLog(object sender, RoutedEventArgs e)
        {
            try
            {
                var requestData = new
                {
                    filename = $"consciousness_export_{DateTime.Now:yyyyMMdd_HHmmss}.json",
                    hours = 24
                };

                var json = JsonConvert.SerializeObject(requestData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("/consciousness/export", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<ExportResponse>(responseJson);
                    
                    if (result.Success)
                    {
                        // Show success message
                        ShowNotification("Consciousness data exported successfully");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error exporting consciousness data: {ex.Message}");
            }
        }

        private async void OnGetHistory(object sender, RoutedEventArgs e)
        {
            try
            {
                var response = await httpClient.GetAsync("/consciousness/history?hours=24");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var history = JsonConvert.DeserializeObject<ConsciousnessHistory>(json);
                    
                    // Update log display with history
                    UpdateLogDisplay(history);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting consciousness history: {ex.Message}");
            }
        }

        private void UpdateLogDisplay(ConsciousnessHistory history)
        {
            // Update the log viewer with historical data
            // This would populate the log at the bottom of the page
        }

        private void ShowNotification(string message)
        {
            // Show a notification to the user
            // This would use Windows notification system or in-app notification
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            base.OnNavigatedFrom(e);
            updateTimer?.Dispose();
        }
    }

    // Data models for API responses
    public class ConsciousnessState
    {
        public List<ThoughtData> Thoughts { get; set; }
        public EmotionalData Emotion { get; set; }
        public CognitiveData Cognition { get; set; }
        public SystemData System { get; set; }
        public Dictionary<string, float> Limbic { get; set; }
        public double Timestamp { get; set; }
    }

    public class ThoughtData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public float Intensity { get; set; }
        public double Timestamp { get; set; }
    }

    public class EmotionalData
    {
        public double Trust { get; set; }
        public double Warmth { get; set; }
        public double Arousal { get; set; }
        public double Valence { get; set; }
        public string PrimaryEmotion { get; set; }
        public List<string> SecondaryEmotions { get; set; }
        public double Timestamp { get; set; }
    }

    public class CognitiveData
    {
        public List<string> ActiveProcesses { get; set; }
        public Dictionary<string, object> ReasoningState { get; set; }
        public List<string> MemoryAccess { get; set; }
        public double CreativityLevel { get; set; }
        public string MetacognitiveState { get; set; }
        public double Timestamp { get; set; }
    }

    public class SystemData
    {
        public List<string> ActiveSystems { get; set; }
        public Dictionary<string, float> SystemLoad { get; set; }
        public float ProcessingSpeed { get; set; }
        public float NeuralActivity { get; set; }
        public Dictionary<string, object> QuantumState { get; set; }
        public string HealthStatus { get; set; }
        public double Timestamp { get; set; }
    }

    public class ConsciousnessHistory
    {
        public List<ThoughtData> Thoughts { get; set; }
        public List<EmotionalData> Emotions { get; set; }
        public List<CognitiveData> Cognition { get; set; }
        public List<LogEntry> Log { get; set; }
    }

    public class LogEntry
    {
        public string Id { get; set; }
        public double Timestamp { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public float Significance { get; set; }
    }

    public class ExportResponse
    {
        public bool Success { get; set; }
        public string Filename { get; set; }
    }
}
