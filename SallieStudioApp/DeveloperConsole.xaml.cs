using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Documents;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using SallieStudioApp.Helpers;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SallieStudioApp
{
    public sealed partial class DeveloperConsole : Page
    {
        private readonly List<string> _history = new();
        private int _historyIndex = -1;
        private readonly List<(string Text, bool IsError)> _buffer = new();
        private string _filter = string.Empty;
        private readonly string[] _builtins = new[] { "env", "pythonpath", "dockerlogs", "backendlogs", "frontendlogs" };
        private List<string> _completions = new();
        private int _completionIndex = -1;

        public DeveloperConsole()
        {
            this.InitializeComponent();
        }

        private async void RunCommand_Click(object sender, RoutedEventArgs e)
        {
            await ExecuteCommand();
        }

        private async Task ExecuteCommand()
        {
            var cmd = CommandBox.Text.Trim();
            if (string.IsNullOrWhiteSpace(cmd))
            {
                return;
            }

            _history.Add(cmd);
            _historyIndex = _history.Count;
            _completionIndex = -1;
            AppendLine($"> {cmd}", isError: false);

            if (await HandleBuiltIn(cmd))
            {
                CommandBox.Text = string.Empty;
                return;
            }

            await RunProcess(cmd);
            CommandBox.Text = string.Empty;
        }

        private async Task<bool> HandleBuiltIn(string cmd)
        {
            if (cmd.Equals("env", StringComparison.OrdinalIgnoreCase))
            {
                AppendLine(EnvironmentInspector.GetEnvironment(), false);
                return true;
            }

            if (cmd.Equals("pythonpath", StringComparison.OrdinalIgnoreCase))
            {
                AppendLine(EnvironmentInspector.GetPythonPath(), false);
                return true;
            }

            if (cmd.Equals("dockerlogs", StringComparison.OrdinalIgnoreCase))
            {
                var logs = await EnvironmentInspector.GetDockerLogs();
                AppendLine(logs, false);
                return true;
            }

            if (cmd.Equals("backendlogs", StringComparison.OrdinalIgnoreCase))
            {
                AppendLine(EnvironmentInspector.GetBackendLogs(), false);
                return true;
            }

            if (cmd.Equals("frontendlogs", StringComparison.OrdinalIgnoreCase))
            {
                AppendLine(EnvironmentInspector.GetFrontendLogs(), false);
                return true;
            }

            return false;
        }

        private async Task RunProcess(string command)
        {
            var (fileName, arguments) = BuildShell(command);

            var psi = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };

                process.OutputDataReceived += (_, e) =>
                {
                    if (e.Data != null)
                    {
                        _ = DispatcherQueue.TryEnqueue(() => AppendLine(e.Data, false));
                    }
                };

                process.ErrorDataReceived += (_, e) =>
                {
                    if (e.Data != null)
                    {
                        _ = DispatcherQueue.TryEnqueue(() => AppendLine(e.Data, true));
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync();
            }
            catch (Exception ex)
            {
                AppendLine($"Failed to run: {ex.Message}", true);
            }
        }

        private (string fileName, string arguments) BuildShell(string command)
        {
            var shell = (ShellSelector.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "PowerShell";
            switch (shell)
            {
                case "CMD":
                    return ("cmd.exe", $"/c {command}");
                case "Python":
                    return ("python", $"-c \"{command}\"");
                default:
                    return ("powershell.exe", $"-NoLogo -NoProfile -Command \"{command}\"");
            }
        }

        private void AppendLine(string text, bool isError)
        {
            if (string.IsNullOrEmpty(text))
            {
                return;
            }

            foreach (var line in text.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None))
            {
                _buffer.Add((line, isError));
            }

            RenderFromBuffer();
        }

        private void RenderFromBuffer()
        {
            ConsoleOutput.Blocks.Clear();
            foreach (var (text, isError) in _buffer)
            {
                if (!string.IsNullOrWhiteSpace(_filter) && !text.Contains(_filter, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var run = new Run { Text = text + "\n" };
                if (isError)
                {
                    run.Foreground = new SolidColorBrush(Microsoft.UI.Colors.IndianRed);
                }

                ConsoleOutput.Blocks.Add(new Paragraph { Inlines = { run } });
            }

            ScrollToEnd();
        }

        private void ScrollToEnd()
        {
            ConsoleScroll.ChangeView(null, ConsoleScroll.ScrollableHeight, null);
        }

        private void ClearConsole_Click(object sender, RoutedEventArgs e)
        {
            _buffer.Clear();
            ConsoleOutput.Blocks.Clear();
        }

        private void CopyConsole_Click(object sender, RoutedEventArgs e)
        {
            var text = string.Join("\n", _buffer.Select(b => b.Text));
            var data = new Windows.ApplicationModel.DataTransfer.DataPackage();
            data.SetText(text);
            Windows.ApplicationModel.DataTransfer.Clipboard.SetContent(data);
        }

        private async void CommandBox_KeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter)
            {
                await ExecuteCommand();
                e.Handled = true;
            }
            else if (e.Key == Windows.System.VirtualKey.Up)
            {
                if (_historyIndex > 0)
                {
                    _historyIndex--;
                    CommandBox.Text = _history[_historyIndex];
                    CommandBox.Select(CommandBox.Text.Length, 0);
                }
                e.Handled = true;
            }
            else if (e.Key == Windows.System.VirtualKey.Down)
            {
                if (_historyIndex < _history.Count - 1)
                {
                    _historyIndex++;
                    CommandBox.Text = _history[_historyIndex];
                }
                else
                {
                    CommandBox.Text = string.Empty;
                    _historyIndex = _history.Count;
                }
                CommandBox.Select(CommandBox.Text.Length, 0);
                e.Handled = true;
            }
            else if (e.Key == Windows.System.VirtualKey.Tab)
            {
                HandleAutocomplete();
                e.Handled = true;
            }
        }

        private void HandleAutocomplete()
        {
            var current = CommandBox.Text ?? string.Empty;
            if (string.IsNullOrWhiteSpace(current))
            {
                return;
            }

            if (_completions.Count == 0 || !_completions.Any(c => c.StartsWith(current, StringComparison.OrdinalIgnoreCase)))
            {
                _completions = _builtins
                    .Concat(_history)
                    .Distinct()
                    .Where(c => c.StartsWith(current, StringComparison.OrdinalIgnoreCase))
                    .ToList();
                _completionIndex = -1;
            }

            if (_completions.Count == 0)
            {
                return;
            }

            _completionIndex = (_completionIndex + 1) % _completions.Count;
            CommandBox.Text = _completions[_completionIndex];
            CommandBox.Select(CommandBox.Text.Length, 0);
        }

        private void FilterBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _filter = FilterBox.Text ?? string.Empty;
            RenderFromBuffer();
        }
    }
}
