using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class ConvergencePage : Page
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl = "http://localhost:8000";
        private int _currentIndex = 0;
        private int _totalQuestions = 15;
        private bool _isStarted = false;
        private bool _isCompleted = false;

        public ConvergencePage()
        {
            this.InitializeComponent();
            _httpClient = new HttpClient { BaseAddress = new Uri(_baseUrl) };
            _ = CheckStatus();
        }

        private async Task CheckStatus()
        {
            try
            {
                var response = await _httpClient.GetAsync("/convergence/status");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("completed", out var completed) && completed.GetBoolean())
                    {
                        _isCompleted = true;
                        ShowCompletionScreen();
                    }
                    else if (data.TryGetProperty("current_index", out var currentIndex))
                    {
                        _currentIndex = currentIndex.GetInt32();
                        if (_currentIndex > 0)
                        {
                            // Resume session
                            _isStarted = true;
                            await LoadCurrentQuestion();
                            UpdateUI();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to check status: {ex.Message}");
            }
        }

        private void UpdateUI()
        {
            // Update progress
            ProgressBar.Value = _currentIndex;
            ProgressText.Text = $"{_currentIndex}/{_totalQuestions}";

            // Update button visibility
            WelcomePanel.Visibility = !_isStarted && !_isCompleted ? Visibility.Visible : Visibility.Collapsed;
            QuestionPanel.Visibility = _isStarted && !_isCompleted ? Visibility.Visible : Visibility.Collapsed;
            CompletionPanel.Visibility = _isCompleted ? Visibility.Visible : Visibility.Collapsed;

            StartBtn.Visibility = !_isStarted && !_isCompleted ? Visibility.Visible : Visibility.Collapsed;
            SubmitBtn.Visibility = _isStarted && !_isCompleted ? Visibility.Visible : Visibility.Collapsed;
            BackBtn.Visibility = _isStarted && _currentIndex > 0 && !_isCompleted ? Visibility.Visible : Visibility.Collapsed;
            FinishBtn.Visibility = _isCompleted ? Visibility.Visible : Visibility.Collapsed;
        }

        private async Task LoadCurrentQuestion()
        {
            try
            {
                var response = await _httpClient.GetAsync("/convergence/question");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    if (data.TryGetProperty("status", out var status) && status.GetString() == "completed")
                    {
                        _isCompleted = true;
                        ShowCompletionScreen();
                        return;
                    }

                    if (data.TryGetProperty("id", out var id))
                    {
                        QuestionNumber.Text = $"Question {id.GetInt32()} of {_totalQuestions}";
                    }

                    if (data.TryGetProperty("text", out var text))
                    {
                        QuestionText.Text = text.GetString() ?? "";
                    }

                    if (data.TryGetProperty("purpose", out var purpose))
                    {
                        QuestionPurpose.Text = purpose.GetString() ?? "";
                    }

                    if (data.TryGetProperty("phase", out var phase))
                    {
                        PhaseSubtitle.Text = $"Phase: {phase.GetString()}";
                    }

                    // Clear previous answer and response
                    AnswerInput.Text = "";
                    ResponseBorder.Visibility = Visibility.Collapsed;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load question: {ex.Message}");
            }
        }

        private async void Start_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var response = await _httpClient.PostAsync("/convergence/start", null);
                if (response.IsSuccessStatusCode)
                {
                    _isStarted = true;
                    _currentIndex = 0;
                    await LoadCurrentQuestion();
                    UpdateUI();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to start convergence: {ex.Message}");
            }
        }

        private async void Submit_Click(object sender, RoutedEventArgs e)
        {
            var answer = AnswerInput.Text?.Trim();
            if (string.IsNullOrEmpty(answer))
            {
                return;
            }

            try
            {
                var requestContent = new StringContent(
                    JsonSerializer.Serialize(new { answer = answer }),
                    Encoding.UTF8,
                    "application/json");

                var response = await _httpClient.PostAsync("/convergence/answer", requestContent);
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var data = JsonSerializer.Deserialize<JsonElement>(content);

                    // Show Sallie's response
                    if (data.TryGetProperty("conversational_response", out var conversationalResponse))
                    {
                        var responseText = conversationalResponse.GetString();
                        if (!string.IsNullOrEmpty(responseText))
                        {
                            ResponseText.Text = responseText;
                            ResponseBorder.Visibility = Visibility.Visible;
                        }
                    }

                    // Check if completed
                    if (data.TryGetProperty("status", out var status) && status.GetString() == "completed")
                    {
                        _isCompleted = true;
                        await Task.Delay(2000); // Let user read response
                        ShowCompletionScreen();
                        return;
                    }

                    // Update progress
                    if (data.TryGetProperty("progress", out var progress))
                    {
                        if (progress.TryGetProperty("current", out var current))
                        {
                            _currentIndex = current.GetInt32();
                        }
                    }

                    // Wait a moment then load next question
                    await Task.Delay(2000);
                    await LoadCurrentQuestion();
                    UpdateUI();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to submit answer: {ex.Message}");
            }
        }

        private void Back_Click(object sender, RoutedEventArgs e)
        {
            // In a real implementation, this would navigate back to previous question
            System.Diagnostics.Debug.WriteLine("Back clicked");
        }

        private void Next_Click(object sender, RoutedEventArgs e)
        {
            // Used when showing response, to move to next question
        }

        private void Finish_Click(object sender, RoutedEventArgs e)
        {
            // Navigate to main chat or dashboard
            if (App.MainWindow is MainWindow mainWindow)
            {
                // Switch to Chat tab
            }
        }

        private void ShowCompletionScreen()
        {
            _isCompleted = true;
            ProgressBar.Value = _totalQuestions;
            ProgressText.Text = $"{_totalQuestions}/{_totalQuestions}";
            UpdateUI();
        }
    }
}
