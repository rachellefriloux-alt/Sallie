using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace SallieStudioApp.Helpers
{
    public static class ScriptRunner
    {
        public static async Task<string> RunScriptAsync(string scriptPath, TimeSpan? timeout = null)
        {
            if (string.IsNullOrWhiteSpace(scriptPath) || !File.Exists(scriptPath))
            {
                return "Script not found.";
            }

            var psi = BuildStartInfo(scriptPath);
            var output = new StringBuilder();
            timeout ??= TimeSpan.FromSeconds(60);

            try
            {
                using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };

                process.OutputDataReceived += (_, e) =>
                {
                    if (e.Data != null)
                    {
                        output.AppendLine(e.Data);
                    }
                };
                process.ErrorDataReceived += (_, e) =>
                {
                    if (e.Data != null)
                    {
                        output.AppendLine(e.Data);
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                var exitTask = process.WaitForExitAsync();
                var completed = await Task.WhenAny(exitTask, Task.Delay(timeout.Value));
                if (completed != exitTask)
                {
                    try { process.Kill(); } catch { /* ignore */ }
                    return "Script timed out.";
                }

                await exitTask;

                return output.ToString().Trim();
            }
            catch (Exception ex)
            {
                return $"Failed to run script: {ex.Message}";
            }
        }

        private static ProcessStartInfo BuildStartInfo(string scriptPath)
        {
            var ext = Path.GetExtension(scriptPath).ToLowerInvariant();
            var workingDir = Path.GetDirectoryName(scriptPath) ?? AppContext.BaseDirectory;

            var psi = new ProcessStartInfo
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = workingDir
            };

            switch (ext)
            {
                case ".ps1":
                    psi.FileName = GetPowerShell();
                    psi.Arguments = $"-NoLogo -NonInteractive -ExecutionPolicy Bypass -File \"{scriptPath}\"";
                    break;
                case ".py":
                    psi.FileName = "python";
                    psi.Arguments = $"\"{scriptPath}\"";
                    break;
                case ".sh":
                    psi.FileName = "bash";
                    psi.Arguments = $"\"{scriptPath}\"";
                    break;
                case ".cmd":
                case ".bat":
                    psi.FileName = scriptPath;
                    psi.WorkingDirectory = workingDir;
                    break;
                default:
                    psi.FileName = scriptPath;
                    psi.WorkingDirectory = workingDir;
                    break;
            }

            return psi;
        }

        private static string GetPowerShell()
        {
            return Environment.OSVersion.Platform == PlatformID.Win32NT ? "powershell" : "pwsh";
        }
    }
}
