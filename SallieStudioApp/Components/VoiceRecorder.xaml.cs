using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Windows.Media.Capture;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.UI.Popups;

namespace SallieStudioApp.Components
{
    public sealed partial class VoiceRecorder : UserControl
    {
        private MediaCapture _mediaCapture;
        private StorageFile _audioFile;
        private DispatcherTimer _recordingTimer;
        private DispatcherTimer _audioLevelsTimer;
        private Random _random = new Random();
        private int _recordingDuration = 0;
        private bool _isRecording = false;
        private bool _isPaused = false;
        private const int MaxDuration = 60; // seconds

        public event EventHandler<VoiceRecordingCompletedEventArgs> RecordingCompleted;

        public VoiceRecorder()
        {
            this.InitializeComponent();
            InitializeVoiceRecorder();
        }

        private void InitializeVoiceRecorder()
        {
            _recordingTimer = new DispatcherTimer();
            _recordingTimer.Interval = TimeSpan.FromSeconds(1);
            _recordingTimer.Tick += RecordingTimer_Tick;

            _audioLevelsTimer = new DispatcherTimer();
            _audioLevelsTimer.Interval = TimeSpan.FromMilliseconds(100);
            _audioLevelsTimer.Tick += AudioLevelsTimer_Tick;
        }

        private async void VoiceRecordButton_Click(object sender, RoutedEventArgs e)
        {
            if (!_isRecording)
            {
                await StartRecording();
            }
            else
            {
                await StopRecording();
            }
        }

        private async Task StartRecording()
        {
            try
            {
                // Initialize MediaCapture
                _mediaCapture = new MediaCapture();
                await _mediaCapture.InitializeAsync();

                // Create temporary audio file
                _audioFile = await ApplicationData.Current.TemporaryFolder.CreateFileAsync(
                    $"voice_recording_{DateTime.Now:yyyyMMdd_HHmmss}.wav",
                    CreationCollisionOption.ReplaceExisting);

                // Start recording
                await _mediaCapture.StartRecordToStorageFileAsync(
                    MediaEncodingProfile.CreateWav(AudioEncodingQuality.Auto),
                    _audioFile);

                _isRecording = true;
                _isPaused = false;
                _recordingDuration = 0;

                // Update UI
                UpdateRecordingUI(true);

                // Start timers
                _recordingTimer.Start();
                _audioLevelsTimer.Start();

                // Start pulse animation
                PulseStoryboard.Begin();
            }
            catch (Exception ex)
            {
                await ShowErrorDialog("Failed to start recording", ex.Message);
            }
        }

        private async Task StopRecording()
        {
            try
            {
                if (_mediaCapture != null)
                {
                    await _mediaCapture.StopRecordAsync();
                    await _mediaCapture.DisposeAsync();
                    _mediaCapture = null;
                }

                _isRecording = false;
                _isPaused = false;

                // Stop timers
                _recordingTimer.Stop();
                _audioLevelsTimer.Stop();

                // Stop animation
                PulseStoryboard.Stop();

                // Update UI
                UpdateRecordingUI(false);

                // Raise completion event
                if (_audioFile != null)
                {
                    RecordingCompleted?.Invoke(this, new VoiceRecordingCompletedEventArgs
                    {
                        AudioFilePath = _audioFile.Path,
                        Duration = _recordingDuration
                    });
                }
            }
            catch (Exception ex)
            {
                await ShowErrorDialog("Failed to stop recording", ex.Message);
            }
        }

        private async Task PauseRecording()
        {
            try
            {
                if (_mediaCapture != null && _isRecording && !_isPaused)
                {
                    await _mediaCapture.PauseRecordAsync();
                    _isPaused = true;
                    _recordingTimer.Stop();
                    _audioLevelsTimer.Stop();
                    PulseStoryboard.Pause();
                }
                else if (_mediaCapture != null && _isRecording && _isPaused)
                {
                    await _mediaCapture.ResumeRecordAsync();
                    _isPaused = false;
                    _recordingTimer.Start();
                    _audioLevelsTimer.Start();
                    PulseStoryboard.Resume();
                }

                UpdateRecordingUI(_isRecording);
            }
            catch (Exception ex)
            {
                await ShowErrorDialog("Failed to pause/resume recording", ex.Message);
            }
        }

        private async Task CancelRecording()
        {
            try
            {
                if (_mediaCapture != null)
                {
                    await _mediaCapture.DisposeAsync();
                    _mediaCapture = null;
                }

                // Delete temporary file
                if (_audioFile != null)
                {
                    await _audioFile.DeleteAsync();
                    _audioFile = null;
                }

                _isRecording = false;
                _isPaused = false;
                _recordingDuration = 0;

                // Stop timers
                _recordingTimer.Stop();
                _audioLevelsTimer.Stop();

                // Stop animation
                PulseStoryboard.Stop();

                // Update UI
                UpdateRecordingUI(false);
            }
            catch (Exception ex)
            {
                await ShowErrorDialog("Failed to cancel recording", ex.Message);
            }
        }

        private void RecordingTimer_Tick(object sender, object e)
        {
            _recordingDuration++;
            RecordingTimeText.Text = TimeSpan.FromSeconds(_recordingDuration).ToString(@"mm\:ss");

            // Auto-stop at max duration
            if (_recordingDuration >= MaxDuration)
            {
                _ = StopRecording();
            }
        }

        private void AudioLevelsTimer_Tick(object sender, object e)
        {
            // Simulate audio levels with random values
            UpdateAudioLevels();
        }

        private void UpdateAudioLevels()
        {
            var audioLevels = new List<Rectangle>
            { AudioLevel1, AudioLevel2, AudioLevel3, AudioLevel4, AudioLevel5, AudioLevel6, AudioLevel7, AudioLevel8 };

            foreach (var level in audioLevels)
            {
                var randomHeight = _random.Next(5, 40);
                level.Height = randomHeight;

                // Color based on height
                if (randomHeight > 30)
                {
                    level.Fill = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 239, 68, 68)); // Red
                }
                else if (randomHeight > 20)
                {
                    level.Fill = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 245, 158, 11)); // Yellow
                }
                else
                {
                    level.Fill = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 16, 185, 129)); // Green
                }
            }
        }

        private void UpdateRecordingUI(bool isRecording)
        {
            if (isRecording)
            {
                RecordingStatusBorder.Visibility = Visibility.Visible;
                VoiceRecordButton.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 239, 68, 68));
                RecordIcon.Text = "⏹️";
            }
            else
            {
                RecordingStatusBorder.Visibility = Visibility.Collapsed;
                VoiceRecordButton.Background = (SolidColorBrush)Application.Current.Resources["PrimaryBrush"];
                RecordIcon.Text = "🎤";
                RecordingTimeText.Text = "00:00";

                // Reset audio levels
                var audioLevels = new List<Rectangle>
                { AudioLevel1, AudioLevel2, AudioLevel3, AudioLevel4, AudioLevel5, AudioLevel6, AudioLevel7, AudioLevel8 };
                foreach (var level in audioLevels)
                {
                    level.Height = 20;
                    level.Fill = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 16, 185, 129));
                }
            }
        }

        private async void PauseButton_Click(object sender, RoutedEventArgs e)
        {
            await PauseRecording();
        }

        private async void StopButton_Click(object sender, RoutedEventArgs e)
        {
            await StopRecording();
        }

        private async void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            await CancelRecording();
        }

        private void VoiceRecordButton_PointerEntered(object sender, PointerEventArgs e)
        {
            if (!_isRecording)
            {
                VoiceRecordButton.Scale = new System.Numerics.Vector3(1.1, 1.1, 1);
            }
        }

        private void VoiceRecordButton_PointerExited(object sender, PointerEventArgs e)
        {
            VoiceRecordButton.Scale = new System.Numerics.Vector3(1, 1, 1);
        }

        private async Task ShowErrorDialog(string title, string message)
        {
            var dialog = new MessageDialog(message, title);
            await dialog.ShowAsync();
        }

        protected override void OnUnloaded(RoutedEventArgs e)
        {
            base.OnUnloaded(e);
            
            // Cleanup resources
            if (_isRecording)
            {
                _ = CancelRecording();
            }
            
            _recordingTimer?.Stop();
            _audioLevelsTimer?.Stop();
        }
    }

    public class VoiceRecordingCompletedEventArgs : EventArgs
    {
        public string AudioFilePath { get; set; }
        public int Duration { get; set; }
    }
}
